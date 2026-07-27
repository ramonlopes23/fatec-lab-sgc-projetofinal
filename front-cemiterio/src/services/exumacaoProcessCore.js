const REQUIRED_FIELDS = Object.freeze({
    motivo: "Motivo",
    destino: "Destino",
    coveiro: "Coveiro",
});

const normalizeText = (value) => (value === undefined || value === null ? "" : String(value).trim());

export class ExumacaoProcessError extends Error {
    constructor(code, message, fieldErrors = {}) {
        super(message);
        this.name = "ExumacaoProcessError";
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}

export const isExumacaoPending = (exumacao = {}) => {
    const status = normalizeText(exumacao?.status).toLowerCase();
    return status.includes("pend") || (!status && !exumacao?.confirmado && !exumacao?.confirmacao);
};

export const getExumacaoSepultamentoId = (exumacao = {}) => {
    const sepultamento = exumacao?.sepultamentoId ?? exumacao?.sepultamento_id ?? exumacao?.sepultamento ?? null;
    if (sepultamento && typeof sepultamento === "object") return sepultamento.id ?? sepultamento._id ?? null;
    return sepultamento;
};

export const getExumacaoValidationErrors = (form = {}) => {
    const errors = {};

    if (!form?.sepultamentoId) {
        errors.sepultamentoId = "Sepultamento inválido para iniciar a exumação.";
    }

    Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
        if (!normalizeText(form?.[field])) errors[field] = `${label} é obrigatório.`;
    });

    return errors;
};

export const normalizeExumacaoRequest = (form = {}) => ({
    ...form,
    motivo: normalizeText(form.motivo),
    destino: normalizeText(form.destino),
    coveiro: normalizeText(form.coveiro),
    obs_exu: normalizeText(form.obs_exu),
    status: "pendente",
    confirmado: false,
});

const assertValidCreatedExumacao = (created) => {
    const isObject = created !== null && typeof created === "object" && !Array.isArray(created);
    if (!isObject || created.id === undefined || created.id === null || created.id === "") {
        throw new ExumacaoProcessError("INVALID_RESPONSE", "Resposta inválida do servidor ao criar exumação.");
    }
};

export const createExumacaoRequester =
    ({ createExumacao }) =>
    async ({ form, pendingExumacao = null }) => {
        if (!form?.sepultamentoId) {
            throw new ExumacaoProcessError("INVALID_SEPULTAMENTO", "Dados inválidos.", {
                sepultamentoId: "Sepultamento inválido para iniciar a exumação.",
            });
        }

        if (pendingExumacao) {
            throw new ExumacaoProcessError("DUPLICATE_PENDING", "Já existe uma exumação pendente para este registro.");
        }

        const fieldErrors = getExumacaoValidationErrors(form);
        if (Object.keys(fieldErrors).length > 0) {
            throw new ExumacaoProcessError(
                "VALIDATION_ERROR",
                "Preencha os campos obrigatórios da exumação.",
                fieldErrors
            );
        }

        const payload = normalizeExumacaoRequest(form);
        const created = await createExumacao(payload);
        assertValidCreatedExumacao(created);
        return created;
    };

export const createExumacaoCanceller =
    ({ deleteExumacao }) =>
    async ({ sepultamento, exumacao }) => {
        if (!sepultamento?.id) {
            throw new ExumacaoProcessError("INVALID_SEPULTAMENTO", "Sepultamento inválido.");
        }
        if (!exumacao?.id) {
            throw new ExumacaoProcessError("PENDING_NOT_FOUND", "Nenhuma exumação pendente para este registro.");
        }
        if (!isExumacaoPending(exumacao)) {
            throw new ExumacaoProcessError("EXUMACAO_NOT_PENDING", "Somente exumações pendentes podem ser canceladas.");
        }

        await deleteExumacao(exumacao.id);
        return {
            sepultamentoId: String(sepultamento.id),
            exumacao,
        };
    };

const getBackendMessage = (error) => {
    const data = error?.response?.data;
    return data?.message || data?.error || data?.detail || "";
};

export const getExumacaoRequestErrorMessage = (error) => {
    if (error instanceof ExumacaoProcessError) return error.message;

    const backendMessage = getBackendMessage(error);
    const status = Number(error?.response?.status || 0);
    if (backendMessage) return backendMessage;
    if (status === 400) return "Revise os dados informados para cadastrar a exumação.";
    if (status === 401 || status === 403) return "Você não tem permissão para cadastrar exumação.";
    if (status === 404) return "Sepultamento ou destino não encontrado.";
    if (status === 409) return "Já existe uma exumação pendente para este registro.";
    if (status >= 500) return "Servidor indisponível ao cadastrar exumação. Tente novamente em instantes.";
    return error?.message || "Erro ao cadastrar exumação.";
};

export const getExumacaoCancelErrorMessage = (error) => {
    if (error instanceof ExumacaoProcessError) return error.message;

    const backendMessage = getBackendMessage(error);
    const status = Number(error?.response?.status || 0);
    if (backendMessage) return backendMessage;
    if (status === 400) return "A exumação não pode ser cancelada no estado atual.";
    if (status === 401 || status === 403) return "Você não tem permissão para cancelar esta exumação.";
    if (status === 404) return "A exumação pendente não foi encontrada.";
    if (status === 409) return "A exumação foi alterada por outra operação. Atualize os dados.";
    if (status >= 500) return "Servidor indisponível ao cancelar exumação. Tente novamente em instantes.";
    return error?.message || "Erro ao cancelar exumação.";
};
