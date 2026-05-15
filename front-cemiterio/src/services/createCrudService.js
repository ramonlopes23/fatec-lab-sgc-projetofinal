import api from "./index.js";

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
      return res.data;
    },

    update: async (id, payload) => {
      const res = await api.put(`${base}/${id}`, payload);
      return res.data;
    },

    patch: async (id, payload) => {
      const res = await api.patch(`${base}/${id}`, payload);
      return res.data;
    },

    inactivate: async (id) => {
      const res = await api.patch(`${base}/${id}/inactive`);
      return res.data;
    },

    remove: async (id) => {
      const res = await api.delete(`${base}/${id}`);
      return res.data;
    },
  };
}
