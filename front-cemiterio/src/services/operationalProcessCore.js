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

const syncGraveCapacity = async (dependencies, sepultamentoId, capacityDelta) => {
    const sepultamento = await dependencies.getSepultamentoById(sepultamentoId);
    if (!sepultamento) throw new Error("Sepultamento relacionado não encontrado.");

    const blockId = sepultamento.quadra_sep ?? sepultamento.quadra;
    const graveNumber = getSepulturaNumber(sepultamento);
    if (blockId == null || !graveNumber) throw new Error("Referência da sepultura não encontrada.");

    const grave = await resolveGraveBySepultamento(dependencies, blockId, graveNumber);
    if (!grave?.id) throw new Error("Sepultura não encontrada.");

    const currentCapacity = Number(getSepulturaCapacity(grave));
    const nextCapacity = Math.max(0, currentCapacity + capacityDelta);
    const occupiedCount = await getActiveConfirmedSepultamentosCount(dependencies, blockId, graveNumber);
    const nextStatus = occupiedCount > 0 ? "OCCUPIED" : "AVAILABLE";

    await dependencies.patchGrave(grave.id, { bodyCapacity: nextCapacity, status: nextStatus });
    return { covaId: grave.id, capacidade: nextCapacity };
};

const runSecondaryEffect = async (dependencies, warnings, warningMessage, effect) => {
    try {
        return await effect();
    } catch (error) {
        dependencies.onWarning?.(warningMessage, error);
        warnings.push(warningMessage);
        return null;
    }
};

export const createOperationalProcessConfirmer = (dependencies) => async (process) => {
    const warnings = [];
    let createdProcess = null;
    let graveChange = null;

    if (!process?.id || !process?._type) throw new Error("Processo operacional inválido.");

    if (process._type === "Velório") {
        await dependencies.patchVelorio(process.id, { status: "Concluído", confirmado: true });
        const linkedSepultamentoId = process.sepultamento_id ?? process.sepultamentoId ?? null;

        if (linkedSepultamentoId) {
            createdProcess = await runSecondaryEffect(
                dependencies,
                warnings,
                "O velório foi confirmado, mas o sepultamento relacionado não pôde ser liberado.",
                async () => {
                    await dependencies.patchSepultamento(linkedSepultamentoId, {
                        status: "Pendente",
                        confirmado: false,
                        liberado_por_velorio: true,
                    });
                    const sepultamento = await dependencies.getSepultamentoById(linkedSepultamentoId);
                    return sepultamento ? { ...sepultamento, _type: "Sepultamento" } : null;
                }
            );
        }
    } else if (process._type === "Sepultamento") {
        await dependencies.patchSepultamento(process.id, { status: "Concluído", confirmado: true });
        graveChange = await runSecondaryEffect(
            dependencies,
            warnings,
            "O sepultamento foi confirmado, mas a capacidade da sepultura não pôde ser atualizada.",
            () => syncGraveCapacity(dependencies, process.id, -1)
        );
    } else if (process._type === "Exumação") {
        await dependencies.patchExumacao(process.id, { status: "Concluído", confirmado: true });
        const sepultamentoId = process.sepultamentoId ?? process.sepultamento ?? process.falecido_id ?? null;

        if (sepultamentoId) {
            const sepultamentoUpdated = await runSecondaryEffect(
                dependencies,
                warnings,
                "A exumação foi confirmada, mas o sepultamento relacionado não pôde ser atualizado.",
                async () => {
                    await dependencies.patchSepultamento(sepultamentoId, { foi_exumado: true });
                    return true;
                }
            );

            if (sepultamentoUpdated) {
                graveChange = await runSecondaryEffect(
                    dependencies,
                    warnings,
                    "A exumação foi confirmada, mas a capacidade da sepultura não pôde ser restaurada.",
                    () => syncGraveCapacity(dependencies, sepultamentoId, 1)
                );
            }
        }
    } else {
        throw new Error(`Tipo de processo não suportado: ${process._type}.`);
    }

    return { warnings, createdProcess, graveChange };
};
