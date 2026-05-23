import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import api from "../../services/index.js";
import { useToastFeedback } from "../../hooks/ToastFeedback/useToastFeedback.jsx";
import { applyMaskByFieldName } from "../../utils/masks.js";
import { capitalizeWords } from "../../utils/capitalize.js";
import { formatDateKey, formatDateTimeKey } from "../../utils/date";
import SepultamentoProcess from "../../components/SepultamentoProcess";
import FalecidoProcess from "../../components/FalecidoProcess";
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
import useTaxas from "../../hooks/Taxas/useTaxas";
import { findTaxaByCodigo } from "../../utils/taxas";
import useLocalStorage from "../../hooks/LocalStorage/useLocalStorage";
import useViacepLookup from "../../hooks/ViaCepLookup/useViacepLookup";
import useAvailableCovas from "../../hooks/AvailableCovas/useAvailableCovas";
import useFormValidation from "../../hooks/FormValidation/useFormValidation";
import useFalecidoSearch from "../../hooks/FalecidoSearch/useFalecidoSearch";
import useApiInitDataCad from "../../hooks/ApiInit/useApiInitDataCad.js";
import useFormClear from "../../hooks/FormClear/useFormClear";
import useFileUpload from "../../hooks/FileUpload/useFileUpload";
import useCidadeBusca from "../../hooks/CidadeBusca/useCidadeBusca";
import {
    BtnClear,
    BtnPrimary,
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

export default function Cadastros() {

    const navigate = useNavigate();
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
    const [isIndigente, setIsIndigente] = useState(false);
    const { cep: cepResp, setCep: setCepResp, endereco: enderecoResp, setEndereco: setEnderecoResp, loading: loadingCep, handleCepChange, handleCepBlur } = useViacepLookup();
    const { cidades, quadras, covas, falecidos, setFalecidos } = useApiInitDataCad();
    const { availableCovas, tipoCovaSelecionada, handleQuadraSepChange } = useAvailableCovas(covas, form, setForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

        if (name === "taxa") {
            const selectedTaxa = findTaxaByCodigo(taxas, maskedValue);
            updateFieldByName("taxa_valor", selectedTaxa?.valor ?? TAXA_MAP[maskedValue] ?? 0);
            updateFieldByName("taxa_id", selectedTaxa?.id ?? "");
        }
    }, [taxas, updateFieldByName, validateFieldOnChange]);

    const handleSelectFalecido = (val) => {
        const raw = val === undefined || val === null ? "" : String(val).trim();
        if (raw === "") {
            setForm((prev) => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            return;
        }

        const falecido = falecidos.find((item) => String(item.id) === raw);
        const id = falecido ? falecido.id : "";
        setForm((prev) => ({ ...prev, falecido_id: id, falecido: id, nome_sep: falecido ? (falecido.nome_fal || falecido.nome) : prev.nome_sep }));
    };

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

    const goToSepultamento = (falecidoCriado, fallbackNome) => {
        resetToSepultamento(falecidoCriado, fallbackNome);
        navigate("/cadastros/sepultamento", { replace: true });
    };

    const handleConfirmSubmit = async () => {
        setConfirmOpen(false);
        setIsSubmitting(true);

        try {
            if (processType === PROCESS_TYPES.falecido) {
                const payload = {
                    ...form,
                    data_nasc: form.data_nasc ? formatDateKey(form.data_nasc) : "",
                    dh_falec: form.dh_falec ? formatDateTimeKey(form.dh_falec) : "",
                };
                const response = await api.post("/falecidos", payload);
                showSuccess("Falecido cadastrado. Continue com o sepultamento.");
                clearSaved();
                setCepResp("");
                setEnderecoResp("");
                setBusca("");
                setIsIndigente(false);
                setFalecidos((prev) => [...prev, response?.data].filter(Boolean));
                goToSepultamento(response?.data, payload.nome_fal);
                return;
            }

            const selectedTaxa = findTaxaByCodigo(taxas, form.taxa);
            const sepultamentoPayload = {
                ...form,
                nome: searchFal || form.nome_sep || form.nome_fal,
                nome_sep: form.nome_sep || searchFal || form.nome_fal,
                taxa_id: selectedTaxa?.id ?? form.taxa_id ?? "",
                taxa_valor: Number(selectedTaxa?.valor ?? form.taxa_valor ?? TAXA_MAP[form.taxa] ?? 0),
                taxa_label: selectedTaxa?.label ?? TAXA_LABEL[form.taxa] ?? "",
                foi_exumado: false,
                status: form.com_velorio ? "Aguardando velorio" : "Pendente",
                confirmado: false,
            };

            const rCheck = await api.get("/covas", { params: { blockId: sepultamentoPayload.quadra_sep, number: sepultamentoPayload.num_sepultura_sep } }).catch(() => null);
            const foundCheck = rCheck && Array.isArray(rCheck.data) && rCheck.data.length ? rCheck.data[0] : null;

            if (!foundCheck?.id) {
                showWarning("Sepultura nao encontrada para a quadra selecionada.");
                return;
            }

            const cap = Number(foundCheck.bodyCapacity ?? foundCheck.capacidade ?? 0);
            if (cap <= 0) {
                await api.patch(`/covas/${foundCheck.id}`, { status: "OCCUPIED", bodyCapacity: 0 }).catch(() => { });
                showError("A sepultura selecionada esta lotada. Escolha outra sepultura.");
                return;
            }

            let createdVelorio = null;
            if (form.com_velorio) {
                const velorioPayload = {
                    nome_vel: sepultamentoPayload.nome_sep,
                    nome_fal: sepultamentoPayload.nome_sep,
                    falecido_id: sepultamentoPayload.falecido_id,
                    data_velorio: sepultamentoPayload.dh_inicio_velorio,
                    dh_inicio_velorio: sepultamentoPayload.dh_inicio_velorio,
                    dh_fim_velorio: sepultamentoPayload.dh_fim_velorio,
                    local: sepultamentoPayload.local_velorio,
                    local_velorio: sepultamentoPayload.local_velorio,
                    tipo_velorio: sepultamentoPayload.tipo_velorio,
                    responsavel_velorio: sepultamentoPayload.responsavel_velorio,
                    obs_velorio: sepultamentoPayload.obs_velorio,
                    status: "Pendente",
                    confirmado: false,
                    sepultamento_id: "",
                };

                const velorioResponse = await api.post("/velorios", velorioPayload);
                createdVelorio = velorioResponse?.data ?? null;
                if (createdVelorio?.id) {
                    sepultamentoPayload.velorio_id = createdVelorio.id;
                }
            }

            const res = await api.post("/sepultamentos", sepultamentoPayload);
            const created = res?.data ?? null;

            if (createdVelorio?.id && created?.id) {
                await api.patch(`/velorios/${createdVelorio.id}`, { sepultamento_id: created.id }).catch(() => { });
                createdVelorio = { ...createdVelorio, sepultamento_id: created.id };
            }

            if (createdVelorio) window.dispatchEvent(new CustomEvent("processoCriado", { detail: { ...createdVelorio, _type: "Velório" } }));
            if (created) window.dispatchEvent(new CustomEvent("processoCriado", { detail: { ...created, _type: "Sepultamento" } }));

            setRegistros((prev) => ([...prev, { processType, data: sepultamentoPayload }]));
            showSuccess(form.com_velorio ? "Velório e sepultamento cadastrados. Confirme o velório na Dashboard para liberar o sepultamento." : "Sepultamento cadastrado (pendente). Confirme na Dashboard para concluir.");
            clearSaved();
            clearSepultamento();
        } catch (err) {
            console.error(err);
            showError(`Erro ao cadastrar processo ${processType}`);
        } finally {
            setIsSubmitting(false);
        }
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
                                handleQuadraSepChange={handleQuadraSepChange}
                                quadras={quadras}
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

                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Confirmar envio</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Deseja confirmar o envio deste cadastro?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <BtnClear type="button" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>CANCELAR</BtnClear>
                        <BtnPrimary type="button" onClick={handleConfirmSubmit} disabled={isSubmitting} autoFocus>CONFIRMAR</BtnPrimary>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
}
