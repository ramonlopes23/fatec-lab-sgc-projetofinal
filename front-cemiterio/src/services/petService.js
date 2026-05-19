import { createCrudService } from "./createCrudService.js";

const service = createCrudService("pets");

export const getPets = async (params) => service.list(params);

export const createPet = async (payload) => service.create(payload);

export const updatePet = async (id, payload) => service.update(id, payload);

export const deletePet = async (id) => service.remove(id);
