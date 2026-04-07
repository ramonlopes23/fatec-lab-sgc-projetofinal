import api from "./apijava";

export const getBlocks = async () => {
  const response = await api.get("/blocks");
  return response.data;
};

export const createBlock = async (payload) => {
  const response = await api.post("/blocks", payload);
  return response.data;
};

export const updateBlock = async (id, payload) => {
  const response = await api.put(`/blocks/${id}`, payload);
  return response.data;
};

export const inactivateBlock = async (id) => {
  const response = await api.patch(`/blocks/${id}/inactive`);
  return response.data;
};