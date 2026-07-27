import { getExumacaoById, patchExumacao } from "./exumacaoService.js";
import { adjustGraveCapacity } from "./graveCapacityService.js";
import {
    createExumacaoConfirmer,
    createOperationalProcessDispatcher,
    createSepultamentoConfirmer,
    createVelorioConfirmer,
} from "./operationalProcessCore.js";
import { getSepultamentoById, patchSepultamento } from "./sepultamentoService.js";
import { getVelorioById, patchVelorio } from "./velorioService.js";

const operationalDependencies = {
    patchExumacao,
    getExumacaoById,
    adjustGraveCapacity,
    getSepultamentoById,
    patchSepultamento,
    getVelorioById,
    patchVelorio,
    onWarning: (message, error) => console.warn(message, error),
};

export const confirmVelorio = createVelorioConfirmer(operationalDependencies);
export const confirmSepultamento = createSepultamentoConfirmer(operationalDependencies);
export const confirmExumacao = createExumacaoConfirmer(operationalDependencies);

export const confirmOperationalProcess = createOperationalProcessDispatcher({
    confirmVelorio,
    confirmSepultamento,
    confirmExumacao,
});
