import { getGraves, patchGrave } from "./graveService.js";
import { createGraveCapacityAdjuster, createGraveCapacityExhaustionMarker } from "./graveCapacityCore.js";
import { getSepultamentoById, getSepultamentos } from "./sepultamentoService.js";

const graveCapacityDependencies = {
    getGraves,
    patchGrave,
    getSepultamentoById,
    getSepultamentos,
};

export const adjustGraveCapacity = createGraveCapacityAdjuster(graveCapacityDependencies);
export const markGraveCapacityExhausted = createGraveCapacityExhaustionMarker(graveCapacityDependencies);
