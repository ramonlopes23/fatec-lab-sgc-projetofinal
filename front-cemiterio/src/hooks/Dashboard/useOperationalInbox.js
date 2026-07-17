import { useCallback, useRef, useState } from "react";
import { confirmOperationalProcess } from "../../services/operationalProcessService.js";
import { getOperationalProcessKey } from "../../utils/dashboard.js";
import { useToastFeedback } from "../ToastFeedback/useToastFeedback.jsx";

const getConfirmationErrorMessage = (error) => {
    const status = Number(error?.response?.status || 0);
    if (status === 401 || status === 403) return "Você não tem permissão para confirmar este processo.";
    if (status === 404) return "O processo não foi encontrado. Atualize a página e tente novamente.";
    if (status === 409) return "O processo foi alterado por outra operação. Atualize os dados e tente novamente.";
    if (status >= 500) return "O servidor não conseguiu confirmar o processo. Tente novamente em instantes.";
    return error?.message || "Não foi possível confirmar o processo.";
};

const dispatchOperationalEvent = (name, detail) => {
    try {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (error) {
        console.warn(`Não foi possível publicar o evento ${name}.`, error);
    }
};

export default function useOperationalInbox({ reload }) {
    const [confirmingKey, setConfirmingKey] = useState(null);
    const confirmationLockRef = useRef(null);
    const { showSuccess, showWarning, showError, ToastElement } = useToastFeedback();

    const confirmProcess = useCallback(
        async (process) => {
            if (confirmationLockRef.current) return false;

            const processKey = getOperationalProcessKey(process);
            confirmationLockRef.current = processKey;
            setConfirmingKey(processKey);

            try {
                const result = await confirmOperationalProcess(process);

                if (result.createdProcess) {
                    dispatchOperationalEvent("processoCriado", {
                        ...result.createdProcess,
                        _origin: "operational-inbox",
                    });
                }
                if (result.graveChange) dispatchOperationalEvent("covaCapacidadeAlterada", result.graveChange);

                await reload();
                dispatchOperationalEvent("processoConfirmado", { id: process.id, type: process._type });

                if (result.warnings.length) showWarning(result.warnings.join(" "));
                else showSuccess("Processo confirmado com sucesso.");
                return true;
            } catch (error) {
                console.error("Erro ao confirmar processo operacional", error);
                showError(getConfirmationErrorMessage(error));
                return false;
            } finally {
                confirmationLockRef.current = null;
                setConfirmingKey(null);
            }
        },
        [reload, showError, showSuccess, showWarning]
    );

    return {
        confirmProcess,
        confirmingKey,
        isConfirming: confirmingKey !== null,
        ToastElement,
    };
}
