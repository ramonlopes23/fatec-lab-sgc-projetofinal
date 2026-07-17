import api, { apiMode } from "./index.js";
import { loadAuditLogsFromDb, normalizeAuditLogs } from "./logsData.js";
import { buildSystemMutationLog } from "../utils/auditLog.js";

const LOCAL_API_MODES = new Set(["dbjsonapi", "mock"]);

const clone = (value) => {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
};

export const loadSystemLogs = async () => {
    try {
        const response = await api.get("/logs");
        if (Array.isArray(response.data)) {
            if (response.data.length > 0 || !LOCAL_API_MODES.has(apiMode)) {
                return normalizeAuditLogs(response.data);
            }
        }
    } catch (error) {
        if (!LOCAL_API_MODES.has(apiMode)) throw error;
    }

    return loadAuditLogsFromDb();
};

export const getSystemLogById = async (logId) => {
    const logs = await loadSystemLogs();
    return logs.find((item) => String(item.id) === String(logId)) || null;
};

export const persistSystemLog = async (payload) => {
    const logItem = {
        ...payload,
        id: payload.id || `LOG-${Date.now()}`,
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const response = await api.post("/logs", logItem);
    return response.data ? clone(response.data) : clone(logItem);
};

const resolveStoredActor = () => {
    const unknownActor = {
        id: null,
        name: "Não identificado",
        username: null,
        role: null,
        isKnown: false,
        sourceField: "local-session-unavailable",
        sourceLabel: "Sessão não disponível",
    };

    if (typeof localStorage === "undefined") return unknownActor;

    try {
        const storedAuth = JSON.parse(localStorage.getItem("sgc-auth") || "{}");
        const user = storedAuth?.state?.user || {};
        const name = user.name || user.nome || user.username || user.email;

        if (!name) return unknownActor;

        return {
            id: user.id == null ? null : String(user.id),
            name,
            username: user.username || null,
            role: user.role || null,
            isKnown: true,
            sourceField: user.name
                ? "name"
                : user.nome
                  ? "nome"
                  : user.username
                    ? "username"
                    : user.email
                      ? "email"
                      : "local-session",
            sourceLabel: "Sessão local",
        };
    } catch {
        return unknownActor;
    }
};

export const recordSystemMutation = async ({ action, resource, entityId, payload, result }) => {
    if (!LOCAL_API_MODES.has(apiMode)) return null;

    try {
        const persisted = await persistSystemLog(
            buildSystemMutationLog({
                action,
                resource,
                entityId,
                payload,
                result,
                actor: resolveStoredActor(),
            })
        );

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("systemLogCreated", { detail: persisted }));
        }

        return persisted;
    } catch (error) {
        console.warn("Não foi possível registrar o evento de auditoria", error);
        return null;
    }
};
