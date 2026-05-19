import { createCrudService } from "./createCrudService.js";

const service = createCrudService("falecidos");

export const getFalecidos = async (params) => service.list(params);

export const createFalecido = async (payload) => service.create(payload);

export const updateFalecido = async (id, payload) => service.update(id, payload);

export const inactivateFalecido = async (id) => service.inactivate(id);
