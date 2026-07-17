import { patchExumacao } from "./exumacaoService.js";
import { getGraves, patchGrave } from "./graveService.js";
import { createOperationalProcessConfirmer } from "./operationalProcessCore.js";
import { getSepultamentoById, getSepultamentos, patchSepultamento } from "./sepultamentoService.js";
import { patchVelorio } from "./velorioService.js";

export const confirmOperationalProcess = createOperationalProcessConfirmer({
    patchExumacao,
    getGraves,
    patchGrave,
    getSepultamentoById,
    getSepultamentos,
    patchSepultamento,
    patchVelorio,
    onWarning: (message, error) => console.warn(message, error),
});
