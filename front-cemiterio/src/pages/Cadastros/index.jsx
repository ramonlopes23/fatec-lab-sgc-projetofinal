import api from "../../services/index.js";
import React, { useState, useMemo, useEffect } from "react";
import { BtnAction, BtnAction2, BtnPrimary, ColumnLeft, ColumnRight, Container, Field, FormActions, FormGrid, FormStyled, FormTop, Input, SelectTop, SmallLabel, Textarea, Title, TwoCols, InputCova, BtnClear, CheckboxInput, CheckboxLabel, CheckboxWrapper, SearchFieldWrapper, SearchResults, SearchResultItem, FilePreview, InlineFeedback } from "./styles";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import { useToastFeedback } from "../../hooks/ToastFeedback/useToastFeedback.jsx";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { applyMaskByFieldName } from "../../utils/masks.js";
import { capitalizeWords } from "../../utils/text.js";
import { isEmpty, validateForm, isValidDateRange, RULES_FALECIDO, RULES_RESPONSAVEL, RULES_SEPULTAMENTO, getFieldError, hasErrors } from "../../utils/validation"

export default function Cadastros() {

    const {
        showSuccess,
        showWarning,
        showError,
        ToastElement,
    } = useToastFeedback();


    const falecido = {
        nome_fal: "",
        idade: "",
        data_nasc: "",
        dh_falec: "",
        filiacao_pai: "",
        filiacao_mae: "",
        sexo: "",
        cor: "",
        cpf: "",
        rg: "",
        profissao: "",
        estado_civil: "",
        naturalidade: "",
        causa_mortis: "",
        nome_doutor: "",
        certidao_obito: "",
        obs_fal: "",
        residencia: "",
        residencia_preview: "",
        nome_resp: "",
        doc_resp: "",
        prof_resp: "",
        tel_resp: "",
        cep_resp: "",
        endereco_resp: "",
    };


    const sepultamento = {
        nome_sep: "",
        data_obito_sep: "",
        dh_sep: "",
        titulo_posse: "",
        quadra_sep: "",
        num_sepultura_sep: "",
        coveiro_sep: "",
        obs_sep: "",
        taxa: "",
        taxa_valor: 0,
        foi_exumado: false
    }

    const taxa_map = {
        crianca: 56.12,
        crianca_fora: 224.54,
        adulto_terra: 112.27,
        adulto_fora: 430.42,
        adulto_laje: 280.71,
        indigente: 0
    }

    const taxa_label = {
        crianca: "CRIANÇA - R$56,12",
        crianca_fora: "CRIANÇA (FORA DO MUNICÍPIO) - R$224,54",
        adulto_terra: "ADULTO (TERRA) - R$112,27",
        adulto_fora: "ADULTO (FORA DO MUNICÍPIO) - R$430,42",
        adulto_laje: "ADULTO LAJE - R$280,71",
        indigente: "ISENÇÃO POR INDIGÊNCIA"
    }

    const STORAGE_KEY = "cadastro_form_state";

    const loadSavedState = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed;
            }
        } catch (err) {
            console.error("Erro ao carregar estado salvo:", err);
        }
        return null;
    }

    const saveState = (state) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error("Erro ao salvar estado:", err);
        }
    }

    const [form, setForm] = useState(() => {
        const saved = loadSavedState();
        return saved?.form || falecido;
    });
    const [processType, setProcessType] = useState(() => {
        const saved = loadSavedState();
        return saved?.processType || "Cadastro de falecido"
    });
    const [activeStep, setActiveStep] = useState(0);
    const [registros, setRegistros] = useState([]);
    const [searchFal, setSearchFal] = useState(() => {
        const saved = loadSavedState();
        return saved?.searchFal || "";
    });

    const name_case_fields = new Set([
        "nome_fal",
        "filiacao_pai",
        "filiacao_mae",
        "nome_doutor",
        "nome_resp",
    ])

    const [filteredFalecidos, setFilteredFalecidos] = useState([]);
    const [showFalList, setShowFalList] = useState(false);
    const [busca, setBusca] = useState('');
    const [cidades, setCidades] = useState([]);
    const [cepResp, setCepResp] = useState(() => {
        const saved = loadSavedState();
        return saved?.cepResp || "";
    });
    const [loadingCep, setLoadingCep] = useState(false);
    const [quadras, setQuadras] = useState([]);
    const [covas, setCovas] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIndigente, setIsIndigente] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [falecidos, setFalecidos] = useState([]);

    const fieldSxStyle = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "24px"
        },
        "& .MuiOutlinedInput-input": {
            fontSize: "14px"
        },
        "& .MuiInputBase-input::placeholder": {
            opacity: 1
        },
        "& .Mui-disabled": {
            opacity: isIndigente ? 0.5 : 1,
            transition: "opacity 0.3s ease"
        }
    };

    const labelSxStyle = {
        fontSize: "14px"
    };

    const selectSxStyle = {
        borderRadius: "24px",
        fontSize: "14px",
        "& .Mui-disabled": {
            opacity: isIndigente ? 0.5 : 1,
            transition: "opacity 0.3s ease"
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            saveState({
                form,
                processType,
                cepResp,
                searchFal
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [form, processType, cepResp, searchFal]);

    const clearSavedState = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error("Erro ao limpar o estado salvo", err)
        }
    }

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
            .then(res => res.json())
            .then(data => {
                setCidades(data);
            })
            .catch(err => console.error('Erro ao carregar cidades', err))
    }, [])

    const fetchViaCep = async (cepDigits) => {
        if (!cepDigits || cepDigits.length !== 8) return null;
        try {
            setLoadingCep(true);
            const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
            const data = await res.json();
            setLoadingCep(false);
            if (!data || data.erro) {
                return null;
            }

            const formatted = `${data.logradouro || ""}${data.logradouro ? " - " : ""}${data.bairro || ""}${(data.bairro && data.localidade) ? " - " : ""}${data.localidade || ""}${data.uf ? " - " + data.uf : ""}`.trim();
            return { raw: data, formatted };
        } catch (err) {
            setLoadingCep(false);
            console.error("Erro fetch ViaCEP", err);
            return null;
        }
    };

    const resultados = useMemo(() => {
        const filtered = cidades.filter(c =>
            c.nome.toLowerCase().includes((busca || "").toLowerCase())
        );
        return filtered;
    }, [cidades, busca]);

    useEffect(() => {
        if (!searchFal) {
            setFilteredFalecidos([]);
            setForm(prev => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            return;
        }
        const s = String(searchFal).toLowerCase();
        setFilteredFalecidos((falecidos || []).filter(f => ((f.nome_fal || f.nome) || "").toLowerCase().includes(s)).slice(0, 10));
    }, [searchFal, falecidos])

    const isCovaAvailable = (c, tituloPosse = "") => {
        const cap = Number(c?.capacidade ?? 0);
        if (cap <= 0) return false;
        const s = String(c?.status ?? "").toLowerCase();

        const tp = String(tituloPosse ?? "").toLowerCase();
        if (tp === "sim") {
            return (c.concessao && c.concessao.ativa === true) &&
                !s.includes("lotad") && !s.includes("indispon");
        }
        if (s.includes("lotad") || s.includes("indispon") || s.includes("reserv") || s.includes("particular")) {
            return false;
        }
        return true
    };

    useEffect(() => {
        let mounted = true;
        Promise.all([api.get("/quadras"), api.get("/covas")]).then(([rq, rc]) => {
            if (!mounted) return;
            setQuadras(Array.isArray(rq.data) ? rq.data : []);
            setCovas(Array.isArray(rc.data) ? rc.data : []);
        }).catch(() => { if (mounted) { setQuadras([]); setCovas([]); } });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        api.get("/falecidos").then(res => {
            if (!mounted) return;
            setFalecidos(res.data || []);
        }).catch(() => { if (mounted) setFalecidos([]); })
        return () => { mounted = false; };
    }, []);

    const handleQuadraSepChange = (val) => {
        setForm(prev => ({ ...prev, quadra_sep: val, num_sepultura_sep: "" }));
        setAvailableCovas(computeAvailableCovas(covas, val, form.titulo_posse));
    };

    const handleProcessChange = (e) => {
        const val = e.target.value;
        setProcessType(val);
        setActiveStep(0);
        setFieldErrors({})
        if (val === "Cadastro de sepultamento") setForm(sepultamento);
        else setForm(falecido)
    };

    const updateFieldByName = (name, value) => {
        if (!name.includes(".")) {
            setForm(prev => ({ ...prev, [name]: value }));
            return;
        }
        const parts = name.split(".");
        setForm(prev => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i]
                cur[k] = (cur[k] && typeof cur[k] === "object") ? { ...cur[k] } : {};
                cur = cur[k]
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;

        let maskedValue = applyMaskByFieldName(name, incoming);

        if (name_case_fields.has(name)) {
            maskedValue = capitalizeWords(maskedValue)
        }

        if (name === "certidao_obito") {
            maskedValue = String(maskedValue || "").slice(0, 32);
        }

        updateFieldByName(name, maskedValue);
        validateFieldOnChange(name, maskedValue);

        if (name === "taxa") {
            const valor = taxa_map[maskedValue] ?? 0;
            updateFieldByName("taxa_valor", valor);
        }
    };

    const handleSelectFalecido = (val) => {
        const raw = val === undefined || val === null ? "" : String(val).trim();
        if (raw === "") {
            setForm(prev => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            return;
        }
        const byStringId = falecidos.find(x => String(x.id) === raw);
        let f = byStringId;
        if (!f) {
            const pid = parseInt(raw, 10);
            if (!Number.isNaN(pid)) {
                f = falecidos.find(x => Number(x.id) === pid);
            }
        }
        const id = f ? f.id : (Number.isNaN(parseInt(raw, 10)) ? "" : parseInt(raw, 10));
        setForm(prev => ({ ...prev, falecido_id: id, falecido: id, nome_sep: f ? (f.nome_fal || f.nome) : "" }));
    };

    const handleClearFalecido = () => {
        setForm(falecido);
        setActiveStep(0);
        setFieldErrors({});
        setCepResp("");
        setBusca("");
        setSearchFal("");
        clearSavedState();
        setIsIndigente(false)
    };

    const handleClearSepultamento = () => {
        setForm({
            ...sepultamento,
            falecido_id: "",
            falecido: "",
            nome_sep: ""
        });
        setActiveStep(0);
        setFieldErrors({});
        setBusca("");
        setSearchFal("");
        setShowFalList(false);
        setAvailableCovas([]);
        clearSavedState();
        setIsIndigente(false);
    }

    const validateFieldOnChange = (fieldName, value) => {
        if (processType === "Cadastro de falecido" && isIndigente && !ALLOWED_FAL_INDI.has(fieldName)) {
            setFieldErrors(prev => {
                if (!prev[fieldName]) return prev;
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
            return;
        }

        let rule = {};
        if (processType === "Cadastro de falecido") {
            rule = RULES_FALECIDO[fieldName];
        } else if (processType === "Cadastro de sepultamento") {
            rule = RULES_SEPULTAMENTO[fieldName];
        }
        if (!rule && (fieldName === "nome_resp" || fieldName === "tel_resp" || fieldName === "doc_resp" || fieldName === "prof_resp")) {
            rule = RULES_RESPONSAVEL[fieldName];
        }

        const error = getFieldError(fieldName, value, rule);
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[fieldName] = error;
            } else {
                delete newErrors[fieldName];
            }
            return newErrors;
        })
    }

    const hasAnyMeaningfulValue = (obj, ignore = []) => {
        const ignoreSet = new Set(ignore);
        return Object.entries(obj).some(([k, v]) => {
            if (ignoreSet.has(k)) return false;
            if (typeof v === "boolean") return v === true;
            if (v instanceof File) return true;
            return !isEmpty(v);
        })
    };

    const validateBeforeSubmit = () => {
        const ignoreForEmptyCheck = [
            "taxa_valor",
            "foi_exumado",
            "residencia_preview",
            "falecido",
            "falecido_id",
        ];

        const hasAnyFormValue = hasAnyMeaningfulValue(form, ignoreForEmptyCheck);
        const hasSearchValue = processType === "Cadastro de sepultamento" && !isEmpty(searchFal);

        if (!hasAnyFormValue && !hasSearchValue) {
            const errors = { _form: "Preencha ao menos um campo antes de salvar." };
            setFieldErrors(errors);
            return false;
        }

        let rules = {};
        let extra_errors = {};

        if (processType === "Cadastro de falecido") {
            if (isIndigente) {
                ALLOWED_FAL_INDI.forEach((k) => {
                    if (RULES_FALECIDO[k]) rules[k] = RULES_FALECIDO[k];
                });
            } else {
                rules = { ...RULES_FALECIDO, ...RULES_RESPONSAVEL };
                delete rules.certidao_obito;
            }

            if (!isEmpty(form.data_nasc) && !isEmpty(form.dh_falec)) {
                if (!isValidDateRange(form.data_nasc, form.dh_falec)) {
                    extra_errors.dh_falec = "Data de falecimento não pode ser anterior à data de nascimento";
                }
            }
        }

        if (processType === "Cadastro de sepultamento") {
            rules = { ...RULES_SEPULTAMENTO };

            if (isEmpty(form.falecido) && isEmpty(form.falecido_id)) {
                extra_errors.nome_fal = "Selecione um falecido.";
            }
        }

        const errors = { ...validateForm(form, rules), ...extra_errors };
        setFieldErrors(errors);
        return !hasErrors(errors)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateBeforeSubmit()) {
            showError("Por favor, corrija os erros no formulário");
            return
        }

        setConfirmOpen(true);
    };

    const handleNextStep = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBackStep = () => {
        setActiveStep((prev) => (prev > 0 ? prev - 1 : 0));
    };

    const handleConfirmSubmit = async () => {
        setConfirmOpen(false);
        setIsSubmitting(true);

        try {
            if (processType === "Cadastro de falecido") {
                const payload = {
                    ...form,
                    data_nasc: form.data_nasc ? new Date(form.data_nasc).toISOString().split("T")[0] : "",
                    dh_falec: form.dh_falec ? new Date(form.dh_falec).toISOString() : "",
                };

                await api.post("/falecidos", payload);
                showSuccess("Falecido cadastrado");
                clearSavedState();
                setForm(falecido);
                setActiveStep(0);
                setFieldErrors({});
                setIsIndigente(false);
                setCepResp("");
                setBusca("");
                return;
            }

            if (processType === "Cadastro de sepultamento") {
                const payload = {
                    ...form,
                    nome: searchFal || form.nome_sep || form.nome_fal,
                };

                if (!payload.nome_sep && payload.falecido) {
                    const f = falecidos.find((x) => Number(x.id) === Number(payload.falecido));
                    if (f) payload.nome_sep = f.nome_fal || f.nome;
                }

                payload.taxa_valor = Number(payload.taxa_valor ?? taxa_map[payload.taxa] ?? 0);
                payload.taxa_label = taxa_label[payload.taxa] ?? "";
                payload.foi_exumado = false;

                const paramsCheck = { params: { quadra_cova: payload.quadra_sep, num_cova: payload.num_sepultura_sep } };
                const rCheck = await api.get("/covas", paramsCheck).catch(() => null);
                const foundCheck = rCheck && Array.isArray(rCheck.data) && rCheck.data.length ? rCheck.data[0] : null;

                if (foundCheck && foundCheck.id == null) {
                    showWarning("Sepultura não encontrada para a quadra selecionada.");
                    return;
                }

                const cap = Number(foundCheck.capacidade ?? 0);
                if (cap <= 0) {
                    await api.patch("/covas/" + foundCheck.id, { status: "lotada", capacidade: 0 }).catch(() => { });
                    showError("A sepultura selecionada está lotada. Escolha outra sepultura.");
                    return;
                }

                const res = await api.post("/burial", payload);
                const created = res?.data ?? null;

                try {
                    if (created) window.dispatchEvent(new CustomEvent("processoCriado", { detail: created }));
                } catch {
                    //
                }

                setRegistros((prev) => ([...prev, { processType, data: payload }]));
                showSuccess("Sepultamento cadastrado (pendente). Confirme na Dashboard para concluir.");
                clearSavedState();
                setForm(sepultamento);
                setActiveStep(0);
                setFieldErrors({});
                setSearchFal("");
                return;
            }

            showError("Tipo de processo inválido");
        } catch (err) {
            console.error(err);
            showError(`Erro ao cadastrar processo ${processType}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files && e.target.files[0];
        const previewKey = fieldName === "residencia" ? "residencia_preview" : fieldName === "dec_obito" ? "dec_obito_preview" : fieldName + "_preview";

        if (!file) {
            setForm(prev => ({ ...prev, [fieldName]: null, [previewKey]: "" }))
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setForm(prev => ({ ...prev, [fieldName]: file, [previewKey]: reader.result }))
        };
        reader.readAsDataURL(file);
    };

    const computeAvailableCovas = (covas, quadraId, tituloPosse) => {
        if (!quadraId) return [];
        const list = covas.filter(c => {
            const key = String(c.quadra_cova ?? c.quadra ?? c.quadra_sep ?? "");
            return String(key) === String(quadraId);
        });

        const tp = String(tituloPosse ?? "").toLowerCase();
        let out = list;

        if (tp === "sim") {
            out = list.filter(c => !!(c.concessao && c.concessao.ativa));
        }
        else if (tp === "não" || tp === "nao" || tp === "Não") {
            out = list.filter(c => !String(c.status ?? "").toLowerCase().includes("reserv"));
        } else {
            out = list;
        }
        return out = out.filter(c => isCovaAvailable(c, tituloPosse));
    };

    const normalizeCep = (v) => (String(v || "").replace(/\D/g, "").slice(0, 8));

    const handleCepChange = async (ev) => {
        const raw = ev.target.value || "";
        const digits = normalizeCep(raw);
        setCepResp(digits);
        setForm(prev => ({ ...prev, cep_resp: digits }))
        setFieldErrors(prev => {
            if (!prev.cep_resp) return prev;
            const next = { ...prev };
            delete next.cep_resp;
            return next;
        })

        if (digits.length === 8) {
            const found = await fetchViaCep(digits);
            if (found) {
                setForm(prev => ({ ...prev, endereco_resp: found.formatted }));
            } else {
                showWarning("CEP não encontrado. Verifique e tente novamente.");
            }
        }
    };

    const handleCepBlur = async () => {
        const digits = normalizeCep(cepResp);
        if (!digits || digits.length !== 8) return;
        const found = await fetchViaCep(digits);
        if (found) {
            setForm(prev => ({ ...prev, endereco_resp: found.formatted }));
        }
    };

    const availableCovas = useMemo(() => {
        return computeAvailableCovas(covas, form.quadra_sep, form.titulo_posse);
    }, [covas, form.quadra_sep, form.titulo_posse])

    const [setAvailableCovas] = useState([]);

    const tipoCovaSelecionada = useMemo(() => {
        if (!form.quadra_sep || !form.num_sepultura_sep) return "";
        const target = String(form.num_sepultura_sep);
        const byNumber = (list) => list.find(c =>
            String(c.num_cova ?? c.numero ?? c.num_sepultura ?? "") === String(form.num_sepultura_sep)
        );
        let found = byNumber(availableCovas);
        if (!found) {
            found = covas.find(c =>
                String(c.quadra_cova ?? c.quadra ?? c.quadra_sep ?? "") === String(form.quadra_sep) &&
                String(c.num_cova ?? c.numero ?? c.num_sepultura ?? "") === target
            );
        }
        return found?.tipo_cova ?? "";
    }, [form.quadra_sep, form.num_sepultura_sep, covas, availableCovas]);

    const ALLOWED_FAL_INDI = new Set([
        'nome_fal', 'sexo', 'cor', 'dh_falec', 'causa_mortis', 'obs_fal'
    ]);

    const disabledFor = (name) => isSubmitting || (processType === 'Cadastro de falecido' && isIndigente && !ALLOWED_FAL_INDI.has(name));

    const handleToggleIndigente = () => {
        setIsIndigente(prev => {
            const next = !prev;
            if (next && processType === 'Cadastro de falecido') {
                setForm(prevForm => {
                    const resets = {};
                    for (const key in falecido) {
                        if (!ALLOWED_FAL_INDI.has(key)) resets[key] = falecido[key];
                    }
                    return { ...prevForm, ...resets };
                });
                setFieldErrors(prevErrs => {
                    const out = { ...prevErrs };
                    Object.keys(out).forEach(k => {
                        if (!ALLOWED_FAL_INDI.has(k)) delete out[k];
                    });
                    return out;
                });
            }
            return next;
        })
    }

    const cpfDoFalecidoSelecionado = useMemo(() => {
        const id = form.falecido || form.falecido_id;
        if (id) {
            const f = (falecidos || []).find(x => String(x.id) === String(id));
            if (f && f.cpf) return applyMaskByFieldName('cpf', f.cpf);
        }
        return form.cpf ? applyMaskByFieldName('cpf', form.cpf) : "-";
    }, [form.falecido, form.falecido_id, form.cpf, falecidos]);

    const stepsDeceased = [
        "Dados do Falecido",
        "Documentação",
        "Responsável",
        "Revisão"
    ];

    return (
        <>
            {ToastElement}
            <Container>
                <FormStyled onSubmit={handleSubmit}>
                    <CheckboxWrapper>
                        <CheckboxInput type="button" onClick={handleToggleIndigente} aria-pressed={isIndigente} />
                        <CheckboxLabel>Não identificado </CheckboxLabel>
                    </CheckboxWrapper>
                    <Title>CADASTRO DE PROCESSOS</Title>

                    <Box sx={{ mt: 3 }}>
                        {processType === "Cadastro de sepultamento" ? (
                            <Stepper activeStep={0} orientation="vertical">
                                <Step>
                                    <StepLabel>Sepultamento</StepLabel>
                                    <StepContent>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12 }}>
                                                <SearchFieldWrapper>
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        label="Nome do falecido"
                                                        type="text"
                                                        name="nome_fal"
                                                        placeholder="Digite o nome do falecido..."
                                                        error={!!fieldErrors.nome_fal}
                                                        helperText={fieldErrors.nome_fal}
                                                        value={searchFal}
                                                        onChange={(e) => { setSearchFal(e.target.value); setShowFalList(true); validateFieldOnChange("nome_fal", e.target.value) }}
                                                        onFocus={() => setShowFalList(true)}
                                                        onBlur={() => setTimeout(() => setShowFalList(false), 150)}
                                                        sx={fieldSxStyle}
                                                        slotProps={{
                                                            inputLabel: { sx: labelSxStyle }
                                                        }}
                                                    />
                                                    {showFalList && filteredFalecidos.length > 0 && (
                                                        <SearchResults>
                                                            {filteredFalecidos.map((f) => (
                                                                <SearchResultItem key={f.id}
                                                                    onMouseDown={(ev) => {
                                                                        ev.preventDefault();
                                                                        handleSelectFalecido(String(f.id));
                                                                        setSearchFal(f.nome_fal || f.nome || "");
                                                                        setShowFalList(false);
                                                                    }}>
                                                                    {f.nome_fal || f.nome}
                                                                </SearchResultItem>
                                                            ))}
                                                        </SearchResults>
                                                    )}
                                                </SearchFieldWrapper>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="CPF do falecido"
                                                    value={cpfDoFalecidoSelecionado}
                                                    disabled
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth variant="outlined" type="date" name="data_obito_sep" label="Data do óbito" value={form.data_obito_sep} onChange={handleChange} error={!!fieldErrors.data_obito_sep} helperText={fieldErrors.data_obito_sep} disabled={isSubmitting} InputLabelProps={{ shrink: true }} sx={fieldSxStyle} slotProps={{ inputLabel: { sx: labelSxStyle } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth variant="outlined" type="datetime-local" name="dh_sep" label="Data e hora do sepultamento" value={form.dh_sep} onChange={handleChange} error={!!fieldErrors.dh_sep} helperText={fieldErrors.dh_sep} placeholder="Sala" disabled={isSubmitting} InputLabelProps={{ shrink: true }} sx={fieldSxStyle} slotProps={{ inputLabel: { sx: labelSxStyle } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <FormControl fullWidth error={!!fieldErrors.titulo_posse}>
                                                    <InputLabel sx={labelSxStyle}>Possui título de posse?</InputLabel>
                                                    <Select label="Possui título de posse?" name="titulo_posse" value={form.titulo_posse} onChange={handleChange} sx={selectSxStyle}>
                                                        <MenuItem value="">Selecione a opção</MenuItem>
                                                        <MenuItem value="Sim">Sim</MenuItem>
                                                        <MenuItem value="Não">Não</MenuItem>
                                                    </Select>
                                                    {fieldErrors.titulo_posse && <FormHelperText>{fieldErrors.titulo_posse}</FormHelperText>}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <FormControl fullWidth error={!!fieldErrors.quadra_sep}>
                                                    <InputLabel sx={labelSxStyle}>Quadra</InputLabel>
                                                    <Select
                                                        label="Quadra"
                                                        name="quadra_sep"
                                                        value={form.quadra_sep ?? ""}
                                                        onChange={(e) => handleQuadraSepChange(e.target.value)}
                                                        disabled={isSubmitting}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione a quadra</MenuItem>
                                                        {quadras.map(q => (
                                                            <MenuItem key={String(q.id)} value={String(q.id)}>
                                                                {q.num_quadra ? `Quadra ${q.num_quadra}` : q.nome || `Quadra ${q.id}`}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {fieldErrors.quadra_sep && <FormHelperText>{fieldErrors.quadra_sep}</FormHelperText>}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <FormControl fullWidth error={!!fieldErrors.num_sepultura_sep}>
                                                    <InputLabel sx={labelSxStyle}>Nº da sepultura</InputLabel>
                                                    <Select
                                                        label="Nº da sepultura"
                                                        name="num_sepultura_sep"
                                                        value={form.num_sepultura_sep ?? ""}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                        error={!!fieldErrors.num_sepultura_sep}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione a sepultura</MenuItem>
                                                        {availableCovas.map(c => {
                                                            const val = String(c.num_cova ?? c.numero ?? c.num_sepultura ?? "");
                                                            const isReserved = String(c.status ?? "").toLowerCase().includes("reserv");
                                                            return (
                                                                <MenuItem key={String(c.id ?? `${c.quadra_cova}-${c.num_cova}`)} value={val}>
                                                                    {val}{isReserved ? "(Particular)" : ""}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </Select>
                                                    {fieldErrors.num_sepultura_sep && <FormHelperText>{fieldErrors.num_sepultura_sep}</FormHelperText>}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Tipo de sepultura"
                                                    value={tipoCovaSelecionada || "-"}
                                                    disabled
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <FormControl fullWidth error={!!fieldErrors.taxa}>
                                                    <InputLabel sx={labelSxStyle}>Taxa de sepultamento</InputLabel>
                                                    <Select
                                                        label="Taxa de sepultamento"
                                                        name="taxa"
                                                        value={form.taxa}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione o tipo de taxa</MenuItem>
                                                        <MenuItem value="crianca">CRIANÇA - R$56,12</MenuItem>
                                                        <MenuItem value="crianca_fora">CRIANÇA (FORA DO MUNICÍPIO) - R$224,54</MenuItem>
                                                        <MenuItem value="adulto_terra">ADULTO (TERRA) - R$112,27</MenuItem>
                                                        <MenuItem value="adulto_fora">ADULTO (FORA DO MUNICÍPIO) - R$430,42</MenuItem>
                                                        <MenuItem value="adulto_laje">ADULTO LAJE - R$280,71</MenuItem>
                                                        <MenuItem value="indigente">ISENÇÃO POR INDIGÊNCIA</MenuItem>
                                                    </Select>
                                                    {fieldErrors.taxa && <FormHelperText>{fieldErrors.taxa}</FormHelperText>}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Observações"
                                                    name="obs_sep"
                                                    value={form.obs_sep}
                                                    onChange={handleChange}
                                                    placeholder="Observações..."
                                                    multiline
                                                    rows={4}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mb: 2, mt: 3, display: 'flex', gap: 1 }}>
                                            <BtnAction2 type="button" onClick={handleClearSepultamento} disabled={isSubmitting}>LIMPAR</BtnAction2>
                                            <BtnAction type="submit" disabled={isSubmitting || hasErrors(fieldErrors)}>SALVAR</BtnAction>
                                        </Box>
                                    </StepContent>
                                </Step>
                            </Stepper>
                        ) : (
                            <Stepper activeStep={activeStep} orientation="vertical">

                                <Step>
                                    <StepLabel>{stepsDeceased[0]}</StepLabel>
                                    <StepContent>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Nome completo"
                                                    name="nome_fal"
                                                    value={form.nome_fal}
                                                    onChange={handleChange}
                                                    placeholder="Digite o nome do falecido"
                                                    error={!!fieldErrors.nome_fal}
                                                    helperText={fieldErrors.nome_fal}
                                                    disabled={disabledFor('nome_fal')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Idade"
                                                    name="idade"
                                                    value={form.idade}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.idade}
                                                    helperText={fieldErrors.idade}
                                                    disabled={disabledFor('idade')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 2 }}>
                                                <FormControl fullWidth error={!!fieldErrors.sexo}>
                                                    <InputLabel sx={labelSxStyle}>Sexo</InputLabel>
                                                    <Select
                                                        label="Sexo"
                                                        name="sexo"
                                                        value={form.sexo}
                                                        onChange={handleChange}
                                                        disabled={disabledFor('sexo')}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione</MenuItem>
                                                        <MenuItem value="masculino">Masculino</MenuItem>
                                                        <MenuItem value="feminino">Feminino</MenuItem>
                                                    </Select>
                                                    {fieldErrors.sexo && <FormHelperText>{fieldErrors.sexo}</FormHelperText>}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 2 }}>
                                                <FormControl fullWidth error={!!fieldErrors.estado_civil}>
                                                    <InputLabel sx={labelSxStyle}>Estado civil</InputLabel>
                                                    <Select
                                                        label="Estado civil"
                                                        name="estado_civil"
                                                        value={form.estado_civil}
                                                        onChange={handleChange}
                                                        disabled={disabledFor('estado_civil')}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione o estado civil</MenuItem>
                                                        <MenuItem value="Solteiro">Solteiro(a)</MenuItem>
                                                        <MenuItem value="Casado">Casado(a)</MenuItem>
                                                        <MenuItem value="Separado">Separado(a)</MenuItem>
                                                        <MenuItem value="Divorciado">Divorciado(a)</MenuItem>
                                                        <MenuItem value="Viúvo">Viúvo(a)</MenuItem>
                                                    </Select>
                                                    {fieldErrors.estado_civil && <FormHelperText>{fieldErrors.estado_civil}</FormHelperText>}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 2 }}>
                                                <FormControl fullWidth error={!!fieldErrors.cor}>
                                                    <InputLabel sx={labelSxStyle}>Cor</InputLabel>
                                                    <Select
                                                        label="Cor"
                                                        name="cor"
                                                        value={form.cor}
                                                        onChange={handleChange}
                                                        disabled={disabledFor('cor')}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione a cor</MenuItem>
                                                        <MenuItem value="Branca">Branca</MenuItem>
                                                        <MenuItem value="Preta">Preta</MenuItem>
                                                        <MenuItem value="Parda">Parda</MenuItem>
                                                        <MenuItem value="Amarela">Amarela</MenuItem>
                                                        <MenuItem value="Indígena">Indígena</MenuItem>
                                                    </Select>
                                                    {fieldErrors.cor && <FormHelperText>{fieldErrors.cor}</FormHelperText>}
                                                </FormControl>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="date"
                                                    name="data_nasc"
                                                    label="Data de nascimento"
                                                    value={form.data_nasc}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.data_nasc}
                                                    helperText={fieldErrors.data_nasc}
                                                    disabled={disabledFor('data_nasc')}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="datetime-local"
                                                    name="dh_falec"
                                                    label="Data e hora de falecimento"
                                                    value={form.dh_falec}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.dh_falec}
                                                    helperText={fieldErrors.dh_falec}
                                                    disabled={disabledFor('dh_falec')}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Filiação pai"
                                                    name="filiacao_pai"
                                                    value={form.filiacao_pai}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.filiacao_pai}
                                                    helperText={fieldErrors.filiacao_pai}
                                                    disabled={disabledFor('filiacao_pai')}
                                                    placeholder="Digite o nome do pai"
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Filiação mãe"
                                                    name="filiacao_mae"
                                                    value={form.filiacao_mae}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.filiacao_mae}
                                                    helperText={fieldErrors.filiacao_mae}
                                                    disabled={disabledFor('filiacao_mae')}
                                                    placeholder="Digite o nome da mãe"
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Profissão"
                                                    name="profissao"
                                                    value={form.profissao}
                                                    onChange={handleChange}
                                                    placeholder="Digite a profissão do falecido"
                                                    error={!!fieldErrors.profissao}
                                                    helperText={fieldErrors.profissao}
                                                    disabled={disabledFor('profissao')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={resultados}
                                                    getOptionLabel={(option) => `${option.nome} - ${option?.microrregiao?.mesorregiao?.UF?.sigla || ''}`}
                                                    inputValue={busca}
                                                    onInputChange={(_, newInputValue) => {
                                                        updateFieldByName('naturalidade', newInputValue)
                                                        setBusca(newInputValue);
                                                        validateFieldOnChange("naturalidade", newInputValue);
                                                    }}
                                                    onChange={(_, newValue) => {
                                                        const displayValue = newValue ? `${newValue.nome} - ${newValue?.microrregiao?.mesorregiao?.UF?.sigla || ''}` : '';
                                                        updateFieldByName('naturalidade', displayValue);
                                                        validateFieldOnChange("naturalidade", displayValue);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Naturalidade"
                                                            placeholder="Digite a naturalidade do falecido"
                                                            error={!!fieldErrors.naturalidade}
                                                            helperText={fieldErrors.naturalidade}
                                                            disabled={disabledFor('naturalidade')}
                                                            sx={fieldSxStyle}
                                                            slotProps={{
                                                                inputLabel: { sx: labelSxStyle }
                                                            }}
                                                        />
                                                    )}
                                                    noOptionsText="Nenhuma cidade encontrada"
                                                    loadingText="Carregando..."
                                                    disabled={isSubmitting}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Causa mortis"
                                                    name="causa_mortis"
                                                    value={form.causa_mortis}
                                                    onChange={handleChange}
                                                    placeholder="Digite a causa da morte"
                                                    error={!!fieldErrors.causa_mortis}
                                                    helperText={fieldErrors.causa_mortis}
                                                    disabled={disabledFor('causa_mortis')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Observações"
                                                    name="obs_fal"
                                                    value={form.obs_fal}
                                                    onChange={handleChange}
                                                    placeholder="Observações..."
                                                    error={!!fieldErrors.obs_fal}
                                                    helperText={fieldErrors.obs_fal}
                                                    disabled={disabledFor('obs_fal')}
                                                    multiline
                                                    rows={4}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mb: 2, mt: 3 }}>
                                            <BtnAction onClick={handleNextStep} disabled={isSubmitting}>PRÓXIMO</BtnAction>
                                        </Box>
                                    </StepContent>
                                </Step>

                                <Step>
                                    <StepLabel>{stepsDeceased[1]}</StepLabel>
                                    <StepContent>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="CPF do falecido"
                                                    name="cpf"
                                                    value={form.cpf || ""}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.cpf}
                                                    helperText={fieldErrors.cpf}
                                                    disabled={disabledFor('cpf')}
                                                    placeholder="000.000.000-00"
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="RG do falecido"
                                                    name="rg"
                                                    value={form.rg}
                                                    onChange={handleChange}
                                                    placeholder="00.000.000-0"
                                                    error={!!fieldErrors.rg}
                                                    helperText={fieldErrors.rg}
                                                    disabled={disabledFor('rg')}
                                                    maxLength={12}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Nome do médico responsável"
                                                    name="nome_doutor"
                                                    value={form.nome_doutor}
                                                    onChange={handleChange}
                                                    placeholder="Digite o nome do médico"
                                                    error={!!fieldErrors.nome_doutor}
                                                    helperText={fieldErrors.nome_doutor}
                                                    disabled={disabledFor('nome_doutor')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Comprovante de residência"
                                                    type="file"
                                                    accept="image/*"
                                                    InputLabelProps={{ shrink: true }}
                                                    onChange={e => handleFileChange(e, "residencia")}
                                                    sx={fieldSxStyle}
                                                />
                                                {form.residencia_preview && (
                                                    <FilePreview src={form.residencia_preview} alt="preview comprovante" />
                                                )}
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Declaração de óbito"
                                                    type="file"
                                                    accept="image/*"
                                                    InputLabelProps={{ shrink: true }}
                                                    name="dec_obito"
                                                    onChange={e => handleFileChange(e, "dec_obito")}
                                                    sx={fieldSxStyle}
                                                />
                                                {form.dec_obito_preview && (
                                                    <FilePreview src={form.dec_obito_preview} alt="preview declaração de óbito" />
                                                )}
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mb: 2, mt: 3, display: 'flex', gap: 1 }}>
                                            <BtnAction2 onClick={handleBackStep} disabled={isSubmitting}>VOLTAR</BtnAction2>
                                            <BtnAction onClick={handleNextStep} disabled={isSubmitting}>PRÓXIMO</BtnAction>
                                        </Box>
                                    </StepContent>
                                </Step>

                                <Step>
                                    <StepLabel>{stepsDeceased[2]}</StepLabel>
                                    <StepContent>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Nome do familiar ou responsável"
                                                    name="nome_resp"
                                                    value={form.nome_resp}
                                                    onChange={handleChange}
                                                    placeholder="Digite o nome do responsável"
                                                    error={!!fieldErrors.nome_resp}
                                                    helperText={fieldErrors.nome_resp}
                                                    disabled={disabledFor('nome_resp')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="CPF do responsável"
                                                    name="doc_resp"
                                                    value={form.doc_resp || ""}
                                                    onChange={handleChange}
                                                    placeholder="000.000.000-00"
                                                    error={!!fieldErrors.doc_resp}
                                                    helperText={fieldErrors.doc_resp}
                                                    disabled={disabledFor('doc_resp')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Profissão do responsável"
                                                    name="prof_resp"
                                                    value={form.prof_resp || ""}
                                                    onChange={handleChange}
                                                    placeholder="Profissão do responsável"
                                                    error={!!fieldErrors.prof_resp}
                                                    helperText={fieldErrors.prof_resp}
                                                    disabled={disabledFor('prof_resp')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Contato do responsável"
                                                    name="tel_resp"
                                                    value={form.tel_resp}
                                                    onChange={handleChange}
                                                    placeholder="(XX)XXXXX-XXXX"
                                                    error={!!fieldErrors.tel_resp}
                                                    helperText={fieldErrors.tel_resp}
                                                    disabled={disabledFor('tel_resp')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="CEP"
                                                    name="cep_resp"
                                                    value={cepResp ? (cepResp.length > 5 ? cepResp.replace(/^(\d{5})(\d{1,3})/, "$1-$2") : cepResp) : ""}
                                                    onChange={handleCepChange}
                                                    onBlur={handleCepBlur}
                                                    placeholder="00000-000"
                                                    error={!!fieldErrors.cep_resp}
                                                    helperText={fieldErrors.cep_resp}
                                                    disabled={disabledFor('cep_resp')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                                {loadingCep && <InlineFeedback>Buscando...</InlineFeedback>}
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Endereço do responsável"
                                                    name="endereco_resp"
                                                    value={form.endereco_resp}
                                                    onChange={handleChange}
                                                    placeholder="Rua, bairro, cidade - UF"
                                                    error={!!fieldErrors.endereco_resp}
                                                    helperText={fieldErrors.endereco_resp}
                                                    disabled={disabledFor('endereco_resp')}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mb: 2, mt: 3, display: 'flex', gap: 1 }}>
                                            <BtnAction2 onClick={handleBackStep} disabled={isSubmitting}>VOLTAR</BtnAction2>
                                            <BtnAction onClick={handleNextStep} disabled={isSubmitting}>PRÓXIMO</BtnAction>
                                        </Box>
                                    </StepContent>
                                </Step>

                                <Step>
                                    <StepLabel>{stepsDeceased[3]}</StepLabel>
                                    <StepContent>
                                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Nome:</strong> {form.nome_fal || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Sexo:</strong> {form.sexo || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Idade:</strong> {form.idade || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>CPF:</strong> {form.cpf || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Data de Nascimento:</strong> {form.data_nasc || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Data e Hora de Falecimento:</strong> {form.dh_falec || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Responsável:</strong> {form.nome_resp || '-'}
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <strong>Contato:</strong> {form.tel_resp || '-'}
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Box sx={{ mb: 2, mt: 3, display: 'flex', gap: 1 }}>
                                            <BtnAction2 type="button" onClick={handleClearFalecido} disabled={isSubmitting}>LIMPAR</BtnAction2>
                                            <BtnAction2 onClick={handleBackStep} disabled={isSubmitting}>VOLTAR</BtnAction2>
                                            <BtnAction type="submit" disabled={isSubmitting || hasErrors(fieldErrors)}>SALVAR</BtnAction>
                                        </Box>
                                    </StepContent>
                                </Step>
                            </Stepper>
                        )}
                    </Box>
                </FormStyled>
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Confirmar envio</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Deseja confirmar o envio deste cadastro?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <BtnClear onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>CANCELAR</BtnClear>
                        <BtnPrimary onClick={handleConfirmSubmit} disabled={isSubmitting} autoFocus>CONFIRMAR</BtnPrimary>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    )
}
