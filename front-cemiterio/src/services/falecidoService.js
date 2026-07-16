import { createCrudService } from "./createCrudService.js";

const service = createCrudService("falecidos");

export const getFalecidos = async (params) => service.list(params);

export const getFalecidoById = async (id) => service.get(id);

export const createFalecido = async (payload) => service.create(payload);

export const updateFalecido = async (id, payload) => service.update(id, payload);

export const patchFalecido = async (id, payload) => service.patch(id, payload);

export const archiveFalecido = async (id) => service.patch(id, { arquivado: true });

export const inactivateFalecido = async (id) => service.inactivate(id);
