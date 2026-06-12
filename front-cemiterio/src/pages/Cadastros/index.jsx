import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import api from "../../services/index.js";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import { useApiInitDataCad, useAvailableCovas, useCidadeBusca, useFalecidoSearch, useFileUpload, useFormClear, useFormValidation, useLocalStorage, useTaxas, useToastFeedback, useViacepLookup, useCadastrosSubmit } from "../../hooks";
import { applyMaskByFieldName, capitalizeWords, findTaxaByCodigo } from "../../utils";
import SepultamentoProcess from "../../components/domain/SepultamentoProcess";
import FalecidoProcess from "../../components/domain/FalecidoProcess";
import {
    ALLOWED_FAL_INDI,
    INITIAL_FALECIDO_FORM,
    INITIAL_SEPULTAMENTO_FORM,
    NAME_CASE_FIELDS,
    PROCESS_TYPES,
    STEPS_DECEASED,
    STORAGE_KEY,
    TAXA_LABEL,
    TAXA_MAP,
    VELORIO_FIELDS,
} from "./constants";
import {
    CheckboxInput,
    CheckboxLabel,
    CheckboxWrapper,
    Container,
    FormStyled,
    Title,
    Subtitle,
} from "./styles";

const processFromPath = (pathname) => (
    pathname.includes("/sepultamento")
        ? PROCESS_TYPES.sepultamento
        : PROCESS_TYPES.falecido
);

const normalizeContract = (contract) => ({
    id: contract?.id ?? contract?.numero_titulo ?? "",
    numero_titulo: String(contract?.numero_titulo || "").trim(),
    nome_titular: String(contract?.nome_titular || "").trim(),
    blockId: String(contract?.blockId || "").trim(),
    quadra: String(contract?.quadra || "").trim(),
    sepultura: String(contract?.sepultura || "").trim(),
    cemiterio: String(contract?.cemiterio || "").trim(),
});

export default function Cadastros() {

    
    const location = useLocation();
    const routeProcessType = processFromPath(location.pathname);
    const [saved, setSaved, clearSaved] = useLocalStorage(STORAGE_KEY);
    const { showSuccess, showWarning, showError, ToastElement } = useToastFeedback();

    const [form, setForm] = useState(() => (
        saved?.processType === routeProcessType
            ? saved?.form
            : routeProcessType === PROCESS_TYPES.sepultamento
                ? INITIAL_SEPULTAMENTO_FORM
                : INITIAL_FALECIDO_FORM
    ));
    const [processType, setProcessType] = useState(() => routeProcessType);
    const [activeStep, setActiveStep] = useState(0);
    const [, setRegistros] = useState([]);
    const [showFalList, setShowFalList] = useState(false);
    const [contratos, setContratos] = useState([]);
    const [isIndigente, setIsIndigente] = useState(false);
    const { cep: cepResp, setCep: setCepResp, endereco: enderecoResp, setEndereco: setEnderecoResp, loading: loadingCep, handleCepChange, handleCepBlur } = useViacepLookup();
    const { cidades, quadras, covas, falecidos, setFalecidos } = useApiInitDataCad();
    const { availableCovas, tipoCovaSelecionada, handleQuadraSepChange } = useAvailableCovas(covas, form, setForm);
    
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { busca, setBusca, resultados } = useCidadeBusca(cidades);
    const { searchFal, setSearchFal, filteredFalecidos } = useFalecidoSearch(falecidos, processType, saved, setForm);
    const { taxas, taxaOptions } = useTaxas({ onlyActive: true });
    const { fieldErrors, validateFieldOnChange, validateBeforeSubmit, clearAllErrors, clearErrorsExcept, clearFieldError } = useFormValidation(form, processType, isIndigente, searchFal);
    const { handleFileChange } = useFileUpload(setForm);
    const { clearFalecido, clearSepultamento, resetToSepultamento } = useFormClear({
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
    });

    const { handleConfirmSubmit, isSubmitting } = useCadastrosSubmit({
        form,
        processType,
        taxas,
        resetToSepultamento,
        showSuccess,
        showWarning,
        showError,
        clearSaved,
        setCepResp,
        setEnderecoResp,
        setBusca,
        setIsIndigente,
        setFalecidos,
        setRegistros,
        clearSepultamento,
    });

    const fieldSxStyle = useMemo(() => ({
        "& .MuiInputBase-root": { borderRadius: "4px" },
        "& .MuiOutlinedInput-root": { borderRadius: "4px" },
        "& .MuiOutlinedInput-notchedOutline": { borderRadius: "4px" },
        "& .MuiOutlinedInput-input": { fontSize: "14px" },
        "& .MuiInputBase-input::placeholder": { opacity: 1 },
        "& .Mui-disabled": {
            opacity: isIndigente ? 0.5 : 1,
            transition: "opacity 0.3s ease",
        },
    }), [isIndigente]);

    const labelSxStyle = useMemo(() => ({
        fontSize: "14px",
        backgroundColor: "white",
        paddingX: "4px",
        marginLeft: "-4px"
    }), []);

    const selectSxStyle = useMemo(() => ({
        borderRadius: "4px",
        fontSize: "14px",
        "& .MuiOutlinedInput-notchedOutline": {
            top: "0px"
        },
        "& .Mui-disabled": {
            opacity: isIndigente ? 0.5 : 1,
            transition: "opacity 0.3s ease",
        },
    }), [isIndigente]);

    useEffect(() => {
        if (routeProcessType === processType) return;
        setProcessType(routeProcessType);
        setActiveStep(0);
        clearAllErrors();
        setIsIndigente(false);
        setForm(routeProcessType === PROCESS_TYPES.sepultamento ? INITIAL_SEPULTAMENTO_FORM : INITIAL_FALECIDO_FORM);
    }, [processType, routeProcessType, clearAllErrors]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSaved({ form, processType, cepResp, searchFal });
        }, 500);
        return () => clearTimeout(timer);
    }, [form, processType, cepResp, searchFal, setSaved]);

    useEffect(() => {
        setForm((prev) => ({ ...prev, cep_resp: cepResp, endereco_resp: enderecoResp }));
    }, [cepResp, enderecoResp]);

    useEffect(() => {
        let mounted = true;

        api.get("/contratos")
            .then((response) => {
                if (!mounted) return;
                const data = Array.isArray(response?.data) ? response.data : [];
                setContratos(data.map(normalizeContract));
            })
            .catch((error) => {
                console.warn("Erro ao carregar contratos para sepultamento", error);
                if (mounted) setContratos([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const updateFieldByName = useCallback((name, value) => {
        if (!name.includes(".")) {
            setForm((prev) => ({ ...prev, [name]: value }));
            return;
        }

        const parts = name.split(".");
        setForm((prev) => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i += 1) {
                const key = parts[i];
                cur[key] = cur[key] && typeof cur[key] === "object" ? { ...cur[key] } : {};
                cur = cur[key];
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    }, []);

    const handleChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        const incoming = type === "checkbox" ? checked : value;
        let maskedValue = applyMaskByFieldName(name, incoming);

        if (NAME_CASE_FIELDS.has(name)) maskedValue = capitalizeWords(maskedValue);
        if (name === "certidao_obito") maskedValue = String(maskedValue || "").slice(0, 32);

        updateFieldByName(name, maskedValue);
        validateFieldOnChange(name, maskedValue);

        if (name === "titulo_posse" && String(maskedValue).toLowerCase() !== "sim") {
            updateFieldByName("contrato_id", "");
            updateFieldByName("numero_titulo", "");
            updateFieldByName("nome_titular", "");
            updateFieldByName("quadra_sep", "");
            updateFieldByName("num_sepultura_sep", "");
            updateFieldByName("coveiro_sep", "");
            clearFieldError("contrato_id");
            clearFieldError("numero_titulo");
            clearFieldError("nome_titular");
            clearFieldError("quadra_sep");
            clearFieldError("num_sepultura_sep");
        }

        if (name === "taxa") {
            const selectedTaxa = findTaxaByCodigo(taxas, maskedValue);
            updateFieldByName("taxa_valor", selectedTaxa?.valor ?? TAXA_MAP[maskedValue] ?? 0);
            updateFieldByName("taxa_id", selectedTaxa?.id ?? "");
        }
    }, [taxas, updateFieldByName, validateFieldOnChange, clearFieldError]);

    const handleSelectFalecido = (val) => {
        const raw = val === undefined || val === null ? "" : String(val).trim();
        if (raw === "") {
            setForm((prev) => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            return;
        }

        const falecido = falecidos.find((item) => String(item.id) === raw);
        const id = falecido ? falecido.id : "";
        setForm((prev) => ({
            ...prev,
            falecido_id: id,
            falecido: id,
            nome_sep: falecido ? (falecido.nome_fal || falecido.nome) : prev.nome_sep,
            data_obito_sep: falecido?.dh_falec || prev.data_obito_sep,
        }));
    };

    const handleSelectContrato = useCallback((contractIdOrNumber) => {
        const raw = String(contractIdOrNumber ?? "").trim();
        if (!raw) {
            updateFieldByName("contrato_id", "");
            updateFieldByName("numero_titulo", "");
            updateFieldByName("nome_titular", "");
            updateFieldByName("quadra_sep", "");
            updateFieldByName("num_sepultura_sep", "");
            clearFieldError("numero_titulo");
            clearFieldError("nome_titular");
            clearFieldError("quadra_sep");
            clearFieldError("num_sepultura_sep");
            return;
        }

        const contract = contratos.find((item) => String(item.id) === raw || String(item.numero_titulo) === raw);
        if (!contract) return;

        updateFieldByName("titulo_posse", "Sim");
        updateFieldByName("contrato_id", String(contract.id ?? ""));
        updateFieldByName("numero_titulo", contract.numero_titulo);
        updateFieldByName("nome_titular", contract.nome_titular);
        updateFieldByName("quadra_sep", contract.blockId || contract.quadra || "");
        updateFieldByName("num_sepultura_sep", contract.sepultura);
        updateFieldByName("coveiro_sep", "");
        clearFieldError("numero_titulo");
        clearFieldError("nome_titular");
        clearFieldError("quadra_sep");
        clearFieldError("num_sepultura_sep");
    }, [clearFieldError, contratos, updateFieldByName]);

    const clearVelorioFields = useCallback(() => {
        VELORIO_FIELDS.forEach((fieldName) => {
            updateFieldByName(fieldName, "");
            clearFieldError(fieldName);
        });
    }, [clearFieldError, updateFieldByName]);

    const handleVelorioToggle = useCallback((enabled) => {
        updateFieldByName("com_velorio", enabled);
        if (!enabled) {
            clearVelorioFields();
        }
    }, [clearVelorioFields, updateFieldByName]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateBeforeSubmit()) {
            showError("Por favor, corrija os erros no formulario");
            return;
        }
        setConfirmOpen(true);
    };

    

    const disabledFor = (name) => isSubmitting || (processType === PROCESS_TYPES.falecido && isIndigente && !ALLOWED_FAL_INDI.has(name));

    const handleToggleIndigente = () => {
        setIsIndigente((prev) => {
            const next = !prev;
            if (next && processType === PROCESS_TYPES.falecido) {
                setForm((prevForm) => {
                    const resets = {};
                    Object.keys(INITIAL_FALECIDO_FORM).forEach((key) => {
                        if (!ALLOWED_FAL_INDI.has(key)) resets[key] = INITIAL_FALECIDO_FORM[key];
                    });
                    return { ...prevForm, ...resets };
                });
                clearErrorsExcept(ALLOWED_FAL_INDI);
            }
            return next;
        });
    };

    const cpfDoFalecidoSelecionado = useMemo(() => {
        const id = form.falecido || form.falecido_id;
        if (id) {
            const falecido = (falecidos || []).find((item) => String(item.id) === String(id));
            if (falecido?.cpf) return applyMaskByFieldName("cpf", falecido.cpf);
        }
        return form.cpf ? applyMaskByFieldName("cpf", form.cpf) : "-";
    }, [falecidos, form.cpf, form.falecido, form.falecido_id]);

    const isFalecidoProcess = processType === PROCESS_TYPES.falecido;

    return (
        <>
            {ToastElement}
            <Container>
                <FormStyled onSubmit={handleSubmit}>
                    {isFalecidoProcess && (
                        <CheckboxWrapper>
                            <CheckboxInput checked={isIndigente} onChange={handleToggleIndigente} disabled={isSubmitting} />
                            <CheckboxLabel>Não identificado</CheckboxLabel>
                        </CheckboxWrapper>
                    )}

                    <Title>{isFalecidoProcess ? "Cadastro de Falecido" : "Cadastro de Sepultamento"}</Title>
                    <Subtitle>{isFalecidoProcess ? "Faça o cadastro dos falecidos antes de realizar processos de sepultamento." : "Faça o cadastro do sepultamento para finalizar o processo."} </Subtitle>
                    <Box sx={{ mt: 3 }}>
                        {isFalecidoProcess ? (
                            <FalecidoProcess
                                form={form}
                                cidades={cidades}
                                fieldErrors={fieldErrors}
                                activeStep={activeStep}
                                stepsDeceased={STEPS_DECEASED}
                                handleChange={handleChange}
                                handleNextStep={() => setActiveStep((prev) => prev + 1)}
                                handleBackStep={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 0))}
                                handleClearFalecido={clearFalecido}
                                updateFieldByName={updateFieldByName}
                                handleFileChange={handleFileChange}
                                handleCepChange={handleCepChange}
                                handleCepBlur={handleCepBlur}
                                isIndigente={isIndigente}
                                disabledFor={disabledFor}
                                resultados={resultados}
                                busca={busca}
                                setBusca={setBusca}
                                validateFieldOnChange={validateFieldOnChange}
                                isSubmitting={isSubmitting}
                                cepResp={cepResp}
                                loadingCep={loadingCep}
                                fieldSxStyle={fieldSxStyle}
                                labelSxStyle={labelSxStyle}
                                selectSxStyle={selectSxStyle}
                            />
                        ) : (
                            <SepultamentoProcess
                                form={form}
                                fieldErrors={fieldErrors}
                                searchFal={searchFal}
                                setSearchFal={setSearchFal}
                                showFalList={showFalList}
                                setShowFalList={setShowFalList}
                                filteredFalecidos={filteredFalecidos}
                                handleSelectFalecido={handleSelectFalecido}
                                cpfDoFalecidoSelecionado={cpfDoFalecidoSelecionado}
                                updateFieldByName={updateFieldByName}
                                isSubmitting={isSubmitting}
                                handleChange={handleChange}
                                handleSelectContrato={handleSelectContrato}
                                handleQuadraSepChange={handleQuadraSepChange}
                                quadras={quadras}
                                contratos={contratos}
                                availableCovas={availableCovas}
                                tipoCovaSelecionada={tipoCovaSelecionada}
                                handleClearSepultamento={clearSepultamento}
                                handleVelorioToggle={handleVelorioToggle}
                                validateFieldOnChange={validateFieldOnChange}
                                taxaOptions={taxaOptions}
                                fieldSxStyle={fieldSxStyle}
                                labelSxStyle={labelSxStyle}
                                selectSxStyle={selectSxStyle}
                            />
                        )}
                    </Box>
                </FormStyled>

                <ConfirmationDialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={() => { setConfirmOpen(false); handleConfirmSubmit(); }}
                    title="Confirmar envio"
                    alertSeverity="info"
                    alertMessage="Revise os dados antes de enviar o cadastro."
                    description="Deseja confirmar o envio deste cadastro?"
                    confirmLabel="CONFIRMAR"
                    cancelLabel="CANCELAR"
                    confirmTone="confirm"
                    isSubmitting={isSubmitting}
                    ariaDescriptionId="cadastro-confirm-dialog-description"
                />
            </Container>
        </>
    );
}
