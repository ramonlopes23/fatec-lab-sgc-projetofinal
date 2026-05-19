import { createCrudService } from "./createCrudService.js";

const service = createCrudService("velorios");

export const getVelorios = async (params) => service.list(params);

export const createVelorio = async (payload) => service.create(payload);

export const updateVelorio = async (id, payload) => service.update(id, payload);

export const deleteVelorio = async (id) => service.remove(id);
