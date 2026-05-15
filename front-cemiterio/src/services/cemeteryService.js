import { createCrudService } from "./createCrudService.js";

const service = createCrudService("cemeteries");

export const getCemeteries = async (params) => service.list(params);

export const createCemeteries = async (payload) => service.create(payload);

export const updateCemeteries = async (id, payload) => service.update(id, payload);

export const inactiveCemeteries = async (id) => service.inactivate(id);

export const patchCemeteriesStatus = async (id, status) => service.update(id, { status });