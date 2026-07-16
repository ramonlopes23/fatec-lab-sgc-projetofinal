import { createCrudService } from "./createCrudService.js";

const service = createCrudService("exumacoes");

export const getExumacoes = async (params) => service.list(params);

export const createExumacao = async (payload) => service.create(payload);

export const updateExumacao = async (id, payload) => service.update(id, payload);

export const patchExumacao = async (id, payload) => service.patch(id, payload);

export const deleteExumacao = async (id) => service.remove(id);

export const patchExumacaoStatus = async (id, status) => service.patch(id, { status });
