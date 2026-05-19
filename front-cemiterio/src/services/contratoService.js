import { createCrudService } from "./createCrudService.js";

const service = createCrudService("contratos");

export const getContratos = async (params) => service.list(params);

export const createContrato = async (payload) => service.create(payload);

export const updateContrato = async (id, payload) => service.update(id, payload);

export const deleteContrato = async (id) => service.remove(id);
