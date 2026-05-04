import api from "./index.js";

export const getCemeteries = async () => {
  const response = await api.get("/cemeteries");
  return response.data;
};

export const createCemeteries = async (payload) => {
  const response = await api.post("/cemeteries", payload);
  return response.data;
};

export const updateCemeteries = async (id, payload) => {
  const response = await api.put(`/cemeteries/${id}`, payload);
  return response.data;
};

export const inactiveCemeteries = async (id) => {
  const response = await api.patch(`/cemeteries/${id}/inactive`);
  return response.data;
}; 

export const patchCemeteriesStatus = async (id, status) => {
  const response = await api.put(`/cemeteries/${id}`, { status });
  return response.data;
};  