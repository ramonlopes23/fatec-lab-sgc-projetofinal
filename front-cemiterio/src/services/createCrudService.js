import api from "./index.js";
import { recordSystemMutation } from "./logsService.js";

export function createCrudService(endpoint) {
    const base = `/${endpoint}`;

    return {
        list: async (params) => {
            const res = await api.get(base, { params });
            return res.data;
        },

        get: async (id) => {
            const res = await api.get(`${base}/${id}`);
            return res.data;
        },

        create: async (payload) => {
            const res = await api.post(base, payload);
            void recordSystemMutation({
                action: "CREATE",
                resource: endpoint,
                entityId: res.data?.id,
                payload,
                result: res.data,
            });
            return res.data;
        },

        update: async (id, payload) => {
            const res = await api.put(`${base}/${id}`, payload);
            void recordSystemMutation({
                action: "UPDATE",
                resource: endpoint,
                entityId: id,
                payload,
                result: res.data,
            });
            return res.data;
        },

        patch: async (id, payload) => {
            const res = await api.patch(`${base}/${id}`, payload);
            void recordSystemMutation({
                action: "UPDATE",
                resource: endpoint,
                entityId: id,
                payload,
                result: res.data,
            });
            return res.data;
        },

        inactivate: async (id) => {
            const res = await api.patch(`${base}/${id}/inactive`);
            void recordSystemMutation({
                action: "UPDATE",
                resource: endpoint,
                entityId: id,
                payload: { status: "inactive", ativo: false },
                result: res.data,
            });
            return res.data;
        },

        remove: async (id) => {
            const res = await api.delete(`${base}/${id}`);
            void recordSystemMutation({
                action: "DELETE",
                resource: endpoint,
                entityId: id,
                payload: res.data,
                result: res.data,
            });
            return res.data;
        },
    };
}
