export class RegistroProcessError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "RegistroProcessError";
        this.code = code;
    }
}

export const createRegistroArchiver =
    ({ archiveFalecido, archiveSepultamento }) =>
    async (record) => {
        const sepultamentoId = record?.sepultamento?.id;
        if (sepultamentoId !== undefined && sepultamentoId !== null && sepultamentoId !== "") {
            await archiveSepultamento(sepultamentoId);
            return { entityType: "sepultamento", entityId: String(sepultamentoId) };
        }

        const falecidoId = record?.id;
        if (falecidoId === undefined || falecidoId === null || falecidoId === "") {
            throw new RegistroProcessError("INVALID_RECORD", "Registro inválido para arquivamento.");
        }

        await archiveFalecido(falecidoId);
        return { entityType: "falecido", entityId: String(falecidoId) };
    };

export const getRegistroArchiveErrorMessage = (error) => {
    if (error instanceof RegistroProcessError) return error.message;

    const data = error?.response?.data;
    const backendMessage = data?.message || data?.error || data?.detail;
    const status = Number(error?.response?.status || 0);

    if (backendMessage) return backendMessage;
    if (status === 400) return "O registro não pode ser arquivado no estado atual.";
    if (status === 401 || status === 403) return "Você não tem permissão para arquivar este registro.";
    if (status === 404) return "O registro não foi encontrado.";
    if (status === 409) return "O registro foi alterado por outra operação. Atualize os dados.";
    if (status >= 500) return "Servidor indisponível ao arquivar o registro. Tente novamente em instantes.";
    return error?.message || "Não foi possível arquivar o registro.";
};
