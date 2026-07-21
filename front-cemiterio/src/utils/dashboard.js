import { formatDateKey, parseDateValue } from "./date.js";
import { getFalecidoId, getFalecidoIdFromRecord, getFalecidoName, normalizeFalecido } from "./falecido.js";
import { getCovaDisplayMeta, getVisibleBlocks } from "./mapHelpers.js";
import { findQuadraByReference, resolveQuadraDisplay } from "./quadra.js";
import { isSepultamentoVigente } from "./sepultamento.js";
import { getSepulturaCapacity, getSepulturaNumber, getSepulturaQuadraRef } from "./sepultura.js";

const normalizeBoolean = (value) => value === true || String(value).toLowerCase() === "true";

export const getOperationalProcessKey = (process = {}) =>
    JSON.stringify([
        String(process._type || process.type || "Processo"),
        process.id == null ? null : String(process.id),
    ]);

export const isCompletedSepultamento = isSepultamentoVigente;

export const getOperationalProcessDate = (process) =>
    parseDateValue(
        process?.dh_inicio_velorio ||
            process?.data_velorio ||
            process?.dh_sep ||
            process?.dh_exu ||
            process?.data ||
            process?.horario ||
            ""
    );

export const sortOperationalProcesses = (processes = []) =>
    [...(Array.isArray(processes) ? processes : [])].sort((left, right) => {
        const leftDate = getOperationalProcessDate(left);
        const rightDate = getOperationalProcessDate(right);
        const leftTime = leftDate ? leftDate.getTime() : Number.MAX_SAFE_INTEGER;
        const rightTime = rightDate ? rightDate.getTime() : Number.MAX_SAFE_INTEGER;
        return leftTime - rightTime;
    });

export const buildOperationalProcesses = ({
    falecidos = [],
    sepultamentos = [],
    velorios = [],
    exumacoes = [],
    blocks = [],
} = {}) => {
    const normalizedFalecidos = (Array.isArray(falecidos) ? falecidos : []).map(normalizeFalecido);
    const normalizedRecords = [
        ...(Array.isArray(velorios) ? velorios : []).map((record) => ({ ...record, _type: "Velório" })),
        ...(Array.isArray(sepultamentos) ? sepultamentos : []).map((record) => ({
            ...record,
            _type: "Sepultamento",
        })),
        ...(Array.isArray(exumacoes) ? exumacoes : []).map((record) => ({ ...record, _type: "Exumação" })),
    ];

    const processes = normalizedRecords.map((record) => {
        const falecidoId = getFalecidoIdFromRecord(record);
        const falecido = normalizedFalecidos.find((item) => getFalecidoId(item) === String(falecidoId));
        let blockNumber = null;

        if (record._type === "Sepultamento") {
            const blockReference = record.quadra_sep ?? record.quadra ?? record.quadra_cova ?? null;
            const block = (Array.isArray(blocks) ? blocks : []).find(
                (item) =>
                    String(item.id) === String(blockReference) ||
                    String(item.num_quadra) === String(blockReference) ||
                    String(item.number) === String(blockReference) ||
                    (item.nome && String(item.nome).endsWith(String(blockReference)))
            );
            blockNumber = resolveQuadraDisplay(block ?? blockReference, blocks, "");
        }

        return {
            ...record,
            nome_fal: record.nome_sep || record.nome_vel || record.nome_exu || getFalecidoName(falecido) || record.nome,
            falecido: falecido || null,
            quadra_num: blockNumber,
            num_sepultura: getSepulturaNumber(record) || null,
            local: record.local_velorio || record.local || "",
            velorio_inicio: record.dh_inicio_velorio ?? record.data_velorio ?? null,
        };
    });

    return sortOperationalProcesses(
        processes.filter((process) => {
            const status = String(process.status ?? "").toLowerCase();
            const confirmed = normalizeBoolean(process.confirmado);
            return !(status === "concluído" || confirmed || status.includes("aguardando velorio"));
        })
    );
};

const startOfDay = (value) => {
    const date = parseDateValue(value);
    return date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null;
};

const getDashboardRecordCemeteryId = (record = {}, blocks = []) => {
    const directReference =
        record.cemeteryId ?? record.cemiterioId ?? record.cemetery_id ?? record.id_cemiterio ?? null;
    if (directReference != null && directReference !== "") return String(directReference);

    const blockReference =
        record.blockId ??
        record.block_id ??
        record.quadra_sep ??
        record.num_quadra ??
        record.quadra_cova ??
        record.quadra ??
        null;
    const block = findQuadraByReference(blockReference, blocks);
    const cemeteryId = block?.cemeteryId ?? block?.cemiterioId ?? block?.cemetery_id ?? null;
    return cemeteryId == null || cemeteryId === "" ? null : String(cemeteryId);
};

const filterDashboardRecordsByCemetery = (records, selectedCemeteryId, blocks, fallbackRecords = []) => {
    const list = Array.isArray(records) ? records : [];
    if (selectedCemeteryId == null || selectedCemeteryId === "") return list;

    const selectedId = String(selectedCemeteryId);
    return list.filter((record) => {
        const directCemeteryId = getDashboardRecordCemeteryId(record, blocks);
        if (directCemeteryId != null) return directCemeteryId === selectedId;

        const sourceId = record.sepultamento_id ?? record.id_sepultamento ?? record.sepultamentoId ?? null;
        if (sourceId == null || sourceId === "") return false;

        const sourceRecord = fallbackRecords.find(
            (candidate) => String(candidate?.id ?? candidate?._id ?? "") === String(sourceId)
        );
        return getDashboardRecordCemeteryId(sourceRecord, blocks) === selectedId;
    });
};

export const buildDashboardMovementSeries = ({
    sepultamentos = [],
    exumacoes = [],
    blocks = [],
    selectedCemeteryId,
    days = 7,
    referenceDate = new Date(),
} = {}) => {
    const safeDays = Math.max(1, Number(days) || 7);
    const referenceDay = startOfDay(referenceDate) ?? startOfDay(new Date());
    const dates = [];

    for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
        const date = new Date(referenceDay);
        date.setDate(referenceDay.getDate() - offset);
        dates.push(date);
    }

    const countByDate = (records, field) => {
        const counts = new Map();
        (Array.isArray(records) ? records : []).forEach((record) => {
            const key = formatDateKey(record?.[field]);
            if (key) counts.set(key, (counts.get(key) || 0) + 1);
        });
        return dates.map((date) => counts.get(formatDateKey(date)) || 0);
    };

    const visibleSepultamentos = filterDashboardRecordsByCemetery(sepultamentos, selectedCemeteryId, blocks);
    const visibleExumacoes = filterDashboardRecordsByCemetery(
        exumacoes,
        selectedCemeteryId,
        blocks,
        Array.isArray(sepultamentos) ? sepultamentos : []
    );

    return {
        dates,
        labels: dates.map(
            (date) => `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
        ),
        sepultamentos: countByDate(visibleSepultamentos, "dh_sep"),
        exumacoes: countByDate(visibleExumacoes, "dh_exu"),
    };
};

export const getGraveSituationCounts = ({
    graves = [],
    blocks = [],
    sepultamentos = [],
    pets = [],
    selectedCemeteryId,
} = {}) => {
    const visibleBlocks = getVisibleBlocks(blocks, selectedCemeteryId);
    const visibleBlockIds = new Set(visibleBlocks.map((block) => String(block.id)));
    const counters = { available: 0, occupied: 0, private: 0, unavailable: 0, total: 0 };

    (Array.isArray(graves) ? graves : [])
        .filter((grave) => visibleBlockIds.has(getSepulturaQuadraRef(grave)))
        .forEach((grave) => {
            const blockId = getSepulturaQuadraRef(grave);
            const cova = {
                id: grave.id,
                numero: getSepulturaNumber(grave),
                capacidade: getSepulturaCapacity(grave),
                grave,
            };
            const meta = getCovaDisplayMeta(cova, { id: blockId, num_quadra: blockId }, sepultamentos, pets);
            const capacity = Number(getSepulturaCapacity(grave));

            counters.total += 1;
            if (["reservada", "particular_ocupada"].includes(meta.displayStatus)) counters.private += 1;
            else if (meta.displayStatus === "ocupada") counters.occupied += 1;
            else if (meta.displayStatus === "disponivel" && Number.isFinite(capacity) && capacity > 0)
                counters.available += 1;
            else counters.unavailable += 1;
        });

    return counters;
};
