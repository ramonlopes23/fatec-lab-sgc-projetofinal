import { isCompletedSepultamento } from "../utils/dashboard.js";
import { getSepulturaCapacity, getSepulturaNumber, getSepulturaQuadraRef } from "../utils/sepultura.js";

const resolveGraveBySepultamento = async (dependencies, blockId, graveNumber) => {
    const matchingGraves = await dependencies.getGraves({ blockId, number: graveNumber });
    if (Array.isArray(matchingGraves) && matchingGraves.length) return matchingGraves[0];

    const allGraves = await dependencies.getGraves();
    return (
        (Array.isArray(allGraves) ? allGraves : []).find(
            (grave) =>
                String(getSepulturaQuadraRef(grave)) === String(blockId) &&
                String(getSepulturaNumber(grave)) === String(graveNumber)
        ) ?? null
    );
};

const getActiveConfirmedSepultamentosCount = async (dependencies, blockId, graveNumber) => {
    const sepultamentos = await dependencies.getSepultamentos();
    return (Array.isArray(sepultamentos) ? sepultamentos : []).filter((sepultamento) => {
        const sameBlock = String(getSepulturaQuadraRef(sepultamento)) === String(blockId);
        const sameGrave = String(getSepulturaNumber(sepultamento)) === String(graveNumber);
        return sameBlock && sameGrave && isCompletedSepultamento(sepultamento);
    }).length;
};

export const createGraveCapacityAdjuster = (dependencies) => async (sepultamentoId, capacityDelta) => {
    const sepultamento = await dependencies.getSepultamentoById(sepultamentoId);
    if (!sepultamento) throw new Error("Sepultamento relacionado não encontrado.");

    const blockId = getSepulturaQuadraRef(sepultamento);
    const graveNumber = getSepulturaNumber(sepultamento);
    if (!blockId || !graveNumber) throw new Error("Referência da sepultura não encontrada.");

    const grave = await resolveGraveBySepultamento(dependencies, blockId, graveNumber);
    if (!grave?.id) throw new Error("Sepultura não encontrada.");

    const currentCapacity = Number(getSepulturaCapacity(grave));
    if (!Number.isFinite(currentCapacity)) throw new Error("Capacidade da sepultura inválida.");

    const nextCapacity = Math.max(0, currentCapacity + Number(capacityDelta || 0));
    const occupiedCount = await getActiveConfirmedSepultamentosCount(dependencies, blockId, graveNumber);
    const nextStatus = occupiedCount > 0 ? "OCCUPIED" : "AVAILABLE";

    await dependencies.patchGrave(grave.id, { bodyCapacity: nextCapacity, status: nextStatus });
    return { covaId: grave.id, capacidade: nextCapacity };
};

export const createGraveCapacityExhaustionMarker = (dependencies) => async (graveId) => {
    if (!graveId) throw new Error("Sepultura inválida.");

    await dependencies.patchGrave(graveId, { status: "OCCUPIED", bodyCapacity: 0 });
    return { covaId: graveId, capacidade: 0 };
};
