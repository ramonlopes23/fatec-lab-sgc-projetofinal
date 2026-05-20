import { createCrudService } from "./createCrudService.js";

const service = createCrudService("ossarios");

export const getOssarios = async (params) => service.list(params);

export const createOssario = async (payload) => service.create(payload);

export const updateOssario = async (id, payload) => service.update(id, payload);

export const deleteOssario = async (id) => service.remove(id);
