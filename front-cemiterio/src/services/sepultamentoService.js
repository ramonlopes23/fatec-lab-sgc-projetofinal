import { createCrudService } from "./createCrudService.js";

const service = createCrudService("sepultamentos");

export const getSepultamentos = async (params) => service.list(params);

export const getSepultamentoById = async (id) => service.get(id);

export const createSepultamento = async (payload) => service.create(payload);

export const updateSepultamento = async (id, payload) => service.update(id, payload);

export const patchSepultamento = async (id, payload) => service.patch(id, payload);

export const archiveSepultamento = async (id) => service.patch(id, { arquivado: true });

export const inactivateSepultamento = async (id) => service.inactivate(id);

export const patchSepultamentoStatus = async (id, status) => service.patch(id, { status });
