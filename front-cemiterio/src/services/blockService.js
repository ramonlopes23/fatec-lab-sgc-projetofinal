import { createCrudService } from "./createCrudService.js";

const service = createCrudService("blocks");

export const getBlocks = async (params) => service.list(params);

export const createBlock = async (payload) => service.create(payload);

export const updateBlock = async (id, payload) => service.update(id, payload);

export const inactivateBlock = async (id) => service.inactivate(id);