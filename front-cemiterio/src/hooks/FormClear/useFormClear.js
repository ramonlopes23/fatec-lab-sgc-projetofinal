import { useCallback } from "react";
import { INITIAL_FALECIDO_FORM, INITIAL_SEPULTAMENTO_FORM, PROCESS_TYPES } from "../../pages/Cadastros/constants";
import { getFalecidoId, getFalecidoName } from "../../utils/falecido";

export default function useFormClear({
    clearAllErrors,
    clearSaved,
    setActiveStep,
    setBusca,
    setCepResp,
    setEnderecoResp,
    setForm,
    setIsIndigente,
    setSearchFal,
    setShowFalList,
    setProcessType,
}) {
    const clearFalecido = useCallback(() => {
        setForm(INITIAL_FALECIDO_FORM);
        setActiveStep(0);
        clearAllErrors();
        setCepResp("");
        setEnderecoResp("");
        setBusca("");
        setSearchFal("");
        setIsIndigente(false);
        clearSaved();
    }, [
        clearAllErrors,
        clearSaved,
        setActiveStep,
        setBusca,
        setCepResp,
        setEnderecoResp,
        setForm,
        setIsIndigente,
        setSearchFal,
    ]);

    const clearSepultamento = useCallback(() => {
        setForm(INITIAL_SEPULTAMENTO_FORM);
        setActiveStep(0);
        clearAllErrors();
        setBusca("");
        setSearchFal("");
        setShowFalList(false);
        setIsIndigente(false);
        clearSaved();
    }, [clearAllErrors, clearSaved, setActiveStep, setBusca, setForm, setIsIndigente, setSearchFal, setShowFalList]);

    const resetToSepultamento = useCallback(
        (falecidoCriado, fallbackNome) => {
            const id = getFalecidoId(falecidoCriado);
            const nome = getFalecidoName(falecidoCriado) || fallbackNome || "";

            setProcessType(PROCESS_TYPES.sepultamento);
            setActiveStep(0);
            clearAllErrors();
            setSearchFal(nome);
            setForm({ ...INITIAL_SEPULTAMENTO_FORM, falecido_id: id, falecido: id, nome_sep: nome });

            return { id, nome };
        },
        [clearAllErrors, setActiveStep, setForm, setProcessType, setSearchFal]
    );

    return {
        clearFalecido,
        clearSepultamento,
        resetToSepultamento,
    };
}
