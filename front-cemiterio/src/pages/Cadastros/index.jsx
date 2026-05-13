import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../../services/index.js";
import { useToastFeedback } from "../../hooks/ToastFeedback/useToastFeedback.jsx";
import { applyMaskByFieldName } from "../../utils/masks.js";
import { capitalizeWords } from "../../utils/text.js";
import {
    getFieldError,
    hasErrors,
    isEmpty,
    isValidDateRange,
    RULES_FALECIDO,
    RULES_RESPONSAVEL,
    RULES_SEPULTAMENTO,
    validateForm,
} from "../../utils/validation";
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
} from "./constants";
import {
    BtnClear,
    BtnPrimary,
    CheckboxInput,
    CheckboxLabel,
    CheckboxWrapper,
    Container,
    FormStyled,
    Title,
} from "./styles";

const loadSavedState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (err) {
        console.error("Erro ao carregar estado salvo:", err);
        return null;
    }
};

const saveState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        console.error("Erro ao salvar estado:", err);
    }
};

const clearSavedState = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.error("Erro ao limpar o estado salvo", err);
    }
};

const processFromPath = (pathname) => (
    pathname.includes("/sepultamento")
        ? PROCESS_TYPES.sepultamento
        : PROCESS_TYPES.falecido
);

export default function Cadastros() {
    const navigate = useNavigate();
    const location = useLocation();
    const routeProcessType = processFromPath(location.pathname);
    const saved = useMemo(loadSavedState, []);
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
    const [registros, setRegistros] = useState([]);
    const [searchFal, setSearchFal] = useState(() => (saved?.processType === routeProcessType ? saved?.searchFal || "" : ""));
    const [filteredFalecidos, setFilteredFalecidos] = useState([]);
    const [showFalList, setShowFalList] = useState(false);
    const [busca, setBusca] = useState("");
    const [cidades, setCidades] = useState([]);
    const [cepResp, setCepResp] = useState(() => (saved?.processType === routeProcessType ? saved?.cepResp || "" : ""));
    const [loadingCep, setLoadingCep] = useState(false);
    const [quadras, setQuadras] = useState([]);
    const [covas, setCovas] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIndigente, setIsIndigente] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [falecidos, setFalecidos] = useState([]);

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

    const labelSxStyle = useMemo(() => ({ fontSize: "14px" }), []);

    const selectSxStyle = useMemo(() => ({
        borderRadius: "4px",
        fontSize: "14px",
        "& .Mui-disabled": {
            opacity: isIndigente ? 0.5 : 1,
            transition: "opacity 0.3s ease",
        },
    }), [isIndigente]);

    useEffect(() => {
        if (routeProcessType === processType) return;
        setProcessType(routeProcessType);
        setActiveStep(0);
        setFieldErrors({});
        setIsIndigente(false);
        setForm(routeProcessType === PROCESS_TYPES.sepultamento ? INITIAL_SEPULTAMENTO_FORM : INITIAL_FALECIDO_FORM);
    }, [processType, routeProcessType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveState({ form, processType, cepResp, searchFal });
        }, 500);
        return () => clearTimeout(timer);
    }, [form, processType, cepResp, searchFal]);

    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")
            .then((res) => res.json())
            .then(setCidades)
            .catch((err) => console.error("Erro ao carregar cidades", err));
    }, []);

    useEffect(() => {
        let mounted = true;
        Promise.all([api.get("/quadras"), api.get("/covas")])
            .then(([rq, rc]) => {
                if (!mounted) return;
                setQuadras(Array.isArray(rq.data) ? rq.data : []);
                setCovas(Array.isArray(rc.data) ? rc.data : []);
            })
            .catch(() => {
                if (mounted) {
                    setQuadras([]);
                    setCovas([]);
                }
            });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        api.get("/falecidos")
            .then((res) => {
                if (mounted) setFalecidos(res.data || []);
            })
            .catch(() => {
                if (mounted) setFalecidos([]);
            });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!searchFal) {
            setFilteredFalecidos([]);
            if (processType === PROCESS_TYPES.sepultamento) {
                setForm((prev) => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            }
            return;
        }

        const term = String(searchFal).toLowerCase();
        setFilteredFalecidos(
            (falecidos || [])
                .filter((falecido) => ((falecido.nome_fal || falecido.nome) || "").toLowerCase().includes(term))
                .slice(0, 10),
        );
    }, [falecidos, processType, searchFal]);

    const resultados = useMemo(() => (
        cidades.filter((cidade) => cidade.nome.toLowerCase().includes((busca || "").toLowerCase()))
    ), [busca, cidades]);

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

    const validateFieldOnChange = useCallback((fieldName, value) => {
        if (processType === PROCESS_TYPES.falecido && isIndigente && !ALLOWED_FAL_INDI.has(fieldName)) {
            setFieldErrors((prev) => {
                if (!prev[fieldName]) return prev;
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
            return;
        }

        let rule = processType === PROCESS_TYPES.falecido ? RULES_FALECIDO[fieldName] : RULES_SEPULTAMENTO[fieldName];
        if (!rule && ["nome_resp", "tel_resp", "doc_resp", "prof_resp"].includes(fieldName)) {
            rule = RULES_RESPONSAVEL[fieldName];
        }

        const error = getFieldError(fieldName, value, rule || {});
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (error) next[fieldName] = error;
            else delete next[fieldName];
            return next;
        });
    }, [isIndigente, processType]);

    const handleChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        const incoming = type === "checkbox" ? checked : value;
        let maskedValue = applyMaskByFieldName(name, incoming);

        if (NAME_CASE_FIELDS.has(name)) maskedValue = capitalizeWords(maskedValue);
        if (name === "certidao_obito") maskedValue = String(maskedValue || "").slice(0, 32);

        updateFieldByName(name, maskedValue);
        validateFieldOnChange(name, maskedValue);

        if (name === "taxa") {
            updateFieldByName("taxa_valor", TAXA_MAP[maskedValue] ?? 0);
        }
    }, [updateFieldByName, validateFieldOnChange]);

    const normalizeCep = (value) => String(value || "").replace(/\D/g, "").slice(0, 8);

    const fetchViaCep = async (cepDigits) => {
        if (!cepDigits || cepDigits.length !== 8) return null;
        try {
            setLoadingCep(true);
            const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
            const data = await res.json();
            if (!data || data.erro) return null;

            const formatted = `${data.logradouro || ""}${data.logradouro ? " - " : ""}${data.bairro || ""}${data.bairro && data.localidade ? " - " : ""}${data.localidade || ""}${data.uf ? ` - ${data.uf}` : ""}`.trim();
            return { raw: data, formatted };
        } catch (err) {
            console.error("Erro fetch ViaCEP", err);
            return null;
        } finally {
            setLoadingCep(false);
        }
    };

    const handleCepChange = async (event) => {
        const digits = normalizeCep(event.target.value);
        setCepResp(digits);
        setForm((prev) => ({ ...prev, cep_resp: digits }));
        setFieldErrors((prev) => {
            if (!prev.cep_resp) return prev;
            const next = { ...prev };
            delete next.cep_resp;
            return next;
        });

        if (digits.length === 8) {
            const found = await fetchViaCep(digits);
            if (found) setForm((prev) => ({ ...prev, endereco_resp: found.formatted }));
            else showWarning("CEP nao encontrado. Verifique e tente novamente.");
        }
    };

    const handleCepBlur = async () => {
        const digits = normalizeCep(cepResp);
        if (!digits || digits.length !== 8) return;
        const found = await fetchViaCep(digits);
        if (found) setForm((prev) => ({ ...prev, endereco_resp: found.formatted }));
    };

    const isCovaAvailable = (cova, tituloPosse = "") => {
        const cap = Number(cova?.capacidade ?? 0);
        if (cap <= 0) return false;

        const status = String(cova?.status ?? "").toLowerCase();
        const posse = String(tituloPosse ?? "").toLowerCase();
        if (posse === "sim") {
            return cova.concessao?.ativa === true && !status.includes("lotad") && !status.includes("indispon");
        }
        return !["lotad", "indispon", "reserv", "particular"].some((item) => status.includes(item));
    };

    const computeAvailableCovas = useCallback((covasList, quadraId, tituloPosse) => {
        if (!quadraId) return [];
        const sameQuadra = covasList.filter((cova) => String(cova.quadra_cova ?? cova.quadra ?? cova.quadra_sep ?? "") === String(quadraId));
        const posse = String(tituloPosse ?? "").toLowerCase();
        const filtered = posse === "sim"
            ? sameQuadra.filter((cova) => !!cova.concessao?.ativa)
            : sameQuadra.filter((cova) => !String(cova.status ?? "").toLowerCase().includes("reserv"));
        return filtered.filter((cova) => isCovaAvailable(cova, tituloPosse));
    }, []);

    const availableCovas = useMemo(() => (
        computeAvailableCovas(covas, form.quadra_sep, form.titulo_posse)
    ), [computeAvailableCovas, covas, form.quadra_sep, form.titulo_posse]);

    const tipoCovaSelecionada = useMemo(() => {
        if (!form.quadra_sep || !form.num_sepultura_sep) return "";
        const target = String(form.num_sepultura_sep);
        const byNumber = (list) => list.find((cova) => String(cova.num_cova ?? cova.numero ?? cova.num_sepultura ?? "") === target);
        const found = byNumber(availableCovas) || covas.find((cova) => (
            String(cova.quadra_cova ?? cova.quadra ?? cova.quadra_sep ?? "") === String(form.quadra_sep)
            && String(cova.num_cova ?? cova.numero ?? cova.num_sepultura ?? "") === target
        ));
        return found?.tipo_cova ?? "";
    }, [availableCovas, covas, form.num_sepultura_sep, form.quadra_sep]);

    const handleQuadraSepChange = (val) => {
        setForm((prev) => ({ ...prev, quadra_sep: val, num_sepultura_sep: "" }));
    };

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

    const handleClearFalecido = () => {
        setForm(INITIAL_FALECIDO_FORM);
        setActiveStep(0);
        setFieldErrors({});
        setCepResp("");
        setBusca("");
        setSearchFal("");
        setIsIndigente(false);
        clearSavedState();
    };

    const handleClearSepultamento = () => {
        setForm(INITIAL_SEPULTAMENTO_FORM);
        setActiveStep(0);
        setFieldErrors({});
        setBusca("");
        setSearchFal("");
        setShowFalList(false);
        setIsIndigente(false);
        clearSavedState();
    };

    const handleFileChange = (event, fieldName) => {
        const file = event.target.files?.[0];
        const previewKey = fieldName === "residencia" ? "residencia_preview" : fieldName === "dec_obito" ? "dec_obito_preview" : `${fieldName}_preview`;
        if (!file) {
            setForm((prev) => ({ ...prev, [fieldName]: null, [previewKey]: "" }));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setForm((prev) => ({ ...prev, [fieldName]: file, [previewKey]: reader.result }));
        reader.readAsDataURL(file);
    };

    const hasAnyMeaningfulValue = (obj, ignore = []) => {
        const ignored = new Set(ignore);
        return Object.entries(obj).some(([key, value]) => {
            if (ignored.has(key)) return false;
            if (typeof value === "boolean") return value === true;
            if (value instanceof File) return true;
            return !isEmpty(value);
        });
    };

    const validateBeforeSubmit = () => {
        const ignoreForEmptyCheck = ["taxa_valor", "foi_exumado", "residencia_preview", "dec_obito_preview", "falecido", "falecido_id"];
        const hasAnyFormValue = hasAnyMeaningfulValue(form, ignoreForEmptyCheck);
        const hasSearchValue = processType === PROCESS_TYPES.sepultamento && !isEmpty(searchFal);

        if (!hasAnyFormValue && !hasSearchValue) {
            setFieldErrors({ _form: "Preencha ao menos um campo antes de salvar." });
            return false;
        }

        let rules = {};
        let extraErrors = {};

        if (processType === PROCESS_TYPES.falecido) {
            if (isIndigente) {
                ALLOWED_FAL_INDI.forEach((key) => {
                    if (RULES_FALECIDO[key]) rules[key] = RULES_FALECIDO[key];
                });
            } else {
                rules = { ...RULES_FALECIDO, ...RULES_RESPONSAVEL };
                delete rules.certidao_obito;
            }

            if (!isEmpty(form.data_nasc) && !isEmpty(form.dh_falec) && !isValidDateRange(form.data_nasc, form.dh_falec)) {
                extraErrors.dh_falec = "Data de falecimento nao pode ser anterior a data de nascimento";
            }
        }

        if (processType === PROCESS_TYPES.sepultamento) {
            rules = { ...RULES_SEPULTAMENTO };
            if (isEmpty(searchFal) && isEmpty(form.nome_sep)) {
                extraErrors.nome_fal = "Informe o nome do falecido.";
            }
        }

        const errors = { ...validateForm(form, rules), ...extraErrors };
        setFieldErrors(errors);
        return !hasErrors(errors);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateBeforeSubmit()) {
            showError("Por favor, corrija os erros no formulario");
            return;
        }
        setConfirmOpen(true);
    };

    const goToSepultamento = (falecidoCriado, fallbackNome) => {
        const id = falecidoCriado?.id || "";
        const nome = falecidoCriado?.nome_fal || falecidoCriado?.nome || fallbackNome || "";
        setProcessType(PROCESS_TYPES.sepultamento);
        setActiveStep(0);
        setFieldErrors({});
        setSearchFal(nome);
        setForm({ ...INITIAL_SEPULTAMENTO_FORM, falecido_id: id, falecido: id, nome_sep: nome });
        navigate("/cadastros/sepultamento", { replace: true });
    };

    const handleConfirmSubmit = async () => {
        setConfirmOpen(false);
        setIsSubmitting(true);

        try {
            if (processType === PROCESS_TYPES.falecido) {
                const payload = {
                    ...form,
                    data_nasc: form.data_nasc ? new Date(form.data_nasc).toISOString().split("T")[0] : "",
                    dh_falec: form.dh_falec ? new Date(form.dh_falec).toISOString() : "",
                };
                const response = await api.post("/falecidos", payload);
                showSuccess("Falecido cadastrado. Continue com o sepultamento.");
                clearSavedState();
                setCepResp("");
                setBusca("");
                setIsIndigente(false);
                setFalecidos((prev) => [...prev, response?.data].filter(Boolean));
                goToSepultamento(response?.data, payload.nome_fal);
                return;
            }

            const payload = {
                ...form,
                nome: searchFal || form.nome_sep || form.nome_fal,
                nome_sep: form.nome_sep || searchFal || form.nome_fal,
                taxa_valor: Number(form.taxa_valor ?? TAXA_MAP[form.taxa] ?? 0),
                taxa_label: TAXA_LABEL[form.taxa] ?? "",
                foi_exumado: false,
            };

            const rCheck = await api.get("/covas", { params: { quadra_cova: payload.quadra_sep, num_cova: payload.num_sepultura_sep } }).catch(() => null);
            const foundCheck = rCheck && Array.isArray(rCheck.data) && rCheck.data.length ? rCheck.data[0] : null;

            if (!foundCheck?.id) {
                showWarning("Sepultura nao encontrada para a quadra selecionada.");
                return;
            }

            const cap = Number(foundCheck.capacidade ?? 0);
            if (cap <= 0) {
                await api.patch(`/covas/${foundCheck.id}`, { status: "lotada", capacidade: 0 }).catch(() => {});
                showError("A sepultura selecionada esta lotada. Escolha outra sepultura.");
                return;
            }

            const res = await api.post("/burial", payload);
            const created = res?.data ?? null;
            if (created) window.dispatchEvent(new CustomEvent("processoCriado", { detail: created }));

            setRegistros((prev) => ([...prev, { processType, data: payload }]));
            showSuccess("Sepultamento cadastrado (pendente). Confirme na Dashboard para concluir.");
            clearSavedState();
            handleClearSepultamento();
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
                setFieldErrors((prevErrs) => {
                    const out = { ...prevErrs };
                    Object.keys(out).forEach((key) => {
                        if (!ALLOWED_FAL_INDI.has(key)) delete out[key];
                    });
                    return out;
                });
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
                            <CheckboxLabel>Nao identificado</CheckboxLabel>
                        </CheckboxWrapper>
                    )}

                    <Title>{isFalecidoProcess ? "CADASTRO DE FALECIDO" : "CADASTRO DE SEPULTAMENTO"}</Title>

                    <Box sx={{ mt: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            {isFalecidoProcess ? (
                                <FalecidoProcess
                                    form={form}
                                    fieldErrors={fieldErrors}
                                    activeStep={activeStep}
                                    stepsDeceased={STEPS_DECEASED}
                                    handleChange={handleChange}
                                    handleNextStep={() => setActiveStep((prev) => prev + 1)}
                                    handleBackStep={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 0))}
                                    handleClearFalecido={handleClearFalecido}
                                    updateFieldByName={updateFieldByName}
                                    handleFileChange={handleFileChange}
                                    handleCepChange={handleCepChange}
                                    handleCepBlur={handleCepBlur}
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
                                    handleClearSepultamento={handleClearSepultamento}
                                    validateFieldOnChange={validateFieldOnChange}
                                    fieldSxStyle={fieldSxStyle}
                                    labelSxStyle={labelSxStyle}
                                    selectSxStyle={selectSxStyle}
                                />
                            )}
                        </LocalizationProvider>
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
