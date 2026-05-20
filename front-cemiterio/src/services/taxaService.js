import { createCrudService } from "./createCrudService.js";

const service = createCrudService("taxas");

export const getTaxas = async (params) => service.list(params);

export const createTaxa = async (payload) => service.create(payload);

export const updateTaxa = async (id, payload) => service.update(id, payload);

export const deleteTaxa = async (id) => service.remove(id);

export const patchTaxaStatus = async (id, active) => service.update(id, {
    active,
    status: active ? "active" : "inactive",
});
