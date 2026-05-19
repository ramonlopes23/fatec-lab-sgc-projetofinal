import { createCrudService } from "./createCrudService.js";

const service = createCrudService("sepultamentos");

export const getSepultamentos = async (params) => service.list(params);

export const createSepultamento = async (payload) => service.create(payload);

export const updateSepultamento = async (id, payload) => service.update(id, payload);

export const inactivateSepultamento = async (id) => service.inactivate(id);

export const patchSepultamentoStatus = async (id, status) => service.update(id, { status });
