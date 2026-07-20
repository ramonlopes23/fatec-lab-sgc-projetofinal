import { formatDateDMY, formatDateKey, formatDateNormalized, parseDateValue } from "./date.js";
import { findQuadraByReference, resolveQuadraDisplay } from "./quadra.js";

export const getCalendarEventKey = (type, id, sourceIndex) =>
    JSON.stringify([String(type || "Evento"), id == null ? null : String(id), sourceIndex]);

const hasTimePart = (value) => /(?:T|\s)\d{2}:\d{2}/.test(String(value ?? "").trim());

const normalizeBoolean = (value) => value === true || String(value).trim().toLowerCase() === "true";

const normalizeStatus = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export const getCalendarEventStatus = (record = {}) => {
    const status = normalizeStatus(record.status);

    if (normalizeBoolean(record.confirmado) || status.includes("conclu")) {
        return { key: "completed", label: "Concluído" };
    }
    if (status.includes("cancel")) return { key: "cancelled", label: "Cancelado" };
    return { key: "scheduled", label: "Agendado" };
};

const formatTimeLabel = (value) => {
    if (!hasTimePart(value)) return "";

    const date = parseDateValue(value);
    if (!date) return "";

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const getEventPriority = (type) => (type === "Sepultamento" ? 0 : type === "Exumação" ? 1 : 2);

export const compareCalendarEvents = (left, right) => {
    if (left.data !== right.data) return String(left.data).localeCompare(String(right.data));

    const timeComparison = String(left.horario || "").localeCompare(String(right.horario || ""));
    if (timeComparison !== 0) return timeComparison;

    const priorityComparison = getEventPriority(left.tipo) - getEventPriority(right.tipo);
    if (priorityComparison !== 0) return priorityComparison;

    return String(left.nomeFalecido || "").localeCompare(String(right.nomeFalecido || ""));
};

const compareCalendarDayEvents = (left, right) => {
    const priorityComparison = getEventPriority(left.tipo) - getEventPriority(right.tipo);
    if (priorityComparison !== 0) return priorityComparison;

    const timeComparison = String(left.horario || "").localeCompare(String(right.horario || ""));
    if (timeComparison !== 0) return timeComparison;

    return String(left.nomeFalecido || "").localeCompare(String(right.nomeFalecido || ""));
};

export const buildCalendarEvents = ({ sepultamentos = [], exumacoes = [], quadras = [] } = {}) => {
    const normalizedSepultamentos = (Array.isArray(sepultamentos) ? sepultamentos : []).map((record, sourceIndex) => ({
        type: "Sepultamento",
        id: record.id ?? record._id,
        sourceIndex,
        name: record.nome_sep,
        rawDate: record.dh_sep,
        blockReference: record.num_quadra ?? record.quadra_sep,
        graveNumber: record.num_sepultura_sep,
        status: record.status,
        confirmed: record.confirmado,
        extra: {},
    }));

    const normalizedExumacoes = (Array.isArray(exumacoes) ? exumacoes : []).map((record, sourceIndex) => ({
        type: "Exumação",
        id: record.id ?? record._id,
        sourceIndex,
        name: record.nome_sep,
        rawDate: record.dh_exu,
        blockReference: record.quadra_sep ?? record.num_quadra,
        graveNumber: record.num_sepultura_sep,
        status: record.status ?? "",
        confirmed: record.confirmado,
        extra: { motivo: record.motivo, destino: record.destino, coveiro: record.coveiro },
    }));

    return [...normalizedSepultamentos, ...normalizedExumacoes]
        .map((event) => {
            const dateKey = formatDateKey(event.rawDate);
            const dateLabel = formatDateDMY(event.rawDate, "");
            const block = findQuadraByReference(event.blockReference, quadras);
            const eventStatus = getCalendarEventStatus({
                status: event.status,
                confirmado: event.confirmed,
            });

            return {
                id: getCalendarEventKey(event.type, event.id, event.sourceIndex),
                sourceId: event.id,
                nomeFalecido: event.name,
                data: dateKey,
                dataLabel: dateLabel,
                dataHoraLabel: formatDateNormalized(event.rawDate, dateLabel),
                horario: formatTimeLabel(event.rawDate),
                blockId: block?.id ?? event.blockReference ?? null,
                cemeteryId: block?.cemeteryId ?? null,
                quadra: resolveQuadraDisplay(event.blockReference ?? "", quadras, "Sem número"),
                cova: event.graveNumber,
                status: event.status,
                confirmado: normalizeBoolean(event.confirmed),
                statusKey: eventStatus.key,
                statusLabel: eventStatus.label,
                tipo: event.type,
                ...event.extra,
            };
        })
        .filter((event) => Boolean(event.data))
        .sort(compareCalendarEvents);
};

export const getCalendarEventsForDate = (events = [], date = new Date()) => {
    const dateKey = formatDateKey(date);
    if (!dateKey) return [];
    return (Array.isArray(events) ? events : []).filter((event) => event?.data === dateKey);
};

export const groupCalendarEventsByDate = (events = []) => {
    const grouped = {};

    (Array.isArray(events) ? events : []).forEach((event) => {
        if (!event?.data) return;
        if (!grouped[event.data]) grouped[event.data] = [];
        grouped[event.data].push(event);
    });

    Object.values(grouped).forEach((dayEvents) => dayEvents.sort(compareCalendarDayEvents));
    return grouped;
};
