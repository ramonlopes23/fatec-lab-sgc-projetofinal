const RESOURCE_META = {
    blocks: { module: "Quadras", label: "Quadra", type: "quadra", route: "/cemiterios" },
    cemeteries: { module: "Cemitérios", label: "Cemitério", type: "cemiterio", route: "/cemiterios" },
    contratos: { module: "Contratos", label: "Contrato", type: "contrato", route: "/contratos" },
    exumacoes: { module: "Exumação", label: "Exumação", type: "exumacao", route: "/registros" },
    falecidos: { module: "Falecidos", label: "Falecido", type: "falecido", route: "/registros" },
    graves: { module: "Sepulturas", label: "Sepultura", type: "sepultura", route: "/vermapa" },
    ossarios: { module: "Ossários", label: "Ossário", type: "ossario", route: "/ossarios" },
    pets: { module: "Pets", label: "Pet", type: "pet", route: "/vermapa" },
    sepultamentos: {
        module: "Sepultamento",
        label: "Sepultamento",
        type: "sepultamento",
        route: "/registros",
    },
    taxas: { module: "Taxas", label: "Taxa", type: "taxa", route: "/taxas" },
    velorios: { module: "Velório", label: "Velório", type: "velorio", route: "/registros" },
};

const ACTION_LABELS = {
    CREATE: "CRIAR",
    DELETE: "EXCLUIR",
    UPDATE: "ATUALIZAR",
};

const SENSITIVE_FIELD_PATTERN = /(password|senha|token|secret|authorization)/i;
const MAX_AUDIT_FIELDS = 20;

const formatAuditValue = (value) => {
    if (value === null || value === undefined || value === "") return "NÃO INFORMADO";
    if (typeof value === "boolean") return value ? "SIM" : "NÃO";
    if (typeof value === "object") return Array.isArray(value) ? `[LISTA: ${value.length}]` : "[OBJETO]";
    const text = String(value);
    return text.length > 240 ? `${text.slice(0, 237)}...` : text;
};

const getAuditEntries = (payload) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];

    return Object.entries(payload)
        .filter(([field]) => !SENSITIVE_FIELD_PATTERN.test(field))
        .slice(0, MAX_AUDIT_FIELDS)
        .map(([field, value]) => [field, formatAuditValue(value)]);
};

export const buildSystemMutationLog = ({
    action,
    resource,
    entityId,
    payload,
    result,
    actor = {
        name: "Não identificado",
        isKnown: false,
        sourceField: "local-session-unavailable",
        sourceLabel: "Sessão não disponível",
    },
    timestamp = new Date().toISOString(),
}) => {
    const normalizedAction = String(action || "UPDATE").toUpperCase();
    const meta = RESOURCE_META[resource] || {
        module: resource || "Sistema",
        label: "Registro",
        route: "/home",
    };
    const resolvedEntityId = String(entityId ?? result?.id ?? payload?.id ?? "-");
    const entries = getAuditEntries(payload || result);
    const actorName = actor?.name || actor?.nome || actor?.username || actor?.email || "Não identificado";
    const actorIsKnown = actor?.isKnown == null ? actorName !== "Não identificado" : Boolean(actor.isKnown);

    return {
        eventCode: `AUD-${String(resource || "SYS")
            .slice(0, 3)
            .toUpperCase()}-${resolvedEntityId}`,
        timestamp,
        status: "success",
        statusLabel: "Sucesso",
        action: normalizedAction,
        actionLabel: ACTION_LABELS[normalizedAction] || normalizedAction,
        module: meta.module,
        description: `${meta.label} ${resolvedEntityId} processado com sucesso.`,
        user: {
            id: actor?.id == null ? null : String(actor.id),
            name: actorName,
            username: actor?.username || null,
            role: actor?.role || null,
            isKnown: actorIsKnown,
            sourceField: actor?.sourceField || "local-session-unavailable",
            sourceLabel: actor?.sourceLabel || (actorIsKnown ? "Sessão local" : "Sessão não disponível"),
        },
        entity: {
            id: resolvedEntityId,
            type: meta.type || resource || "registro",
            label: meta.label,
            route: meta.route,
            sourceCollection: resource,
        },
        changes: entries.map(([field, value]) => ({
            field,
            label: field,
            before: "NÃO CAPTURADO",
            after: value,
        })),
        additionalInfo: Object.fromEntries(entries),
        timeline: [
            {
                label: "Operação solicitada",
                value: `${ACTION_LABELS[normalizedAction] || normalizedAction} em ${meta.module}`,
                timestamp,
            },
            {
                label: "Persistência concluída",
                value: `${meta.label} ${resolvedEntityId} salvo com sucesso`,
                timestamp,
            },
        ],
        sourceCollection: resource,
        sourceRecordId: resolvedEntityId,
    };
};
