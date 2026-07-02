import { createCrudService } from "./createCrudService.js";

const service = createCrudService("graves");

export const getGrave = async (params) => service.list(params);

export const createGrave = async (payload) => service.create(payload);

export const updateGrave = async (id, payload) => service.update(id, payload);

export const inactivateGrave = async (id) => service.inactivate(id);

export const patchGraveStatus = async (id, status) => service.patch(id, { status });
