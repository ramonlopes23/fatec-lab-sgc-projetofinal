import database from "../../db.json" with { type: "json" };
import { getCemiterioName } from "../utils/cemiterio.js";
import { getContratoCemiterioName, getContratoNumeroTitulo } from "../utils/contrato.js";
import { parseDateValue } from "../utils/date.js";
import { getFalecidoName } from "../utils/falecido.js";
import { formatQuadraDisplay } from "../utils/quadra.js";
import { formatSepulturaDisplay } from "../utils/sepultura.js";
import { formatCurrencyBRL, getTaxaLabelFromRecord, getTaxaValorFromRecord } from "../utils/taxas.js";

const AUDIT_LOG_PAGE_SIZE = 7;
const UNKNOWN_ACTOR_NAME = "Não identificado";
const UNKNOWN_ACTOR_SOURCE_LABEL = "Registro legado";

const ACTION_META = {
    CREATE: { label: "CRIAR", tone: "create" },
    UPDATE: { label: "ATUALIZAR", tone: "update" },
    DELETE: { label: "EXCLUIR", tone: "delete" },
    LOGIN: { label: "LOGIN", tone: "login" },
    LOGOUT: { label: "LOGOUT", tone: "logout" },
    EXPORT: { label: "EXPORTAR", tone: "export" },
    ACCESS_MODULE: { label: "ACESSAR", tone: "access" },
};

const STATUS_META = {
    success: { label: "Sucesso", tone: "success" },
    warning: { label: "Alerta", tone: "warning" },
    failure: { label: "Falha", tone: "danger" },
};

const COLLECTION_META = {
    falecidos: {
        module: "Falecidos",
        entityType: "falecido",
        entityLabel: "Falecido",
        route: "/registros",
        action: "CREATE",
        timestampFields: ["dh_falec"],
        participantFields: ["nome_resp", "nome_doutor", "nome_fal"],
        additionalFields: ["cpf", "rg", "sexo", "estado_civil", "causa_mortis"],
        changeFields: [
            { field: "nome_fal", label: "Nome" },
            { field: "cpf", label: "CPF" },
            { field: "causa_mortis", label: "Causa mortis" },
        ],
    },
    sepultamentos: {
        module: "Sepultamento",
        entityType: "sepultamento",
        entityLabel: "Sepultamento",
        route: "/cadastros/sepultamento",
        action: "CREATE",
        timestampFields: ["dh_sep"],
        participantFields: ["nome_resp", "nome_titular", "nome", "falecido"],
        additionalFields: ["quadra_sep", "num_sepultura_sep", "taxa_label", "status", "confirmado"],
        changeFields: [
            { field: "status", label: "Status" },
            { field: "taxa_label", label: "Taxa" },
            { field: "quadra_sep", label: "Quadra" },
            { field: "num_sepultura_sep", label: "Sepultura" },
        ],
    },
    velorios: {
        module: "Velório",
        entityType: "velorio",
        entityLabel: "Velório",
        route: "/registros",
        action: "CREATE",
        timestampFields: ["data_velorio", "dh_inicio_velorio"],
        participantFields: ["responsavel_velorio", "nome_vel", "nome_fal"],
        additionalFields: ["local_velorio", "tipo_velorio", "obs_velorio", "status", "confirmado"],
        changeFields: [
            { field: "local_velorio", label: "Local" },
            { field: "tipo_velorio", label: "Tipo" },
            { field: "status", label: "Status" },
        ],
    },
    exumacoes: {
        module: "Exumação",
        entityType: "exumacao",
        entityLabel: "Exumação",
        route: "/registros",
        action: "UPDATE",
        timestampFields: ["dh_exu"],
        participantFields: ["coveiro", "nome_sep"],
        additionalFields: ["quadra_sep", "num_sepultura_sep", "destino", "status", "confirmacao", "motivo"],
        changeFields: [
            { field: "destino", label: "Destino" },
            { field: "status", label: "Status" },
            { field: "confirmacao", label: "Confirmação" },
        ],
    },
    contratos: {
        module: "Contratos",
        entityType: "contrato",
        entityLabel: "Contrato",
        route: "/contratos",
        action: (record) =>
            record?.update_at && record?.created_at && record.update_at !== record.created_at ? "UPDATE" : "CREATE",
        timestampFields: ["update_at", "created_at"],
        participantFields: ["nome_titular", "nome_resp", "holderName"],
        additionalFields: ["quadra", "sepultura", "valor", "status", "vigencia_inicio", "vigencia_fim", "cemiterio"],
        changeFields: [
            { field: "status", label: "Status" },
            { field: "valor", label: "Valor" },
            { field: "vigencia_inicio", label: "Vigência início" },
            { field: "vigencia_fim", label: "Vigência fim" },
        ],
    },
    pets: {
        module: "Pets",
        entityType: "pet",
        entityLabel: "Pet",
        route: "/registros",
        action: "CREATE",
        timestampFields: ["dh_sep_pet"],
        participantFields: ["nome_sep", "nome_pet"],
        additionalFields: ["especie", "raca", "status", "confirmado", "foi_exumado"],
        changeFields: [
            { field: "nome_pet", label: "Nome" },
            { field: "especie", label: "Espécie" },
            { field: "status", label: "Status" },
        ],
    },
};

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const clone = (value) => {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
};

const isValidDate = (value) => Boolean(parseDateValue(value));

const pickFirst = (record, keys) => {
    for (const key of keys) {
        const value = record?.[key];
        if (value != null && String(value).trim() !== "") return value;
    }
    return null;
};

const resolveTimestamp = (record, keys) => pickFirst(record, keys);

const formatTimestampSortKey = (value) => {
    const date = parseDateValue(value);
    return date ? date.getTime() : null;
};

const buildEventCode = (collectionName, recordId) =>
    `AUD-${collectionName.slice(0, 3).toUpperCase()}-${String(recordId || "SEM-ID").toUpperCase()}`;

const buildStatus = (record, collectionName) => {
    const raw = normalizeText(record?.status);

    if (raw.includes("falh") || raw.includes("cancel") || raw.includes("bloque")) return "failure";
    if (
        raw.includes("pend") ||
        raw.includes("aguard") ||
        raw.includes("alert") ||
        raw.includes("inativo") ||
        raw.includes("disponivel") ||
        raw.includes("disponível")
    )
        return "warning";
    if (collectionName === "contratos" && normalizeText(record?.status).includes("ativo")) return "success";
    if (record?.confirmado === false) return "warning";
    return "success";
};

const formatValue = (value) => {
    if (value == null || value === "") return "NÃO REGISTRADO NO DB.JSON";
    if (value === true) return "SIM";
    if (value === false) return "NÃO";
    return String(value);
};

const formatLogFieldValue = (field, record) => {
    if (!record) return formatValue("");

    if (field === "quadra" || field === "quadra_sep") {
        return formatQuadraDisplay(record?.[field], [], "Quadra ", formatValue(record?.[field]));
    }

    if (field === "sepultura" || field === "num_sepultura_sep") {
        return formatSepulturaDisplay(record, "Sepultura ", formatValue(record?.[field]));
    }

    if (field === "nome_fal" || field === "nome_sep" || field === "falecido") {
        return getFalecidoName(record) || formatValue(record?.[field]);
    }

    if (field === "taxa_label") {
        return getTaxaLabelFromRecord(record) || formatValue(record?.[field]);
    }

    if (field === "taxa_valor") {
        return formatCurrencyBRL(getTaxaValorFromRecord(record));
    }

    if (field === "valor") {
        return formatCurrencyBRL(record?.valor);
    }

    if (field === "numero_titulo") {
        return getContratoNumeroTitulo(record) || formatValue(record?.[field]);
    }

    if (field === "cemiterio") {
        return getCemiterioName(record) || getContratoCemiterioName(record) || formatValue(record?.[field]);
    }

    return formatValue(record?.[field]);
};

const resolveParticipant = (record, meta) => pickFirst(record, meta.participantFields || []);

const buildUnknownActor = () => ({
    id: null,
    name: UNKNOWN_ACTOR_NAME,
    username: null,
    role: null,
    isKnown: false,
    sourceField: "legacy",
    sourceLabel: UNKNOWN_ACTOR_SOURCE_LABEL,
});

const normalizeActor = (log) => {
    const actor =
        log?.actor && typeof log.actor === "object"
            ? log.actor
            : log?.user && typeof log.user === "object"
              ? log.user
              : null;
    const name = pickFirst(actor, ["name", "nome", "username", "email"]);
    const isUnknownName = normalizeText(name) === normalizeText(UNKNOWN_ACTOR_NAME);
    const isKnown = actor?.isKnown == null ? Boolean(name) && !isUnknownName : Boolean(actor.isKnown);

    if (!isKnown) return buildUnknownActor();

    return {
        id: actor?.id == null ? null : String(actor.id),
        name: String(name),
        username: actor?.username == null ? null : String(actor.username),
        role: actor?.role == null ? null : String(actor.role),
        isKnown: true,
        sourceField: String(actor?.sourceField || (log?.actor ? "backend-session" : "stored-log")),
        sourceLabel: String(actor?.sourceLabel || (log?.actor ? "Sessão autenticada" : "Log persistido")),
    };
};

const buildEntity = (collectionName, record, meta) => ({
    id: String(record?.id || "-"),
    type: meta.entityType,
    label: meta.entityLabel,
    route: meta.route,
    sourceCollection: collectionName,
});

const buildDescription = (collectionName, record, meta) => {
    const participant = resolveParticipant(record, meta);
    if (collectionName === "falecidos")
        return `Registro de falecimento vinculado a ${getFalecidoName(record) || participant || "registro sem nome"}.`;
    if (collectionName === "sepultamentos")
        return `Sepultamento registrado para ${getFalecidoName(record) || "registro sem nome"}.`;
    if (collectionName === "velorios")
        return `Velório consolidado com status ${formatValue(record?.status).toLowerCase()}.`;
    if (collectionName === "exumacoes")
        return `Exumação registrada com destino ${formatValue(record?.destino).toLowerCase()}.`;
    if (collectionName === "contratos") {
        const holder = participant || "titular não identificado";
        return `Contrato ${getContratoNumeroTitulo(record) || formatValue(record?.numero_titulo)} persistido para ${holder}.`;
    }
    if (collectionName === "pets") return `Pet vinculado ao sepultamento ${formatValue(record?.sepultamento_id)}.`;
    return `Evento rastreável derivado da coleção ${collectionName}.`;
};

const buildChanges = (record, meta) =>
    meta.changeFields.map((change) => ({
        field: change.field,
        label: change.label,
        before: "NÃO DISPONÍVEL NO DB.JSON",
        after: formatLogFieldValue(change.field, record),
    }));

const buildAdditionalInfo = (record, meta) => {
    const info = {};
    meta.additionalFields.forEach((field) => {
        info[field] = formatLogFieldValue(field, record);
    });
    return info;
};

const buildTimeline = (record, meta, timestamp) => [
    {
        label: "Fonte do registro",
        value: `${meta.module} extraído da coleção ${meta.entityType}`,
        timestamp,
    },
    {
        label: "Identificação",
        value: `ID do registro ${formatValue(record?.id)}`,
        timestamp,
    },
    {
        label: "Estado atual",
        value: `Status ${formatValue(record?.status)}`,
        timestamp,
    },
];

const buildLogFromRecord = (collectionName, record, index) => {
    const meta = COLLECTION_META[collectionName];
    if (!meta) return null;

    const timestamp = resolveTimestamp(record, meta.timestampFields);
    if (!timestamp || !isValidDate(timestamp)) return null;

    const action = typeof meta.action === "function" ? meta.action(record) : meta.action;
    const entity = buildEntity(collectionName, record, meta);
    const status = buildStatus(record, collectionName);
    const normalizedTimestamp = parseDateValue(timestamp).toISOString();

    return {
        id: `log-${collectionName}-${String(record?.id || index)}`,
        eventCode: buildEventCode(collectionName, record?.id || index),
        timestamp: normalizedTimestamp,
        status,
        statusLabel: STATUS_META[status]?.label || status,
        action,
        actionLabel: ACTION_META[action]?.label || action,
        module: meta.module,
        description: buildDescription(collectionName, record, meta),
        user: buildUnknownActor(),
        entity,
        changes: buildChanges(record, meta),
        additionalInfo: buildAdditionalInfo(record, meta),
        timeline: buildTimeline(record, meta, normalizedTimestamp),
        sourceCollection: collectionName,
        sourceRecordId: String(record?.id || "-"),
        sourceField: "legacy",
    };
};

const normalizeStoredLog = (log, index) => {
    const timestamp = resolveTimestamp(log, [
        "timestamp",
        "createdAt",
        "updatedAt",
        "dh_sep",
        "dh_exu",
        "dh_falec",
        "data_velorio",
        "dh_sep_pet",
    ]);
    if (!timestamp || !isValidDate(timestamp)) return null;

    const action = String(log?.action || log?.actionLabel || "UPDATE").toUpperCase();
    const statusRaw = normalizeText(log?.status || log?.statusLabel);
    const status = statusRaw.includes("falh") ? "failure" : statusRaw.includes("alert") ? "warning" : "success";
    const entity = log?.entity || {
        id: String(log?.entityId || log?.sourceRecordId || log?.id || index),
        type: String(log?.entityType || "registro"),
        label: String(log?.entityLabel || "Registro"),
        route: String(log?.route || "/home"),
        sourceCollection: String(log?.sourceCollection || "logs"),
    };

    return {
        ...clone(log),
        id: String(log?.id || `log-${index}`),
        eventCode: String(log?.eventCode || buildEventCode(entity.sourceCollection || "logs", entity.id)),
        timestamp: parseDateValue(timestamp).toISOString(),
        status,
        statusLabel: STATUS_META[status]?.label || String(log?.statusLabel || status),
        action,
        actionLabel: ACTION_META[action]?.label || String(log?.actionLabel || action),
        module: String(log?.module || entity.label || "Registro"),
        description: String(log?.description || "Evento rastreável carregado da coleção logs."),
        user: normalizeActor(log),
        entity,
        changes: Array.isArray(log?.changes) ? log.changes : [],
        additionalInfo: log?.additionalInfo && typeof log.additionalInfo === "object" ? log.additionalInfo : {},
        timeline: Array.isArray(log?.timeline) ? log.timeline : [],
        sourceCollection: String(log?.sourceCollection || entity.sourceCollection || "logs"),
        sourceRecordId: String(log?.sourceRecordId || entity.id || log?.id || "-"),
    };
};

const extractLogsFromDatabase = (db = database) => {
    const derived = [];

    Object.keys(COLLECTION_META).forEach((collectionName) => {
        const records = Array.isArray(db?.[collectionName]) ? db[collectionName] : [];
        records.forEach((record, index) => {
            const log = buildLogFromRecord(collectionName, record, index);
            if (log) derived.push(log);
        });
    });

    return derived.sort(
        (left, right) => (formatTimestampSortKey(right.timestamp) || 0) - (formatTimestampSortKey(left.timestamp) || 0)
    );
};

export const loadAuditLogsFromDb = (db = database) => extractLogsFromDatabase(db);

export const normalizeAuditLogs = (logs = []) =>
    logs
        .map((log, index) => normalizeStoredLog(log, index))
        .filter(Boolean)
        .sort(
            (left, right) =>
                (formatTimestampSortKey(right.timestamp) || 0) - (formatTimestampSortKey(left.timestamp) || 0)
        );

export const LOG_STATUS_META = STATUS_META;
export const LOG_ACTION_META = ACTION_META;
export const LOG_PAGE_SIZE = AUDIT_LOG_PAGE_SIZE;
export const LOG_UNKNOWN_ACTOR_NAME = UNKNOWN_ACTOR_NAME;
export const LOG_UNKNOWN_ACTOR_SOURCE_LABEL = UNKNOWN_ACTOR_SOURCE_LABEL;
