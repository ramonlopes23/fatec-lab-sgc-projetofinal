const runSecondaryEffect = async (dependencies, warnings, warningMessage, effect) => {
    try {
        return await effect();
    } catch (error) {
        dependencies.onWarning?.(warningMessage, error);
        warnings.push(warningMessage);
        return null;
    }
};

const createConfirmationResult = () => ({
    warnings: [],
    createdProcess: null,
    graveChange: null,
});

const assertProcessId = (process) => {
    if (!process?.id) throw new Error("Processo operacional inválido.");
};

const isProcessConfirmed = (process) =>
    process?.confirmado === true ||
    String(process?.confirmado).toLowerCase() === "true" ||
    String(process?.status ?? "")
        .toLowerCase()
        .includes("conclu");

const getCurrentProcess = async (getter, processId) => {
    if (typeof getter !== "function") return null;

    try {
        return await getter(processId);
    } catch {
        return null;
    }
};

export const OPERATIONAL_PROCESS_TYPES = Object.freeze({
    velorio: "Velório",
    sepultamento: "Sepultamento",
    exumacao: "Exumação",
});

export const createVelorioConfirmer = (dependencies) => async (process) => {
    assertProcessId(process);

    const result = createConfirmationResult();
    const currentProcess = await getCurrentProcess(dependencies.getVelorioById, process.id);
    if (isProcessConfirmed(currentProcess)) return result;

    await dependencies.patchVelorio(process.id, { status: "Concluído", confirmado: true });
    const linkedSepultamentoId = process.sepultamento_id ?? process.sepultamentoId ?? null;

    if (linkedSepultamentoId) {
        result.createdProcess = await runSecondaryEffect(
            dependencies,
            result.warnings,
            "O velório foi confirmado, mas o sepultamento relacionado não pôde ser liberado.",
            async () => {
                await dependencies.patchSepultamento(linkedSepultamentoId, {
                    status: "Pendente",
                    confirmado: false,
                    liberado_por_velorio: true,
                });
                const sepultamento = await dependencies.getSepultamentoById(linkedSepultamentoId);
                return sepultamento ? { ...sepultamento, _type: OPERATIONAL_PROCESS_TYPES.sepultamento } : null;
            }
        );
    }

    return result;
};

export const createSepultamentoConfirmer = (dependencies) => async (process) => {
    assertProcessId(process);

    const result = createConfirmationResult();
    const currentProcess = await getCurrentProcess(dependencies.getSepultamentoById, process.id);
    if (isProcessConfirmed(currentProcess)) return result;

    await dependencies.patchSepultamento(process.id, { status: "Concluído", confirmado: true });
    result.graveChange = await runSecondaryEffect(
        dependencies,
        result.warnings,
        "O sepultamento foi confirmado, mas a capacidade da sepultura não pôde ser atualizada.",
        () => dependencies.adjustGraveCapacity(process.id, -1)
    );

    return result;
};

export const createExumacaoConfirmer = (dependencies) => async (process) => {
    assertProcessId(process);

    const result = createConfirmationResult();
    const currentProcess = await getCurrentProcess(dependencies.getExumacaoById, process.id);
    if (isProcessConfirmed(currentProcess)) return result;

    await dependencies.patchExumacao(process.id, { status: "Concluído", confirmado: true });
    const sepultamentoId = process.sepultamentoId ?? process.sepultamento ?? process.falecido_id ?? null;

    if (sepultamentoId) {
        const sepultamentoUpdated = await runSecondaryEffect(
            dependencies,
            result.warnings,
            "A exumação foi confirmada, mas o sepultamento relacionado não pôde ser atualizado.",
            async () => {
                await dependencies.patchSepultamento(sepultamentoId, { foi_exumado: true });
                return true;
            }
        );

        if (sepultamentoUpdated) {
            result.graveChange = await runSecondaryEffect(
                dependencies,
                result.warnings,
                "A exumação foi confirmada, mas a capacidade da sepultura não pôde ser restaurada.",
                () => dependencies.adjustGraveCapacity(sepultamentoId, 1)
            );
        }
    }

    return result;
};

export const createOperationalProcessDispatcher =
    ({ confirmVelorio, confirmSepultamento, confirmExumacao }) =>
    async (process) => {
        if (!process?._type) throw new Error("Processo operacional inválido.");

        if (process._type === OPERATIONAL_PROCESS_TYPES.velorio) return confirmVelorio(process);
        if (process._type === OPERATIONAL_PROCESS_TYPES.sepultamento) return confirmSepultamento(process);
        if (process._type === OPERATIONAL_PROCESS_TYPES.exumacao) return confirmExumacao(process);

        throw new Error(`Tipo de processo não suportado: ${process._type}.`);
    };

export const createOperationalProcessConfirmer = (dependencies) =>
    createOperationalProcessDispatcher({
        confirmVelorio: createVelorioConfirmer(dependencies),
        confirmSepultamento: createSepultamentoConfirmer(dependencies),
        confirmExumacao: createExumacaoConfirmer(dependencies),
    });
