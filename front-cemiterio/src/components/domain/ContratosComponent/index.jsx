import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { useLocation } from "react-router-dom";
import {
    FaCheckCircle,
    FaClock,
    FaDollarSign,
    FaEye,
    FaFileContract,
    FaFilter,
    FaPlus,
    FaRegEdit,
    FaSearch,
    FaTimesCircle,
    FaTrash,
} from "react-icons/fa";
import {
    Card,
    CardBody,
    CardTitle,
    Container,
    FilterGrid,
    FiltersPanel,
    FormStyled,
    HeaderActions,
    HeaderCopy,
    IconBtn,
    Input,
    PageHeader,
    SearchWrapper,
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    Title,
    Subtitle,
    SepulturaFieldRoot,
    SepulturaInputRow,
    SepulturaPreviewButton,
    SepulturaPreviewGrid,
    SepulturaPreviewHeader,
    SepulturaPreviewHint,
    SepulturaPreviewOption,
    SepulturaPreviewPanel,
} from "./styles";
import {
    Actions,
    StatusBadge,
    Table,
    TableScroller,
    TableWrapper,
    TBody,
    Td,
    TdLocal,
    TdStatus,
    TdValue,
    Th,
    THead,
    Tr,
} from "../../common/DefaultTable";
import { getContratos, createContrato, updateContrato, deleteContrato } from "../../../services/contratoService.js";
import { getBlocks } from "../../../services/blockService.js";
import { getGrave, createGrave, updateGrave } from "../../../services/graveService.js";
import { getSepultamentos } from "../../../services/sepultamentoService.js";
import { useCemeteryStore } from "../../../stores";
import { applyMaskByFieldName, currencyInputMask, formatCurrencyBRL, formatDateDMY, formatDateTimeKey, formatQuadraDisplay, getValidityBucket, normalizeQuadra, normalizeSearchText, parseCurrencyInput, parseDateValue } from "../../../utils";
import { useFormModal, useToastFeedback } from "../../../hooks";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import SystemButton from "../../common/SystemButton";
import SystemSelect from "../../common/SystemSelect";
import DefaultModal, {
    DefaultModalActions,
    DefaultModalGrid,
} from "../../common/DefaultModal";

const STATUS_OPTIONS = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" },
    { value: "vencido", label: "Vencido" },
];

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Situação: Todas" },
    { value: "active", label: "Situação: Ativos" },
    { value: "expiring", label: "Situação: A vencer" },
    { value: "expired", label: "Situação: Vencidos" },
];

const INITIAL_FORM = {
    nome_titular: "",
    cpf_titular: "",
    contato_responsavel: "",
    numero_titulo: "",
    status: "ativo",
    vigencia_inicio: "",
    vigencia_fim: "",
    sepultura: "",
    quadra: "",
    valor: "0",
    cemiterio: "",
};

const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

const filterLabelSx = {
    fontSize: "14px",
    backgroundColor: "white",
    paddingX: "4px",
    marginLeft: "-4px",
};

const filterSelectSx = {
    borderRadius: "12px",
    fontSize: "14px",
    backgroundColor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": {
        top: "0px",
        borderColor: "rgba(31, 38, 82, 0.12)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(31, 38, 82, 0.2)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#191970",
        boxShadow: "0 0 0 4px rgba(74, 47, 227, 0.08)",
    },
};

const filterTextFieldSx = {
    "& .MuiInputBase-root": { borderRadius: "12px", backgroundColor: "#fff" },
    "& .MuiOutlinedInput-root": { borderRadius: "12px" },
    "& .MuiOutlinedInput-notchedOutline": { borderRadius: "12px" },
    "& .MuiOutlinedInput-input": { fontSize: "14px" },
};

const formatDateBR = (value) => formatDateDMY(value, value || "-");

const resolveContractVigenciaInicio = (contract) => (
    contract?.vigencia_inicio || contract?.validade_titulo_inicio || contract?.data_inicio || ""
);

const resolveContractVigenciaFim = (contract) => (
    contract?.vigencia_fim || contract?.validade_titulo_fim || contract?.validade_titulo || contract?.data_fim || ""
);

const formatVigenciaLabel = (inicio, fim) => {
    const formattedInicio = formatDateBR(inicio);
    const formattedFim = formatDateBR(fim);

    if (inicio && fim) return `${formattedInicio} ate ${formattedFim}`;
    if (fim) return formattedFim;
    if (inicio) return `Inicio ${formattedInicio}`;
    return "-";
};

const STATUS_ALIASES = {
    active: "ativo",
    inactive: "inativo",
    expired: "vencido",
};

const normalizeStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    return STATUS_ALIASES[normalized] || normalized;
};

const statusLabel = (status) => {
    const normalized = normalizeStatus(status);
    const found = STATUS_OPTIONS.find((item) => item.value === normalized);
    return found ? found.label : (status || "-");
};

const formatLocal = (contract, cemeteryNameFallback) => {
    const cemeteryName = String(contract?.cemiterio || cemeteryNameFallback || "").trim();
    const quadra = String(contract?.quadra || "").trim();
    const sepultura = String(contract?.sepultura || "").trim();

    return [cemeteryName, quadra ? `Quadra ${quadra}` : "", sepultura ? `Sepultura ${sepultura}` : ""]
        .filter(Boolean)
        .join(" • ") || "-";
};

const normalizeContract = (contract) => {
    const vigenciaInicio = resolveContractVigenciaInicio(contract);
    const vigenciaFim = resolveContractVigenciaFim(contract);

    return {
        id: contract?.id ?? contract?.numero_titulo ?? "",
        nome_titular: String(contract?.nome_titular || "").trim(),
        cpf_titular: String(contract?.cpf_titular || contract?.cpf || "").trim(),
        contato_responsavel: String(contract?.contato_responsavel || contract?.telefone || contract?.tel_resp || "").trim(),
        numero_titulo: String(contract?.numero_titulo || "").trim(),
        status: normalizeStatus(contract?.status) || "ativo",
        vigencia_inicio: vigenciaInicio,
        vigencia_fim: vigenciaFim,
        sepultura: String(contract?.sepultura || "").trim(),
        quadra: String(contract?.quadra || "").trim(),
        valor: Number(contract?.valor ?? contract?.valor_anual ?? 0),
        cemiterio: String(contract?.cemiterio || contract?.cemiterio_nome || "").trim(),
    };
};

export default function ContratosComponent() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [titulos, setTitulos] = useState([]);
    const [quadras, setQuadras] = useState([]);
    const [sepulturas, setSepulturas] = useState([]);
    const [sepultamentos, setSepultamentos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingDeleteTitulo, setPendingDeleteTitulo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSepulturaPreviewOpen, setIsSepulturaPreviewOpen] = useState(false);
    const [isSepulturaPreviewPinned, setIsSepulturaPreviewPinned] = useState(false);
    const sepulturaPreviewRef = useRef(null);
    const location = useLocation();
    const { showSuccess, showError, ToastElement } = useToastFeedback();

    const cemeteries = useCemeteryStore((state) => state.cemeteries);
    const selectedCemeteryId = useCemeteryStore((state) => state.selectedCemeteryId);
    const selectedCemetery = useMemo(() => (
        cemeteries.find((cemetery) => String(cemetery?.id) === String(selectedCemeteryId))
        || cemeteries.find((cemetery) => cemetery?.active !== false)
        || cemeteries[0]
        || null
    ), [cemeteries, selectedCemeteryId]);

    const selectedCemeteryName = selectedCemetery?.name || "";

    const initialFormFactory = () => ({ ...INITIAL_FORM, cemiterio: selectedCemeteryName });

    const {
        form,
        setForm,
        errors,
        setErrors,
        editingId,
        modalOpen,
        isSubmitting,
        setIsSubmitting,
        openCreate,
        openEdit,
        closeModal,
    } = useFormModal({ initialForm: initialFormFactory });

    const loadContratos = useCallback(async () => {
        setIsLoading(true);
        try {
            const [data, blocksData, gravesData, sepultamentosData] = await Promise.all([
                getContratos(),
                getBlocks().catch(() => []),
                getGrave().catch(() => []),
                getSepultamentos().catch(() => []),
            ]);
            setTitulos(Array.isArray(data) ? data : []);
            setQuadras(Array.isArray(blocksData) ? blocksData.map(normalizeQuadra) : []);
            setSepulturas(Array.isArray(gravesData) ? gravesData : []);
            setSepultamentos(Array.isArray(sepultamentosData) ? sepultamentosData : []);
        } catch (error) {
            console.error("Erro ao carregar contratos", error);
            setTitulos([]);
            setQuadras([]);
            setSepulturas([]);
            setSepultamentos([]);
            showError("Erro ao carregar contratos");
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadContratos();
    }, [loadContratos]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const incomingSearch = params.get("search") || params.get("numero_titulo") || location.state?.contratoSearch || "";
        if (incomingSearch) {
            setQuery(incomingSearch);
            setStatusFilter("all");
        }
    }, [location.search, location.state]);

    const normalizedTitulos = useMemo(() => titulos.map(normalizeContract), [titulos]);

    const filteredTitulos = useMemo(() => {
        const q = normalizeSearchText(query);

        return normalizedTitulos.filter((item) => {
            const local = formatLocal(item, selectedCemeteryName);
            const matchesSearch = !q || [
                item.numero_titulo,
                item.nome_titular,
                item.cpf_titular,
                item.contato_responsavel,
                item.status,
                item.vigencia_inicio,
                item.vigencia_fim,
                item.sepultura,
                item.quadra,
                local,
                formatCurrencyBRL(item.valor),
            ].some((field) => normalizeSearchText(field).includes(q));

            const bucket = getValidityBucket(item.vigencia_fim);
            const matchesStatus = statusFilter === "all"
                || (statusFilter === "active" && bucket === "active")
                || (statusFilter === "expiring" && bucket === "expiring")
                || (statusFilter === "expired" && bucket === "expired");

            return matchesSearch && matchesStatus;
        });
    }, [normalizedTitulos, query, selectedCemeteryName, statusFilter]);

    const quadraOptions = useMemo(() => {
        return (quadras || [])
            .map((quadra) => {
                const normalized = normalizeQuadra(quadra);
                return {
                    ...normalized,
                    id: String(normalized?.id ?? normalized?.num_quadra ?? ""),
                    numero: String(normalized?.num_quadra ?? "").trim(),
                    nome: formatQuadraDisplay(normalized, [], "Quadra ", "sem número"),
                    max: Number(normalized?.max_covas || normalized?.maxGraves || 0),
                };
            })
            .filter((quadra) => quadra.id && quadra.numero)
            .sort((left, right) => String(left.numero).localeCompare(String(right.numero), "pt-BR", { numeric: true }));
    }, [quadras]);

    const selectedQuadra = useMemo(() => (
        quadraOptions.find((quadra) => String(quadra.numero) === String(form.quadra) || String(quadra.id) === String(form.quadra))
        || null
    ), [form.quadra, quadraOptions]);

    const quadraSelectValue = selectedQuadra?.numero || form.quadra || "";
    const selectedQuadraLabel = selectedQuadra ? formatQuadraDisplay(selectedQuadra, [], "Quadra ", "sem número") : "";
    const modalQuadraOptions = useMemo(() => {
        if (!quadraSelectValue || quadraOptions.some((quadra) => String(quadra.numero) === String(quadraSelectValue))) {
            return quadraOptions;
        }

        return [
            ...quadraOptions,
            {
                id: `current-${quadraSelectValue}`,
                numero: quadraSelectValue,
                nome: `Quadra ${quadraSelectValue}`,
            },
        ];
    }, [quadraOptions, quadraSelectValue]);

    const getSepulturaQuadraKey = (sepultura) => String(
        sepultura?.blockId ?? sepultura?.block ?? sepultura?.quadra_cova ?? sepultura?.quadra ?? sepultura?.quadra_sep ?? ""
    );

    const getSepulturaNumber = (sepultura) => String(
        sepultura?.number ?? sepultura?.num_cova ?? sepultura?.numero ?? sepultura?.num_sepultura_sep ?? sepultura?.sepultura ?? ""
    ).trim();

    const getQuadraKeysForContract = (contract) => {
        const quadra = quadraOptions.find((item) => String(item.numero) === String(contract?.quadra) || String(item.id) === String(contract?.quadra));
        return [contract?.quadra, quadra?.id, quadra?.numero]
            .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
            .map(String);
    };

    const getLinkedSepultura = (contract) => {
        const quadraKeys = getQuadraKeysForContract(contract);
        const sepulturaNumber = String(contract?.sepultura || "").trim();
        if (!quadraKeys.length || !sepulturaNumber) return null;

        return sepulturas.find((sepultura) => (
            quadraKeys.includes(getSepulturaQuadraKey(sepultura)) &&
            getSepulturaNumber(sepultura) === sepulturaNumber
        )) || null;
    };

    const getSepultamentoQuadraKey = (sepultamento) => String(
        sepultamento?.quadra_sep ?? sepultamento?.quadra ?? sepultamento?.blockId ?? sepultamento?.block ?? ""
    );

    const getSepultamentoNumber = (sepultamento) => String(
        sepultamento?.num_sepultura_sep ?? sepultamento?.sepultura ?? sepultamento?.number ?? sepultamento?.num_cova ?? ""
    ).trim();

    const getLinkedSepultadosCount = (contract) => {
        const quadraKeys = getQuadraKeysForContract(contract);
        const sepulturaNumber = String(contract?.sepultura || "").trim();
        if (!quadraKeys.length || !sepulturaNumber) return 0;

        const ids = new Set();
        (sepultamentos || []).forEach((sepultamento) => {
            if (sepultamento?.foi_exumado) return;
            if (!quadraKeys.includes(getSepultamentoQuadraKey(sepultamento))) return;
            if (getSepultamentoNumber(sepultamento) !== sepulturaNumber) return;

            const id = sepultamento?.id ?? sepultamento?._id ?? `${getSepultamentoQuadraKey(sepultamento)}-${sepulturaNumber}-${sepultamento?.dh_sep ?? ""}`;
            ids.add(String(id));
        });

        return ids.size;
    };

    const getPostContractGraveStatus = (contract, sepultura) => {
        const sepultadosCount = getLinkedSepultadosCount(contract);
        const capacity = Number(sepultura?.bodyCapacity ?? sepultura?.capacidade ?? 0);
        const currentStatus = String(sepultura?.status || "").toUpperCase();

        if (sepultadosCount > 0 || currentStatus === "OCCUPIED" || capacity <= 0) {
            return "OCCUPIED";
        }

        return "AVAILABLE";
    };

    const getPostContractStatusLabel = (status) => status === "OCCUPIED" ? "ocupada" : "disponível";

    const isSepulturaNumberTaken = (quadraValue, sepulturaValue, ignoreContractId = editingId) => {
        const quadra = quadraOptions.find((item) => String(item.numero) === String(quadraValue) || String(item.id) === String(quadraValue));
        const quadraKeys = [quadraValue, quadra?.id, quadra?.numero].filter((item) => item !== undefined && item !== null).map(String);
        const sepulturaNumber = String(sepulturaValue || "").trim();
        if (!quadraKeys.length || !sepulturaNumber) return false;

        const existsInGraves = sepulturas.some((sepultura) => (
            quadraKeys.includes(getSepulturaQuadraKey(sepultura)) && getSepulturaNumber(sepultura) === sepulturaNumber
        ));
        const existsInContracts = normalizedTitulos.some((contract) => (
            String(contract.id) !== String(ignoreContractId || "") &&
            String(contract.quadra) === String(quadra?.numero ?? quadraValue) &&
            String(contract.sepultura) === sepulturaNumber
        ));

        return existsInGraves || existsInContracts;
    };

    const selectedQuadraKeys = useMemo(() => {
        if (!selectedQuadra && !form.quadra) return [];
        return [form.quadra, selectedQuadra?.id, selectedQuadra?.numero]
            .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
            .map(String);
    }, [form.quadra, selectedQuadra]);

    const occupiedSepulturaNumbers = useMemo(() => {
        if (!selectedQuadraKeys.length) return new Set();

        const occupied = new Set();
        sepulturas.forEach((sepultura) => {
            if (!selectedQuadraKeys.includes(getSepulturaQuadraKey(sepultura))) return;
            const number = getSepulturaNumber(sepultura);
            if (number) occupied.add(String(number));
        });

        normalizedTitulos.forEach((contract) => {
            if (String(contract.id) === String(editingId || "")) return;
            const contractQuadra = quadraOptions.find((quadra) => (
                String(quadra.numero) === String(contract.quadra) ||
                String(quadra.id) === String(contract.quadra)
            ));
            const contractQuadraKeys = [contract.quadra, contractQuadra?.id, contractQuadra?.numero]
                .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
                .map(String);

            if (!contractQuadraKeys.some((key) => selectedQuadraKeys.includes(key))) return;
            if (contract.sepultura) occupied.add(String(contract.sepultura));
        });

        return occupied;
    }, [editingId, normalizedTitulos, quadraOptions, selectedQuadraKeys, sepulturas]);

    const previewSepulturaNumbers = useMemo(() => (
        Array.from(occupiedSepulturaNumbers)
            .sort((left, right) => String(left).localeCompare(String(right), "pt-BR", { numeric: true }))
    ), [occupiedSepulturaNumbers]);

    const sepulturaPreviewMessage = !selectedQuadra
        ? "Selecione uma quadra para visualizar os números já cadastrados."
        : previewSepulturaNumbers.length
            ? `${previewSepulturaNumbers.length} número(s) já cadastrado(s) na ${selectedQuadraLabel}.`
            : "Nenhum número cadastrado para a quadra selecionada.";

    const openSepulturaPreview = () => {
        setIsSepulturaPreviewOpen(true);
    };

    const closeSepulturaPreview = () => {
        if (isSepulturaPreviewPinned) return;
        setIsSepulturaPreviewOpen(false);
    };

    const toggleSepulturaPreviewPinned = () => {
        setIsSepulturaPreviewOpen((current) => !current || !isSepulturaPreviewPinned);
        setIsSepulturaPreviewPinned((current) => !current);
    };

    useEffect(() => {
        if (!isSepulturaPreviewOpen) return undefined;

        const handleClickOutside = (event) => {
            if (sepulturaPreviewRef.current?.contains(event.target)) return;
            setIsSepulturaPreviewOpen(false);
            setIsSepulturaPreviewPinned(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSepulturaPreviewOpen]);

    const stats = useMemo(() => {
        const total = normalizedTitulos.length;
        const active = normalizedTitulos.filter((item) => getValidityBucket(item.vigencia_fim) === "active").length;
        const expiring = normalizedTitulos.filter((item) => getValidityBucket(item.vigencia_fim) === "expiring").length;
        const expired = normalizedTitulos.filter((item) => getValidityBucket(item.vigencia_fim) === "expired").length;
        const revenueAnnual = normalizedTitulos.reduce((sum, item) => {
            const bucket = getValidityBucket(item.vigencia_fim);
            if (bucket === "expired") return sum;
            return sum + (Number(item.valor) || 0);
        }, 0);

        return { total, active, expiring, expired, revenueAnnual };
    }, [normalizedTitulos]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const clearFilters = () => {
        setQuery("");
        setStatusFilter("all");
    };

    const openModal = () => {
        setIsEditing(true);
        openCreate();
    };

    const validateForm = () => {
        const nextErrors = {};
        const numero = form.numero_titulo.trim();
        const nome = form.nome_titular.trim();
        const valor = parseCurrencyInput(form.valor);
        const sepulturaNumber = Number(form.sepultura);

        if (!nome) nextErrors.nome_titular = "Informe o nome do titular";
        if (!form.cpf_titular.trim()) nextErrors.cpf_titular = "Informe o CPF do titular";
        if (!form.contato_responsavel.trim()) nextErrors.contato_responsavel = "Informe o contato do responsavel";
        if (!numero) nextErrors.numero_titulo = "Informe o número do título";
        if (!form.status.trim()) nextErrors.status = "Informe o status do título";
        if (!form.vigencia_inicio.trim()) nextErrors.vigencia_inicio = "Informe o início da vigência";
        if (!form.vigencia_fim.trim()) nextErrors.vigencia_fim = "Informe o fim da vigência";
        if (!form.sepultura.trim()) nextErrors.sepultura = "Informe o número da sepultura";
        if (!form.quadra.trim()) nextErrors.quadra = "Informe o número da quadra";
        if (!Number.isFinite(valor) || valor < 0) nextErrors.valor = "Informe um valor válido";

        if (form.sepultura.trim() && (!Number.isInteger(sepulturaNumber) || sepulturaNumber <= 0)) {
            nextErrors.sepultura = "Informe um numero de sepultura valido";
        }
        if (form.quadra && !selectedQuadra) {
            nextErrors.quadra = "Selecione uma quadra existente";
        }

        const parsedVigenciaInicio = form.vigencia_inicio ? parseDateValue(form.vigencia_inicio) : null;
        const parsedVigenciaFim = form.vigencia_fim ? parseDateValue(form.vigencia_fim) : null;

        if (form.vigencia_inicio && !parsedVigenciaInicio) {
            nextErrors.vigencia_inicio = "Data de início em formato inválido";
        }

        if (form.vigencia_fim && !parsedVigenciaFim) {
            nextErrors.vigencia_fim = "Data final em formato inválido";
        }

        if (parsedVigenciaInicio && parsedVigenciaFim && parsedVigenciaFim < parsedVigenciaInicio) {
            nextErrors.vigencia_fim = "Fim da vigência deve ser posterior ao início";
        }

        const duplicated = titulos.some(
            (item) => item.id !== editingId && String(item.numero_titulo || "").trim().toLowerCase() === numero.toLowerCase()
        );
        if (duplicated) nextErrors.numero_titulo = "Já existe um título com esse número";

        if (!editingId && selectedQuadra && form.sepultura.trim() && isSepulturaNumberTaken(selectedQuadra.numero, form.sepultura)) {
            nextErrors.sepultura = "Ja existe uma sepultura com esse numero nesta quadra";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSaveTitulo = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const now = formatDateTimeKey(new Date());
            const payload = {
                nome_titular: form.nome_titular.trim(),
                cpf_titular: form.cpf_titular.trim(),
                contato_responsavel: form.contato_responsavel.trim(),
                numero_titulo: form.numero_titulo.trim(),
                status: form.status,
                vigencia_inicio: form.vigencia_inicio,
                vigencia_fim: form.vigencia_fim,
                sepultura: form.sepultura.trim(),
                quadra: selectedQuadra?.numero || form.quadra.trim(),
                blockId: selectedQuadra?.id || "",
                cemiterio: String(form.cemiterio || selectedCemeteryName || "").trim(),
                valor: parseCurrencyInput(form.valor),
                update_at: now,
            };

            if (editingId) {
                await updateContrato(editingId, {
                    ...payload,
                    id: editingId,
                });

                const linkedSepultura = getLinkedSepultura(payload);
                if (linkedSepultura?.id) {
                    await updateGrave(linkedSepultura.id, {
                        ...linkedSepultura,
                        areaType: "PERPETUAL",
                        area_type: "PERPETUAL",
                        contractTitle: payload.numero_titulo,
                        holderName: payload.nome_titular,
                        holderCpf: payload.cpf_titular,
                        holderContact: payload.contato_responsavel,
                    });
                }

                showSuccess("Título atualizado com sucesso.");
            } else {
                await createContrato({
                    ...payload,
                    created_at: now,
                });
                await createGrave({
                    number: Number(form.sepultura),
                    graveType: "EARTH",
                    bodyCapacity: 1,
                    areaType: "PERPETUAL",
                    blockId: String(selectedQuadra?.id || form.quadra),
                    status: "AVAILABLE",
                    blocked: false,
                    contractTitle: form.numero_titulo.trim(),
                    holderName: form.nome_titular.trim(),
                    holderCpf: form.cpf_titular.trim(),
                    holderContact: form.contato_responsavel.trim(),
                });
                showSuccess("Título cadastrado com sucesso.");
            }

            await loadContratos();
            if (editingId) {
                setIsEditing(false);
            } else {
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao salvar contrato/titulo", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível salvar o título");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTitulo = (item) => {
        const normalized = normalizeContract(item);
        setIsEditing(false);
        openEdit(normalized.id, {
            nome_titular: normalized.nome_titular,
            cpf_titular: normalized.cpf_titular,
            contato_responsavel: normalized.contato_responsavel,
            numero_titulo: normalized.numero_titulo,
            status: normalized.status || "ativo",
            vigencia_inicio: normalized.vigencia_inicio,
            vigencia_fim: normalized.vigencia_fim,
            sepultura: normalized.sepultura,
            quadra: quadraOptions.find((quadra) => String(quadra.numero) === String(normalized.quadra) || String(quadra.id) === String(normalized.quadra))?.numero || normalized.quadra,
            valor: currencyInputMask(normalized.valor ?? 0),
            cemiterio: normalized.cemiterio || selectedCemeteryName,
        });
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        closeModal();
    };

    const isViewingExisting = Boolean(editingId) && !isEditing;

    const contratoViewFields = [
        ["Nome do titular", form.nome_titular],
        ["CPF do titular", form.cpf_titular],
        ["Contato do responsável", form.contato_responsavel],
        ["Número do título", form.numero_titulo],
        ["Valor mensal", formatCurrencyBRL(parseCurrencyInput(form.valor))],
        ["Status", statusLabel(form.status)],
        ["Cemitério", form.cemiterio || selectedCemeteryName],
        ["Quadra", selectedQuadraLabel || (form.quadra ? "Quadra não identificada" : "")],
        ["Sepultura", form.sepultura ? `Sepultura ${form.sepultura}` : ""],
        ["Vigência início", formatDateBR(form.vigencia_inicio)],
        ["Vigência fim", formatDateBR(form.vigencia_fim)],
    ];

    const prepareDeleteTitulo = async (id) => {
        const target = titulos.find((item) => String(item.id) === String(id)) || null;
        const normalized = target ? normalizeContract(target) : { id };
        const linkedSepultura = getLinkedSepultura(normalized);
        const nextGraveStatus = getPostContractGraveStatus(normalized, linkedSepultura);
        const sepultadosCount = getLinkedSepultadosCount(normalized);

        setPendingDeleteTitulo({
            ...normalized,
            linkedSepulturaId: linkedSepultura?.id ?? "",
            linkedSepultura,
            nextGraveStatus,
            nextStatusLabel: getPostContractStatusLabel(nextGraveStatus),
            sepultadosCount,
        });
    };

    const closeDeleteDialog = () => {
        setPendingDeleteTitulo(null);
    };

    const confirmDeleteTitulo = async () => {
        if (!pendingDeleteTitulo?.id) return;

        setIsSubmitting(true);
        try {
            const linkedSepultura = pendingDeleteTitulo.linkedSepulturaId
                ? sepulturas.find((sepultura) => String(sepultura?.id) === String(pendingDeleteTitulo.linkedSepulturaId)) || pendingDeleteTitulo.linkedSepultura
                : getLinkedSepultura(pendingDeleteTitulo);

            if (linkedSepultura?.id) {
                const nextGraveStatus = getPostContractGraveStatus(pendingDeleteTitulo, linkedSepultura);
                await updateGrave(linkedSepultura.id, {
                    ...linkedSepultura,
                    areaType: "COMMON",
                    area_type: "COMMON",
                    status: nextGraveStatus,
                    contractTitle: "",
                    holderName: "",
                    holderCpf: "",
                    holderContact: "",
                });
            }

            await deleteContrato(pendingDeleteTitulo.id);
            showSuccess(linkedSepultura?.id
                ? `Título excluído. Sepultura vinculada atualizada para ${getPostContractStatusLabel(getPostContractGraveStatus(pendingDeleteTitulo, linkedSepultura))}.`
                : "Título excluído com sucesso"
            );
            await loadContratos();
            closeDeleteDialog();
        } catch (error) {
            console.error("Erro ao excluir título", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível excluir o título");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteDialogDescription = pendingDeleteTitulo
        ? pendingDeleteTitulo.linkedSepulturaId
            ? `Deseja realmente excluir o título ${pendingDeleteTitulo.numero_titulo || pendingDeleteTitulo.id}? A sepultura ${pendingDeleteTitulo.sepultura || "-"} da quadra ${pendingDeleteTitulo.quadra || "-"} deixará de ser particular e passará para o rótulo ${pendingDeleteTitulo.nextStatusLabel}, considerando ${pendingDeleteTitulo.sepultadosCount} falecido(s) sepultado(s) e sua capacidade atual.`
            : `Deseja realmente excluir o título ${pendingDeleteTitulo.numero_titulo || pendingDeleteTitulo.id}? Não foi possível localizar uma sepultura vinculada para atualização automática.`
        : "Confirme a exclusão do título.";

    return (
        <>
            {ToastElement}
            <ConfirmationDialog
                open={Boolean(pendingDeleteTitulo)}
                onClose={closeDeleteDialog}
                onConfirm={confirmDeleteTitulo}
                title="Excluir título"
                alertSeverity="error"
                alertMessage="Esta ação removerá o contrato e atualizará a sepultura vinculada."
                description={deleteDialogDescription}
                confirmLabel="Excluir"
                confirmTone="delete"
                confirmDisabled={!pendingDeleteTitulo}
                isSubmitting={isSubmitting}
                ariaDescriptionId="contrato-delete-dialog-description"
            />
            <Container>
                <PageHeader>
                    <HeaderCopy>
                        <Title>Contratos / Títulos de Posse</Title>
                        <Subtitle>Gerencie os contratos vigentes, acompanhe a validade e a receita anual dos títulos ativos.</Subtitle>
                    </HeaderCopy>

                    <HeaderActions>
                        <SystemButton type="button" onClick={openModal} disabled={isSubmitting}>
                            <FaPlus /> Novo Contrato
                        </SystemButton>
                    </HeaderActions>
                </PageHeader>

                <FiltersPanel>
                    <FormStyled as="div">
                        <FilterGrid>
                            <SearchWrapper>
                                <TextField
                                    fullWidth
                                    size="medium"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Buscar por titular, número, local, valor ou vigência..."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FaSearch />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={filterTextFieldSx}
                                />
                            </SearchWrapper>

                            <FormControl fullWidth size="medium">
                                <InputLabel sx={filterLabelSx}>Situação</InputLabel>
                                <Select value={statusFilter} label="Situação" onChange={(event) => setStatusFilter(event.target.value)} sx={filterSelectSx}>
                                    {STATUS_FILTER_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label.replace(/^Situação:\s*/, "")}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                                <FaFilter /> Limpar filtros
                            </SystemButton>
                        </FilterGrid>
                    </FormStyled>
                </FiltersPanel>

                <StatsGrid>
                    <StatCard>
                        <StatIcon $tone="success"><FaFileContract /></StatIcon>
                        <StatCopy>
                            <StatLabel>Total de contratos</StatLabel>
                            <StatValue>{stats.total}</StatValue>
                            <StatHint>Cadastrados</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaCheckCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Contratos ativos</StatLabel>
                            <StatValue>{stats.active}</StatValue>
                            <StatHint>Vigência acima de 30 dias</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaClock /></StatIcon>
                        <StatCopy>
                            <StatLabel>Contratos a vencer</StatLabel>
                            <StatValue>{stats.expiring}</StatValue>
                            <StatHint>Próximos 30 dias</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaTimesCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Contratos vencidos</StatLabel>
                            <StatValue>{stats.expired}</StatValue>
                            <StatHint>Vigência expirada</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaDollarSign /></StatIcon>
                        <StatCopy>
                            <StatLabel>Receita anual</StatLabel>
                            <StatValue>{formatCurrencyBRL(stats.revenueAnnual)}</StatValue>
                            <StatHint>Prevista com contratos vigentes</StatHint>
                        </StatCopy>
                    </StatCard>
                </StatsGrid>

                <Card>
                    <CardBody>
                        <CardTitle>Contratos cadastrados</CardTitle>
                        <TableWrapper>
                            <TableScroller>
                                <Table $minWidth="1280px">
                                    <THead>
                                        <Tr>
                                            <Th>Nº do Título</Th>
                                            <Th>Titular</Th>
                                            <Th>CPF</Th>
                                            <Th>Contato</Th>
                                            <Th>Local</Th>
                                            <Th>Vigência</Th>
                                            <Th>Valor mensal</Th>
                                            <Th>Status</Th>
                                            <Th>Ações</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {isLoading ? (
                                            <Tr>
                                                <Td colSpan={9}>Carregando contratos...</Td>
                                            </Tr>
                                        ) : filteredTitulos.length > 0 ? (
                                            filteredTitulos.map((item, index) => {
                                                const normalized = normalizeContract(item);
                                                return (
                                                    <Tr key={String(normalized.id || normalized.numero_titulo)} index={index}>
                                                        <Td>{normalized.numero_titulo}</Td>
                                                        <Td>{normalized.nome_titular}</Td>
                                                        <Td>{normalized.cpf_titular || "-"}</Td>
                                                        <Td>{normalized.contato_responsavel || "-"}</Td>
                                                        <TdLocal>{formatLocal(normalized, selectedCemeteryName)}</TdLocal>
                                                        <Td>{formatVigenciaLabel(normalized.vigencia_inicio, normalized.vigencia_fim)}</Td>
                                                        <TdValue>{formatCurrencyBRL(normalized.valor)}</TdValue>
                                                        <TdStatus>
                                                            <StatusBadge $status={normalized.status}>
                                                                {statusLabel(normalized.status)}
                                                            </StatusBadge>
                                                        </TdStatus>
                                                        <Td>
                                                            <Actions>
                                                                <IconBtn type="button" onClick={() => handleEditTitulo(normalized)} disabled={isSubmitting}>
                                                                    <FaRegEdit />
                                                                </IconBtn>
                                                                <IconBtn type="button" onClick={() => prepareDeleteTitulo(normalized.id)} disabled={isSubmitting}>
                                                                    <FaTrash />
                                                                </IconBtn>
                                                            </Actions>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })
                                        ) : (
                                            <Tr>
                                                <Td colSpan={9}>Nenhum contrato encontrado.</Td>
                                            </Tr>
                                        )}
                                    </TBody>
                                </Table>
                            </TableScroller>
                        </TableWrapper>
                    </CardBody>
                </Card>

                <DefaultModal
                    open={modalOpen}
                    title={editingId ? (isEditing ? "Editar título de posse" : "Detalhes do título de posse") : "Novo título de posse"}
                    subtitle={"Visualização completa dos contratos/títulos de posse."}
                    fields={isViewingExisting ? contratoViewFields : []}
                    onClose={handleCloseModal}
                >
                    <form onSubmit={handleSaveTitulo}>
                        {!isViewingExisting ? (
                            <DefaultModalGrid>
                                <div>
                                    <label>Nome do titular</label>
                                    <Input
                                        value={form.nome_titular}
                                        onChange={(event) => updateField("nome_titular", event.target.value)}
                                        placeholder="Nome completo do titular"
                                        disabled={isSubmitting}
                                    />
                                    {errors.nome_titular ? <p style={errorStyle}>{errors.nome_titular}</p> : null}
                                </div>

                                <div>
                                    <label>CPF do titular</label>
                                    <Input
                                        value={form.cpf_titular}
                                        onChange={(event) => updateField("cpf_titular", applyMaskByFieldName("cpf_titular", event.target.value))}
                                        placeholder="000.000.000-00"
                                        disabled={isSubmitting}
                                    />
                                    {errors.cpf_titular ? <p style={errorStyle}>{errors.cpf_titular}</p> : null}
                                </div>

                                <div>
                                    <label>Contato do responsável</label>
                                    <Input
                                        value={form.contato_responsavel}
                                        onChange={(event) => updateField("contato_responsavel", applyMaskByFieldName("contato_responsavel", event.target.value))}
                                        placeholder="(00) 00000-0000"
                                        disabled={isSubmitting}
                                    />
                                    {errors.contato_responsavel ? <p style={errorStyle}>{errors.contato_responsavel}</p> : null}
                                </div>

                                <div>
                                    <label>Número do título</label>
                                    <Input
                                        value={form.numero_titulo}
                                        onChange={(event) => updateField("numero_titulo", event.target.value)}
                                        placeholder="Ex: 000145"
                                        disabled={isSubmitting}
                                    />
                                    {errors.numero_titulo ? <p style={errorStyle}>{errors.numero_titulo}</p> : null}
                                </div>

                                <div>
                                    <label>Valor mensal</label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={form.valor}
                                        onChange={(event) => updateField("valor", applyMaskByFieldName("valor", event.target.value))}
                                        placeholder="R$ 0,00"
                                        disabled={isSubmitting}
                                    />
                                    {errors.valor ? <p style={errorStyle}>{errors.valor}</p> : null}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <SystemSelect
                                        value={form.status}
                                        onChange={(event) => updateField("status", event.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </SystemSelect>
                                    {errors.status ? <p style={errorStyle}>{errors.status}</p> : null}
                                </div>


                                <div>
                                    <label>Quadra</label>
                                    <SystemSelect
                                        value={quadraSelectValue}
                                        onChange={(event) => updateField("quadra", event.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Selecione a quadra</option>
                                        {modalQuadraOptions.map((quadra) => (
                                            <option key={quadra.id} value={quadra.numero}>
                                                {quadra.nome || formatQuadraDisplay(quadra, [], "Quadra ", "sem número")}
                                            </option>
                                        ))}
                                    </SystemSelect>
                                    {errors.quadra ? <p style={errorStyle}>{errors.quadra}</p> : null}
                                </div>

                                <SepulturaFieldRoot
                                    ref={sepulturaPreviewRef}
                                    onMouseEnter={openSepulturaPreview}
                                    onMouseLeave={closeSepulturaPreview}
                                >
                                    <label>Sepultura</label>
                                    <SepulturaInputRow>
                                        <Input
                                            value={form.sepultura}
                                            onChange={(event) => updateField("sepultura", event.target.value)}
                                            placeholder="Exemplo: 05"
                                            disabled={isSubmitting || Boolean(editingId)}
                                        />
                                        <SepulturaPreviewButton
                                            type="button"
                                            aria-label="Visualizar sepulturas cadastradas"
                                            title={sepulturaPreviewMessage}
                                            $active={isSepulturaPreviewOpen}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                toggleSepulturaPreviewPinned();
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            <FaEye />
                                        </SepulturaPreviewButton>
                                    </SepulturaInputRow>
                                    {isSepulturaPreviewOpen ? (
                                        <SepulturaPreviewPanel>
                                            <SepulturaPreviewHeader>
                                                {selectedQuadraLabel || "Quadra não selecionada"}
                                            </SepulturaPreviewHeader>
                                            <SepulturaPreviewHint>{sepulturaPreviewMessage}</SepulturaPreviewHint>
                                            {selectedQuadra && previewSepulturaNumbers.length ? (
                                                <SepulturaPreviewGrid>
                                                    {previewSepulturaNumbers.map((numero) => (
                                                        <SepulturaPreviewOption
                                                            key={numero}
                                                            type="button"
                                                            disabled
                                                            $selected={String(form.sepultura) === String(numero)}
                                                        >
                                                            {numero}
                                                        </SepulturaPreviewOption>
                                                    ))}
                                                </SepulturaPreviewGrid>
                                            ) : null}
                                        </SepulturaPreviewPanel>
                                    ) : null}
                                    {errors.sepultura ? <p style={errorStyle}>{errors.sepultura}</p> : null}
                                </SepulturaFieldRoot>

                                <div>
                                    <label>Vigência início</label>
                                    <Input
                                        type="date"
                                        value={form.vigencia_inicio}
                                        onChange={(event) => updateField("vigencia_inicio", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.vigencia_inicio ? <p style={errorStyle}>{errors.vigencia_inicio}</p> : null}
                                </div>

                                <div>
                                    <label>Vigência fim</label>
                                    <Input
                                        type="date"
                                        value={form.vigencia_fim}
                                        onChange={(event) => updateField("vigencia_fim", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.vigencia_fim ? <p style={errorStyle}>{errors.vigencia_fim}</p> : null}
                                </div>
                            </DefaultModalGrid>
                        ) : null}

                        <DefaultModalActions>
                            {isViewingExisting ? (
                                <SystemButton
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Editar
                                </SystemButton>
                            ) : (
                                <SystemButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Salvando..." : "Salvar"}
                                </SystemButton>
                            )}
                            <SystemButton type="button" tone="cancel" onClick={handleCloseModal} disabled={isSubmitting}>
                                {editingId ? "Fechar" : "Cancelar"}
                            </SystemButton>
                        </DefaultModalActions>
                    </form>
                </DefaultModal>
            </Container>
        </>
    );
}

