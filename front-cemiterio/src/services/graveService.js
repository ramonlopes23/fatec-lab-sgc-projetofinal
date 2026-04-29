import api from "./index.js";

export const getGrave = async () => {
  const response = await api.get("/graves");
  return response.data;
};

export const createGrave = async (payload) => {
  const response = await api.post("/graves", payload);
  return response.data;
};

export const updateGrave = async (id, payload) => {
  const response = await api.put(`/graves/${id}`, payload);
  return response.data;
};

export const inactivateGrave = async (id) => {
  const response = await api.patch(`/graves/${id}/inactive`);
  return response.data;
}; 

export const patchGraveStatus = async (id, status) => {
  const response = await api.put(`/graves/${id}`, { status });
  return response.data;
};  