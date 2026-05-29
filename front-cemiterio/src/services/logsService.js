import api from "./index.js";
import { loadAuditLogsFromDb, normalizeAuditLogs } from "./logsData.js";

const clone = (value) => {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
};

export const loadSystemLogs = async () => {
    try {
        const response = await api.get("/logs");
        if (Array.isArray(response.data) && response.data.length > 0) {
            return normalizeAuditLogs(response.data);
        }
    } catch {
        // falls back to the records available in db.json
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
