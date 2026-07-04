import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useBlocks, useCreateBlocks, useCreateGraves, useToastFeedback } from "../../hooks";
import { useCemeteryStore } from "../../stores/index.js";
import api from "../../services/index.js";
import { patchGraveStatus } from "../../services/graveService";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import GridQuadras from "../../components/domain/GridQuadras";
import PieChartSepulturas from "../../components/domain/PieChartSepulturas";
import CovaPetsSection from "../../components/domain/CovaPetsSection";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import SystemButton from "../../components/common/SystemButton";
import SystemSelect from "../../components/common/SystemSelect";
import DrawerComponent from "../../components/common/DrawerComponent";
import EventTimeline from "../../components/common/EventTimeline";
import DefaultModal from "../../components/common/DefaultModal";
import CustomSelect from "../../components/common/CustomSelect";
import { GiCoffin } from "react-icons/gi";
import { FaChartPie, FaEye, FaFileContract } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { MdPets } from "react-icons/md";
import { LuChevronDown } from "react-icons/lu";
import { PiFlowerTulipLight, PiFlowerTulipBold } from "react-icons/pi";
import { SquarePlus } from 'lucide-react';
import { formatDateTimeDMY, formatDateTimeKey, formatQuadraDisplay, parseDateValue } from "../../utils";
import {
    QuadraDropdownWrapper,
    Container,
    CovaGrid,
    CovaItem,
    CovaNumber,
    QuadraTitle,
    QuadraWrapper,
    QuadraHeader,
    QuadraActions,
    QuadraInfo,
    CovaGridToolbar,
    InfoPill,
    Title,
    LegendItem,
    LegendButton,
    LegendRow,
    LegendWrapper,
    ActiveFilterPill,
    EmptyMapState,
    Input,
    Label,
    Textarea,
    Field,
    FormStyled,
    Subtitle,
    SepDivider,
    SepHeader,
    SepItemButton,
    SepItemContent,
    SepDetailPanel,
    SepItemName,
    SepList,
    SepItemRow,
    SepToggle,
    MapToolbar,
    ToolbarLabel,
    DropdownIcon,
    SortDropdown,
    SortDropdownWrapper,
    SortOptionButton,
    ModalActions,
    ModalGrid,
    ModalGridFull,
    FieldErrorText,
    ToggleStatusLabel,
    ChartModalBody,
    ChartArea,
    ChartLegend,
    ToggleStatusRow,
    ToggleStatusText,
    QuadraSelectButton,
    QuadraDropdown,
    CompactField,
    SectionCard,
    SectionHeader,
    SectionTitle,
    SectionHint,
    InfoGrid,
    InfoTile,
    InfoLabel,
    InfoValue,
    StructureTripleGrid,
    StructureGridSpanTwo,
    StructureGridFull,
    StructureSectionToggle,
    StructureChevron,
    SepulturaPreviewButton,
} from "./styles";

import * as mapHelpers from "../../utils/mapHelpers";

const EXUMACAO_REQUIRED_FIELDS = {
    motivo: "Motivo",
    destino: "Destino",
    coveiro: "Coveiro",
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

const getExumacaoValidationErrors = (form) => {
    const errors = {};

    if (!form?.sepultamentoId) {
        errors.sepultamentoId = "Sepultamento inválido para iniciar a exumação.";
    }

    Object.entries(EXUMACAO_REQUIRED_FIELDS).forEach(([field, label]) => {
        if (isBlank(form?.[field])) {
            errors[field] = `${label} é obrigatório.`;
        }
    });

    return errors;
};

const getExumacaoSubmitErrorMessage = (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const backendMessage = data?.message || data?.error || data?.detail;

    if (backendMessage) return backendMessage;
    if (status === 400) return "Revise os dados informados para cadastrar a exumação.";
    if (status === 401 || status === 403) return "Você não tem permissão para cadastrar exumação.";
    if (status === 404) return "Sepultamento ou destino não encontrado.";
    if (status === 409) return "Já existe uma exumação pendente para este registro.";
    if (status >= 500) return "Servidor indisponível ao cadastrar exumação. Tente novamente em instantes.";
    if (err?.message) return err.message;
    return "Erro ao cadastrar exumação.";
};

export default function VerMapa() {
    const { selectedCemeteryId, loadCemeteries } = useCemeteryStore();

    const FIXED_CEMETERY_ID = 1;

    const {
        blocks,
        loadBlocks
    } = useBlocks();

    const {
        showSuccess,
        showError,
        ToastElement,
    } = useToastFeedback();

    const { handleCreateBlock, loading: creatingBlock } = useCreateBlocks({
        onSuccess: async (created) => {
            await loadBlocks();
            setSelectedQuadraId(created.id);
            setStructureDrawerOpen(false);
            showSuccess("Quadra criada")
        }
    });

    const { handleCreateGrave } = useCreateGraves();

    const [formQuadra, setFormQuadra] = useState({
        num_quadra: "",
        descricao: "",
    });

    const [covasData, setCovasData] = useState([]);
    const [ossariosAll, setOssariosAll] = useState([]);
    const [petsAll, setPetsAll] = useState([]);
    const [contratosAll, setContratosAll] = useState([]);
    const [exumacoesAll, setExumacoesAll] = useState([]);
    const [falecidosAll, setFalecidosAll] = useState([]);
    const [isMapLoading, setIsMapLoading] = useState(true);
    const [sepultamentosAll, setSepultamentosAll] = useState([]);
    const [selectedQuadraId, setSelectedQuadraId] = useState(null);

    const visibleBlocks = useMemo(
        () => mapHelpers.getVisibleBlocks(blocks, selectedCemeteryId),
        [blocks, selectedCemeteryId]
    );

    const quadras = useMemo(
        () => mapHelpers.buildQuadrasFromData(visibleBlocks, covasData, sepultamentosAll),
        [visibleBlocks, covasData, sepultamentosAll]
    );

    const [isQuadraDropdownOpen, setIsQuadraDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [covaSortMode, setCovaSortMode] = useState(mapHelpers.COVA_SORT_MODES.cadastro);
    const [isPieChartOpen, setIsPieChartOpen] = useState(false);
    const [sepCountsByQuadra, setSepCountsByQuadra] = useState({});
    const [modalSepList, setModalSepList] = useState([]);
    const [modalExpandedIndex, setModalExpandedIndex] = useState(null);
    const [exumacoesPending, setExumacoesPending] = useState({});
    const [pendingCancelExumacao, setPendingCancelExumacao] = useState(null);
    const [exumacoesModalIsOpen, setExumacoesModalIsOpen] = useState(false);
    const [exumacoesErrors, setExumacoesErrors] = useState({});
    const [isSubmittingExumacao, setIsSubmittingExumacao] = useState(false);
    const [exumacoesForm, setExumacoesForm] = useState({
        sepultamentoId: null,
        nome_sep: "",
        quadra_sep: "",
        num_sepultura_sep: "",
        dh_exu: "",
        motivo: "",
        destino: "",
        coveiro: "",
        obs_exu: "",
        status: "pendente",
        confirmacao: false,
        origem: "frontend",
    });

    const quadrasDesc = quadras;

    const [selectedCova, setSelectedCova] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);
    const [structureDrawerOpen, setStructureDrawerOpen] = useState(false);
    const [structureSectionsOpen, setStructureSectionsOpen] = useState({
        quadra: true,
        sepultura: false,
    });
    const [statusFilter, setStatusFilter] = useState(null);

    const [formCova, setFormCova] = useState({
        quadra_cova: "",
        num_cova: "",
        tipo_cova: "cova",
        status: "",
        blocked: false,
        capacidade: "",
        concessao: {
            ativa: false,
            responsavel: "",
            prazo_anos: 0,
            data_inicio: "",
            data_fim: ""
        },
        obs: "",
    });

    useEffect(() => {
        if (!visibleBlocks.length) {
            setSelectedQuadraId((current) => (current === null ? current : null));
            return;
        }

        const firstVisibleId = visibleBlocks[0]?.id ?? null;
        setSelectedQuadraId((current) => {
            const selectedExists = visibleBlocks.some((block) => String(block.id) === String(current));
            if (selectedExists) return current;
            return firstVisibleId;
        });
    }, [visibleBlocks]);

    // Load cemeteries on component mount
    useEffect(() => {
        loadCemeteries().catch(err => {
            console.error("Erro ao carregar cemitérios:", err);
        });
    }, [loadCemeteries]);

    const location = useLocation();
    const navigate = useNavigate();


    const handleAddQuadra = () => {
        setFormQuadra({
            num_quadra: "",
            descricao: "",
        });
        setStructureSectionsOpen({ quadra: true, sepultura: false });
        setStructureDrawerOpen(true)
    };

    const openExumacaoForm = (sep) => {
        if (!sep) return;
        const key = String(sep.id);
        if (exumacoesPending[key]) {
            showError("Já existe uma exumação para esse registro");
            return;
        }

        const sepQuadraKey = mapHelpers.resolveCovaQuadraKey(selectedCova, sep, selectedGraveForModal, selectedQuadraId);
        const sepNumeroKey = mapHelpers.resolveCovaNumber(selectedCova, sep, selectedGraveForModal);

        const quadraObj = (quadras || []).find(q =>
            String(q.id) === String(sepQuadraKey) ||
            String(q.num_quadra) === String(sepQuadraKey) ||
            String(q.nome || "").endsWith(String(sepQuadraKey))
        );

        const quadraNum = quadraObj?.num_quadra ?? sepQuadraKey;

        setExumacoesForm({
            sepultamentoId: sep.id,
            nome_sep: sep.nome_sep,
            quadra_sep: String(quadraNum ?? ""),
            num_sepultura_sep: sepNumeroKey,
            dh_exu: formatDateTimeKey(new Date()),
            motivo: "",
            destino: "",
            coveiro: "",
            obs_exu: "",
            status: "pendente",
            confirmacao: false,
            origem: "frontend"
        })
        setExumacoesErrors({});
        setExumacoesModalIsOpen(true);
    }


    const handleExumacaoField = (name, value) => {
        setExumacoesForm(prev => ({ ...prev, [name]: value }));
        setExumacoesErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }

    const closeExumacaoForm = () => {
        setExumacoesModalIsOpen(false);
        setExumacoesErrors({});
    }

    const submitExumacao = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!exumacoesForm || !exumacoesForm.sepultamentoId) return showError("Dados inválidos");

        const key = String(exumacoesForm.sepultamentoId)
        if (exumacoesPending[key]) return showError("Já existe uma exumação pendente para este registro.");

        const validationErrors = getExumacaoValidationErrors(exumacoesForm);
        if (Object.keys(validationErrors).length > 0) {
            setExumacoesErrors(validationErrors);
            showError("Preencha os campos obrigatórios da exumação.");
            return;
        }

        try {
            setIsSubmittingExumacao(true);
            const payload = {
                ...exumacoesForm,
                motivo: String(exumacoesForm.motivo || "").trim(),
                destino: String(exumacoesForm.destino || "").trim(),
                coveiro: String(exumacoesForm.coveiro || "").trim(),
                obs_exu: String(exumacoesForm.obs_exu || "").trim(),
                status: "pendente",
                confirmado: false
            };
            const res = await api.post("/exumacoes", payload);
            const created = res?.data ?? null;
            if (!created) throw new Error("Resposta inválida do servidor ao criar exumação");


            setExumacoesPending(prev => ({ ...prev, [key]: created }));

            try {
                window.dispatchEvent(new CustomEvent("processoCriado", { detail: created }));
            }
            catch (evErr) {
                console.warn("Erro ao dispatch processoCriado", evErr);
            };

            closeExumacaoForm();
            showSuccess("Exumação cadastrada e aguardando confirmação. ");
        } catch (err) {
            console.error("Erro ao enviar exumação", err);
            showError(getExumacaoSubmitErrorMessage(err));
        } finally {
            setIsSubmittingExumacao(false);
        }
    }


    const cancelExumacao = async (sep) => {
        if (!sep || !sep.id) return showError("Sepultamento inválido");
        const key = String(sep.id);
        const ex = exumacoesPending[key];
        if (!ex || !ex.id) {
            return showError("Nenhuma exumação pendente para este registro");
        }
        setPendingCancelExumacao({ sep, ex });
    };

    const closeCancelExumacaoDialog = () => {
        setPendingCancelExumacao(null);
    };

    const confirmCancelExumacao = async () => {
        const pending = pendingCancelExumacao;
        if (!pending?.sep?.id || !pending?.ex?.id) return;
        const key = String(pending.sep.id);
        try {
            await api.delete(`/exumacoes/${pending.ex.id}`);
            setExumacoesPending(prev => {
                const clone = { ...prev };
                delete clone[key];
                return clone;
            });
            try { window.dispatchEvent(new CustomEvent("processoCancelado", { detail: pending.ex })); } catch (e) { e };
            showError("Exumação cancelada. ");
            closeCancelExumacaoDialog();
        } catch (err) {
            console.error("Erro ao cancelar exumação", err);
            showError("Erro ao cancelar exumação");
        }
    }

    const getCovasCount = (quadraNum) => {
        if (!quadraNum) return 0;
        const q = quadras.find(qt => String(qt.id) === String(quadraNum) || String(qt.nome) === `Quadra ${quadraNum}` || String(qt.nome).endsWith(String(quadraNum)));
        return q && Array.isArray(q.covas) ? q.covas.length : 0;
    }

    const getQuadraOption = (q, idx = 0) => {
        const used = Array.isArray(q.covas) ? q.covas.length : getCovasCount(q.num_quadra ?? q.id);
        const max = Number(q.max_covas || 0);
        const full = max > 0 && used >= max;

        return {
            value: String(q.id),
            label: `${formatQuadraDisplay(q)} ${full ? "(lotada)" : ""}`.trim(),
            disabled: full,
            raw: q,
            key: String(q.id ?? q.num_sepultura ?? idx),
        };
    };

    /* const getSepultamentosCount = (quadraNum) =>{
        if(!quadraNum) return 0;
        const s = sepultamentosAll.find(sq =>String(sq.id) === String(quadraNum));
        return s && Array.isArray(s.sepultamentos) ? s.sepultamentos.length : 0;
    } */

    /* getSepultadosCount moved to src/utils/mapHelpers.js; fallback to sepCountsByQuadra first */
    const getSepultadosCountLocal = (quadraOrId) => {
        const quadraNum = (quadraOrId && typeof quadraOrId === "object") ? (quadraOrId.num_quadra ?? quadraOrId.id) : quadraOrId;
        if (quadraNum === null || quadraNum === undefined || quadraNum === "") return 0;
        const qStr = String(quadraNum);

        if (sepCountsByQuadra && Object.prototype.hasOwnProperty.call(sepCountsByQuadra, qStr)) {
            return Number(sepCountsByQuadra[qStr] || 0);
        }

        return mapHelpers.getSepultadosCount(sepultamentosAll, quadraOrId);
    }

    /* getSepultadosCountBySep moved to src/utils/mapHelpers.js */
    const getSepultadosCountBySepLocal = (cova, quadraId) => mapHelpers.getSepultadosCountBySep(cova, quadraId, sepultamentosAll);

    const handleAddCova = () => {
        setFormCova({
            quadra_cova: "",
            num_cova: "",
            tipo_cova: "cova",
            status: "disponivel",
            blocked: false,
            capacidade: "",
            concessao: {
                ativa: false,
                responsavel: "",
                prazo_anos: 0,
                data_inicio: "",
                data_fim: ""
            },
            obs: "",
        });
        setStructureSectionsOpen({ quadra: false, sepultura: true });
        setStructureDrawerOpen(true)
    };

    const updateQuadraFieldByName = (name, value) => {
        if (!name.includes(".")) {
            setFormQuadra(prev => ({ ...prev, [name]: value }));
            return;
        }
        const parts = name.split(".");
        setFormQuadra(prev => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i];
                cur[k] = (cur[k] && typeof cur[k] === "object") ? { ...cur[k] } : {};
                cur = cur[k];
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    }

    const updateFieldByName = (name, value) => {
        if (!name.includes(".")) {
            setFormCova(prev => ({ ...prev, [name]: value }));
            return;
        }
        const parts = name.split(".");
        setFormCova(prev => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i];
                cur[k] = (cur[k] && typeof cur[k] === "object") ? { ...cur[k] } : {};
                cur = cur[k];
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    };

    const handleQuadraChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : (type === "number" ? (value === "" ? "" : Number(value)) : value);
        updateQuadraFieldByName(name, incoming);
    }

    const handleGridChange = useCallback((item) => {
        const newId = item?.id ?? null;
        setSelectedQuadraId(prev => {
            if (prev === newId) return prev;
            return newId;
        })
    }, []);

    const handleCovaChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;
        updateFieldByName(name, incoming);
    };

    const handleCreateQuadra = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        const cemeteryId = selectedCemeteryId;
        if (cemeteryId == null || cemeteryId === "") {
            console.error("selectedCemeteryId:", selectedCemeteryId);
            showError("Selecione um cemitério antes de criar a quadra.");
            return;
        }

        const num = String(formQuadra.num_quadra || "").trim();
        const description = String(formQuadra.descricao || "").trim();

        if (!num) {
            showError("Informe o número da quadra");
            return;
        }

        const number = Number(num);
        if (!Number.isInteger(number) || number <= 0) {
            showError("Informe um número de quadra válido");
            return;
        }

        try {
            await handleCreateBlock({
                number,
                description,
                cemeteryId,
            });
        } catch (err) {
            console.error("Erro ao criar quadra", err);
            showError(err.message || "Erro ao criar quadra");
        }
    };

    /* const handleToggleBlockedLegal = async () => {
        const grave = selectedGraveForModal;
        if (!grave?.id) {
            alert("Sepultura sem identificação para atualização");
            return;
        }

        try {
            const nextBlocked = !grave.blocked;
            const updated = await updateGrave(grave.id, {
                ...grave,
                blocked: nextBlocked,
            });

            const finalBlocked = typeof updated?.blocked === "boolean" ? updated.blocked : nextBlocked;

            setCovasData((prev) =>
                prev.map((item) =>
                    String(item?.grave?.id) !== String(grave.id)
                        ? item
                        : {
                            ...item,
                            blocked: finalBlocked,
                            grave: {
                                ...item.grave,
                                ...updated,
                                blocked: finalBlocked,
                            },
                        }
                )
            );

            console.log(finalBlocked)

            setSelectedCova((prev) => {
                if (!prev) return prev;
                const prevGrave = prev?.cova?.grave ?? prev?.grave ?? null;
                if (!prevGrave || String(prevGrave.id) !== String(grave.id)) return prev;

                if (prev?.cova) {
                    return {
                        ...prev,
                        cova: {
                            ...prev.cova,
                            blocked: finalBlocked,
                            grave: {
                                ...prev.cova.grave,
                                ...updated,
                                blocked: finalBlocked,
                            },
                        },
                    };
                }

                return {
                    ...prev,
                    blocked: finalBlocked,
                    grave: {
                        ...prev.grave,
                        ...updated,
                        blocked: finalBlocked,
                    },
                };
            });
            console.log(finalBlocked)
            notifyInfo(finalBlocked ? "Sepultura bloqueada por questão legal." : "Bloqueio legal removido");
        } catch (err) {
            console.error("Erro ao atualizar blocked da sepultura", err);
            alert(err?.response?.data?.message || err?.message || "Erro ao atualizar bloqueio legal.");
        }
    } */

    const handleToggleStatus = async () => {
        const grave = selectedGraveForModal;
        if (!grave?.id) {
            showError("Sepultura sem identificação para atualização");
            return;
        }

        if (selectedCovaSepultadosCount > 0) {
            showError("Não é possível alterar a indisponibilidade de uma sepultura com falecidos sepultados.");
            return;
        }

        try {
            const currentStatus = String(grave?.status || "").toUpperCase();
            const nextStatus = currentStatus === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
            const nextDisplayStatus = nextStatus === "MAINTENANCE" ? "indisponivel" : "livre";

            const updatedGrave = await patchGraveStatus(grave.id, nextStatus);

            setCovasData((prev) =>
                prev.map((item) =>
                    String(item?.grave?.id) !== String(grave.id)
                        ? item
                        : {
                            ...item,
                            grave: {
                                ...item.grave,
                                ...updatedGrave,
                                status: nextStatus,
                            },
                            status: item.blocked ? "indisponivel" : nextDisplayStatus,
                        }
                )
            );

            setSelectedCova((prev) => {
                if (!prev) return prev;
                const prevGrave = prev?.cova?.grave ?? prev?.grave ?? null;
                if (!prevGrave || String(prevGrave.id) !== String(grave.id)) return prev;

                if (prev?.cova) {
                    return {
                        ...prev,
                        cova: {
                            ...prev.cova,
                            grave: {
                                ...prev.cova.grave,
                                ...updatedGrave,
                                status: nextStatus,
                            },
                        },
                        status: prev.blocked ? "indisponivel" : nextDisplayStatus,
                    };
                }

                return {
                    ...prev,
                    grave: {
                        ...prev.grave,
                        ...updatedGrave,
                        status: nextStatus,
                    },
                    status: prev.blocked ? "indisponivel" : nextDisplayStatus,
                };
            });

            showSuccess(
                nextStatus === "MAINTENANCE"
                    ? "Sepultura marcada como indisponível (manutenção)."
                    : "Sepultura marcada como disponível."
            );
        } catch (err) {
            console.error("Erro ao atualizar status da sepultura", err);
            showError(err?.response?.data?.message || err?.message || "Erro ao atualizar status.");
        }
    };

    const handleCreateCova = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const quadra = String(formCova.quadra_cova || "").trim();
        const num = String(formCova.num_cova || "").trim();
        const tipo = String(formCova.tipo_cova || "").trim();

        if (!quadra || !num) {
            showError("Informe quadra e número da sepultura");
            return;
        }

        const parsedNumber = Number(num);
        if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
            showError("Número da sepultura inválido");
            return;
        }

        const parsedBlockId = String(quadra).trim();
        if (!parsedBlockId) {
            showError("Quadra inválida");
            return;
        }

        const parsedBodyCapacity = Number(formCova.capacidade || 1);
        if (!Number.isInteger(parsedBodyCapacity) || parsedBodyCapacity <= 0) {
            showError("Capacidade inválida");
            return;
        }

        const graveTypeMap = {
            cova: "EARTH",
            gaveta: "MAUSOLEUM",
            nicho: "MAUSOLEUM",
        };


        const graveType = graveTypeMap[tipo] || "EARTH";
        const areaType = formCova.concessao?.ativa ? "PERPETUAL" : "COMMON";
        const blocked = false;
        const backendStatus = "AVAILABLE";


        try {
            await handleCreateGrave({
                number: parsedNumber,
                graveType,
                bodyCapacity: parsedBodyCapacity,
                areaType,
                blockId: parsedBlockId,
                status: backendStatus,
                blocked,
            });

            setStructureDrawerOpen(false);
            await loadMapData();
            showSuccess("Sepultura criada");
        } catch (err) {
            console.error("Erro ao criar sepultura", err);
            showError(err.message || "Erro ao criar sepultura")
        }
    }

    const closeStructureDrawer = () => {
        setStructureDrawerOpen(false);
    };

    const toggleStructureSection = (section) => {
        setStructureSectionsOpen((current) => ({
            ...current,
            [section]: !current[section],
        }));
    };

    const loadMapData = useCallback(async () => {
        setIsMapLoading(true)
        try {

            const [rGraves] = await Promise.all([
                api.get("/graves"),
                loadBlocks(),
            ]);

            const rawGraves = rGraves?.data;
            const gravesData = Array.isArray(rawGraves)
                ? rawGraves
                : Array.isArray(rawGraves?.content)
                    ? rawGraves.content
                    : Array.isArray(rawGraves?.data)
                        ? rawGraves.data
                        : [];


            const normalizedCovasData = gravesData.map((grave) => ({
                id: grave?.id,
                quadra_cova: String(mapHelpers.resolveBlockId(grave?.blockId ?? grave?.block) || ""),
                num_cova: grave?.number ?? "",
                tipo_cova: String(grave?.graveType || "").toUpperCase() === "MAUSOLEUM" ? "gaveta" : "cova",
                capacidade: grave?.bodyCapacity === null || grave?.bodyCapacity === undefined ? "" : Number(grave.bodyCapacity),
                status: grave?.blocked || String(grave?.status || "").toUpperCase() === "MAINTENANCE"
                    ? "indisponivel"
                    : String(grave?.status || "").toUpperCase() === "OCCUPIED"
                        ? "ocupada"
                        : "livre",
                active: grave?.active,
                blocked: grave?.blocked,
                reason: grave?.reason ?? "",
                grave,
            }));

            setCovasData(normalizedCovasData);

            const [rSep, rExu, rPets, rOss, rFal, rContratos] = await Promise.allSettled([
                api.get("/sepultamentos"),
                api.get("/exumacoes"),
                api.get("/pets"),
                api.get("/ossarios"),
                api.get("/falecidos"),
                api.get("/contratos"),
            ]);

            const sepData =
                rSep.status === "fulfilled" && Array.isArray(rSep.value?.data)
                    ? rSep.value.data
                    : [];
            const exuData =
                rExu.status === "fulfilled" && Array.isArray(rExu.value?.data)
                    ? rExu.value.data
                    : [];
            const petsData =
                rPets.status === "fulfilled" && Array.isArray(rPets.value?.data)
                    ? rPets.value.data
                    : [];
            const ossariosData =
                rOss.status === "fulfilled" && Array.isArray(rOss.value?.data)
                    ? rOss.value.data
                    : [];
            const falecidosData =
                rFal.status === "fulfilled" && Array.isArray(rFal.value?.data)
                    ? rFal.value.data
                    : [];
            const contratosData =
                rContratos.status === "fulfilled" && Array.isArray(rContratos.value?.data)
                    ? rContratos.value.data
                    : [];

            setSepultamentosAll(sepData);
            setExumacoesAll(exuData);
            setFalecidosAll(falecidosData);
            setPetsAll(petsData);
            setOssariosAll(ossariosData);
            setContratosAll(contratosData);

            const pendingMap = {};
            exuData.forEach((ex) => {
                const statusRaw = String(ex.status ?? "").toLowerCase();
                const isPending =
                    statusRaw.includes("pend") ||
                    ex.confirmado === false ||
                    ex.confirmado === null ||
                    ex.confirmado === undefined;

                if (!isPending) return;

                const sepId = ex.sepultamentoId ?? null;
                if (sepId != null) {
                    pendingMap[String(sepId)] = ex;
                }
            });
            setExumacoesPending(pendingMap);


            setSepCountsByQuadra(mapHelpers.getSepCountsByQuadra(sepData, normalizedCovasData));

            const qs = new URLSearchParams(location.search);
            const sepId = qs.get("sepId") || qs.get("sepultamentoId");

            if (sepId) {
                const sep = sepData.find((s) => String(s.id) === String(sepId));
                if (sep) {
                    const falId = sep?.falecido ?? sep?.falecido_id ?? sep?.falecidoId;
                    let fal = null;

                    if (falId) {
                        try {
                            const rf = await api.get(`/falecidos/${falId}`);
                            fal = rf.data;
                        } catch (e) {
                            console.error("Erro ao buscar falecido", e);
                        }
                    }

                    const qid = mapHelpers.resolveCovaQuadraKey(null, sep);
                    if (qid != null && qid !== "") setSelectedQuadraId(qid);

                    setSelectedCova({
                        id: sep.id,
                        numero: mapHelpers.resolveCovaNumber(null, sep),
                        sep,
                    });

                    setModalForm({ ...sep, falecido: fal || null });
                    setModalOpen(true);
                }
            }
        } catch (err) {
            console.error("Erro ao carregar sepultamento/quadras", err);
        } finally {
            setIsMapLoading(false);
        }
    }, [location.search, loadBlocks]);

    useEffect(() => {
        loadMapData();
    }, [loadMapData]);

    useEffect(() => {
        const onCriado = (ev) => {
            const ex = ev?.detail;
            if (!ex) return;
            const sepId = ex.sepultamentoId ?? ex.sepultamentoId ?? ex.sepultamento ?? null;
            if (sepId != null) {
                setExumacoesPending(prev => ({ ...prev, [String(sepId)]: ex }));
            }
        };

        const onCancelado = (ev) => {
            const ex = ev?.detail;
            if (!ex) return;
            setExumacoesPending(prev => {
                const clone = { ...prev };
                Object.keys(clone).forEach(k => {
                    const val = clone[k];
                    if (!val) return;
                    if (String(val.id) === String(ex.id) || String(k) === String(ex.sepultamentoId) || String(val.sepultamentoId) === String(ex.sepultamentoId)) {
                        delete clone[k];
                    }
                });
                return clone;
            });
        };

        const onConfirmado = (ev) => {
            const detail = ev?.detail;
            if (!detail) return;
            const type = String(detail.type || "").toLowerCase();
            if (type.includes("sepult") || type.includes("exum")) {
                const exId = detail.id;
                setExumacoesPending(prev => {
                    const clone = { ...prev };
                    Object.keys(clone).forEach(k => {
                        const val = clone[k];
                        if (!val) return;
                        if (String(val.id) === String(exId) || String(val.sepultamentoId) === String(detail.sepultamentoId) || String(k) === String(detail.sepultamentoId)) {
                            delete clone[k];
                        }
                    });
                    return clone;
                });
                try { loadMapData(); } catch (e) { e }
            }
        };
        window.addEventListener("processoCriado", onCriado);
        window.addEventListener("processoCancelado", onCancelado);
        window.addEventListener("processoConfirmado", onConfirmado);
        return () => {
            window.removeEventListener("processoCriado", onCriado);
            window.removeEventListener("processoCancelado", onCancelado);
            window.removeEventListener("processoConfirmado", onConfirmado);
        };
    }, [loadMapData]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsQuadraDropdownOpen(false)
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setIsSortDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);


    const quadraSelecionada = useMemo(
        () => quadras.find(q => String(q.id) === String(selectedQuadraId)) || { covas: [] },
        [quadras, selectedQuadraId]
    );

    /*  const handleSelectQuadra = (e) => {
         const v = e?.target?.value;
         if (v === "" || v === null) {
             setSelectedQuadraId(null);
             return;
         }
         const parsed = /^\d+$/.test(String(v)) ? Number(v) : v;
         setSelectedQuadraId(parsed);
     }; */

    const handleClickCova = (cova) => {
        setSelectedCova(cova);
        const grave = cova?.cova?.grave ?? cova?.grave ?? null;
        const quadraKey = mapHelpers.resolveCovaQuadraKey(cova, cova?.sep, grave, selectedQuadraId);
        const numero = mapHelpers.resolveCovaNumber(cova, cova?.sep, grave);
        const list = (sepultamentosAll || []).filter(s => {
            if (s.foi_exumado) return false;
            const sQuadra = mapHelpers.resolveCovaQuadraKey(null, s);
            const sNum = mapHelpers.resolveCovaNumber(null, s);
            return sQuadra === quadraKey && sNum === numero;
        });

        if (cova.sep && !list.find(s => String(s.id) === String(cova.sep.id))) list.unshift(cova.sep);
        setModalSepList(list);
        setModalExpandedIndex(null);

        (async () => {
            const first = list[0] ?? cova.sep ?? null;
            if (first) {
                const falId = cova.sep?.falecido ?? cova.sep?.falecido_id ?? cova.sep?.falecidoId;
                let fal = null;
                if (falId) {
                    try {
                        const rf = await api.get(`/falecidos/${falId}`);
                        fal = rf.data;
                    } catch (e) {
                        console.error("Erro", e)
                    };
                }
                setModalForm({ ...first, falecido: fal || null });
            } else {
                setModalForm(null);
            }
            setModalOpen(true);
        })();


    };

    const statusList = [
        { key: "ocupada", label: "Ocupada", color: "#000" },
        { key: "disponivel", label: "Disponível", color: "#9e9e9e" },
        { key: "indisponivel", label: "Indisponível", color: "#c55" },
        { key: "reservada", label: "Particular", color: "#d2b24a" },
        { key: "particular_ocupada", label: "P/O (Particular e ocupada)", color: "#000", borderColor: "#d2b24a", borderWidth: 3 }
    ];

    const sepDataForModal = modalForm ?? selectedCova?.sep ?? null;
    const isOccupiedForModal = String(selectedCova?.status || "").toLowerCase().includes("ocup") || !!sepDataForModal;
    const tipoForModal = selectedCova?.tipo_cova ?? selectedCova?.cova?.tipo_cova ?? sepDataForModal?.tipo_cova ?? sepDataForModal?.tipo_sep ?? "-";
    const selectedGraveForModal = selectedCova?.cova?.grave ?? selectedCova?.grave ?? null;
    const bloqueadoForModal = Boolean(selectedGraveForModal?.blocked);
    const capacidadeForModal = selectedCova?.capacidade ?? selectedCova?.cova?.capacidade ?? selectedCova?.sep?.capacidade ?? sepDataForModal?.capacidade ?? "-";
    const observacoesForModal = selectedCova?.obs ?? selectedCova?.cova?.obs ?? "-";

    const selectedCovaMeta = useMemo(() => {
        const quadraKey = mapHelpers.resolveCovaQuadraKey(selectedCova, sepDataForModal, selectedGraveForModal, selectedQuadraId);
        const numeroKey = mapHelpers.resolveCovaNumber(selectedCova, sepDataForModal, selectedGraveForModal);
        const quadra = (quadrasDesc || quadras || []).find((item) =>
            String(item?.id) === String(quadraKey) ||
            String(item?.num_quadra) === String(quadraKey) ||
            String(item?.number) === String(quadraKey)
        );

        return {
            grave: selectedGraveForModal,
            sepultamento: sepDataForModal,
            quadraKey,
            numeroKey,
            quadraLabel: quadra ? formatQuadraDisplay(quadra) : quadraKey || "-",
            numeroLabel: numeroKey || "-",
        };
    }, [quadras, quadrasDesc, selectedCova, selectedQuadraId, selectedGraveForModal, sepDataForModal]);

    const selectedCovaQuadraKey = selectedCovaMeta.quadraKey;
    const selectedCovaNumeroKey = selectedCovaMeta.numeroKey;
    const numeroForModal = selectedCovaMeta.numeroLabel;    /* const nomeSepForModal = sepDataForModal?.nome_sep ?? sepDataForModal?.falecido?.nome_fal ?? sepDataForModal?.falecido?.nome ?? null; */
    const contratoForModal = useMemo(() => {
        if (!selectedCova) return null;

        const grave = selectedGraveForModal || {};
        const titleKeys = [
            grave.contractTitle,
            grave.contract_title,
            selectedCova?.cova?.grave?.contractTitle,
            selectedCova?.sep?.numero_titulo,
            sepDataForModal?.numero_titulo,
            modalForm?.numero_titulo,
        ].filter((value) => value !== null && value !== undefined && String(value).trim() !== "");

        const contractId = sepDataForModal?.contrato_id ?? modalForm?.contrato_id ?? selectedCova?.sep?.contrato_id ?? "";
        const byIdOrTitle = contratosAll.find((contrato) => (
            (contractId && String(contrato?.id) === String(contractId)) ||
            titleKeys.some((key) => String(contrato?.numero_titulo) === String(key))
        ));
        if (byIdOrTitle) return byIdOrTitle;

        const quadraKeys = [
            selectedCovaQuadraKey,
            quadraSelecionada?.id,
            quadraSelecionada?.num_quadra,
            grave.blockId,
            grave.block?.id,
        ].filter((value) => value !== null && value !== undefined && String(value).trim() !== "").map(String);
        const sepulturaNumber = String(selectedCovaNumeroKey || "").trim();
        if (!quadraKeys.length || !sepulturaNumber) return null;

        return contratosAll.find((contrato) => (
            String(contrato?.sepultura || "").trim() === sepulturaNumber &&
            quadraKeys.includes(String(contrato?.blockId ?? contrato?.quadra ?? "").trim())
        )) || null;
    }, [
        contratosAll,
        modalForm,
        quadraSelecionada,
        selectedCova,
        selectedCovaNumeroKey,
        selectedCovaQuadraKey,
        selectedGraveForModal,
        sepDataForModal,
    ]);
    const hasContratoForModal = Boolean(contratoForModal);
    const openContratoForModal = () => {
        if (!contratoForModal?.numero_titulo) return;
        const search = encodeURIComponent(contratoForModal.numero_titulo);
        navigate(`/contratos?search=${search}`, {
            state: { contratoSearch: contratoForModal.numero_titulo },
        });
    };
    const selectedCovaSepultadosCount = selectedCova
        ? getSepultadosCountBySepLocal(selectedCova, selectedCovaQuadraKey || selectedQuadraId)
        : 0;
    const statusToggleBlocked = selectedCovaSepultadosCount > 0;
    const statusToggleTitle = statusToggleBlocked
        ? "Não é possível alterar: há falecidos sepultados nesta sepultura."
        : String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"
            ? "Liberar para uso"
            : "Marcar indisponível (manutenção)";

    const covaTimelineItems = useMemo(() => {
        if (!selectedCovaQuadraKey || !selectedCovaNumeroKey) return [];

        const sameSepultura = (item) => {
            const quadra = mapHelpers.resolveCovaQuadraKey(null, item);
            const numero = mapHelpers.resolveCovaNumber(null, item);
            return quadra === selectedCovaQuadraKey && numero === selectedCovaNumeroKey;
        };

        const resolveDate = (...values) => values.find((value) => parseDateValue(value));
        const formatMeta = (date) => formatDateTimeDMY(date, "Data não informada");
        const sepultamentosDaCova = (sepultamentosAll || []).filter(sameSepultura);
        const sepIds = new Set(sepultamentosDaCova.map((sep) => String(sep.id ?? sep._id ?? "")).filter(Boolean));
        const falecidoIds = new Set(
            sepultamentosDaCova
                .map((sep) => sep?.falecido ?? sep?.falecido_id ?? sep?.falecidoId)
                .filter((id) => id !== null && id !== undefined && id !== "")
                .map(String)
        );
        const events = [];

        if (selectedGraveForModal?.id) {
            const date = resolveDate(selectedGraveForModal.createdAt, selectedGraveForModal.created_at, selectedGraveForModal.updatedAt);
            events.push({
                id: `grave-${selectedGraveForModal.id}`,
                label: "Sepultura cadastrada",
                text: `${selectedCovaMeta.quadraLabel} - Sepultura ${selectedCovaMeta.numeroLabel}`,
                timestamp: date,
                meta: formatMeta(date),
                tone: "neutral",
            });
        }

        sepultamentosDaCova.forEach((sep) => {
            const date = resolveDate(sep.dh_sep, sep.data_hora, sep.createdAt, sep.created_at, sep.data_obito_sep);
            const name = sep.nome_sep || sep.falecido?.nome_fal || sep.falecido?.nome || "Falecido não identificado";
            events.push({
                id: `sep-${sep.id ?? `${selectedCovaQuadraKey}-${selectedCovaNumeroKey}-${date || name}`}`,
                label: "Sepultamento registrado",
                text: name,
                timestamp: date,
                meta: formatMeta(date),
                tone: sep.foi_exumado ? "neutral" : "success",
            });
        });

        (falecidosAll || [])
            .filter((falecido) => falecidoIds.has(String(falecido?.id ?? falecido?._id ?? "")))
            .forEach((falecido) => {
                const date = resolveDate(falecido.createdAt, falecido.created_at, falecido.data_obito_fal, falecido.data_obito);
                events.push({
                    id: `fal-${falecido.id ?? falecido._id}`,
                    label: "Falecido vinculado",
                    text: falecido.nome_fal || falecido.nome || "Falecido vinculado",
                    timestamp: date,
                    meta: formatMeta(date),
                    tone: "neutral",
                });
            });

        (exumacoesAll || [])
            .filter((exumacao) => {
                const sepId = exumacao?.sepultamentoId ?? exumacao?.sepultamento_id ?? exumacao?.sepultamento?.id;
                return (sepId != null && sepIds.has(String(sepId))) || sameSepultura(exumacao);
            })
            .forEach((exumacao) => {
                const date = resolveDate(exumacao.dh_exu, exumacao.data_exumacao, exumacao.createdAt, exumacao.created_at);
                const statusRaw = String(exumacao.status ?? "").toLowerCase();
                const isPending = statusRaw.includes("pend") || exumacao.confirmado === false || exumacao.confirmado == null;
                events.push({
                    id: `exu-${exumacao.id ?? exumacao._id ?? `${date}-${exumacao.destino}`}`,
                    label: isPending ? "Exumação pendente" : "Exumação registrada",
                    text: exumacao.destino ? `Destino: ${exumacao.destino}` : exumacao.motivo || "Movimentação de exumação",
                    timestamp: date,
                    meta: formatMeta(date),
                    tone: isPending ? "warning" : "danger",
                });
            });

        (petsAll || [])
            .filter(sameSepultura)
            .forEach((pet) => {
                const date = resolveDate(pet.dh_sep_pet, pet.createdAt, pet.created_at, pet.data_obito_pet);
                events.push({
                    id: `pet-${pet.id ?? pet._id ?? `${date}-${pet.nome_pet}`}`,
                    label: "Pet vinculado",
                    text: pet.nome_pet || pet.nome || "Pet sepultado",
                    timestamp: date,
                    meta: formatMeta(date),
                    tone: "success",
                });
            });

        return events.sort((a, b) => {
            const dateA = parseDateValue(a.timestamp)?.getTime() ?? 0;
            const dateB = parseDateValue(b.timestamp)?.getTime() ?? 0;
            return dateB - dateA;
        });
    }, [
        exumacoesAll,
        falecidosAll,
        petsAll,
        selectedCovaMeta.quadraLabel,
        selectedCovaMeta.numeroLabel,
        selectedCovaNumeroKey,
        selectedCovaQuadraKey,
        selectedGraveForModal,
        sepultamentosAll,
    ]);

    const getPetsCountBySepLocal = (cova, quadraId) => mapHelpers.getPetsCountBySep(cova, quadraId, petsAll);

    /* getCovaDisplayMeta moved to src/utils/mapHelpers.js */
    const covaMeta = useCallback(
        (cova) => mapHelpers.getCovaDisplayMeta(cova, quadraSelecionada, sepultamentosAll, petsAll),
        [petsAll, quadraSelecionada, sepultamentosAll]
    );

    const filteredCovas = useMemo(() => (quadraSelecionada.covas || []).filter((cova) => {
        if (!statusFilter) return true;
        return covaMeta(cova).displayStatus === statusFilter;
    }), [covaMeta, quadraSelecionada.covas, statusFilter]);

    const displayedCovas = useMemo(() => {
        if (covaSortMode === mapHelpers.COVA_SORT_MODES.numero) {
            return mapHelpers.sortCovasByNumber(filteredCovas);
        }

        return filteredCovas;
    }, [covaSortMode, filteredCovas]);

    const activeStatusLabel = statusList.find((s) => s.key === statusFilter)?.label ?? "";
    const covaSortLabel = covaSortMode === mapHelpers.COVA_SORT_MODES.numero ? "Número" : "Cadastro";

    const closeCovaDrawer = () => {
        setModalOpen(false);
        setSelectedCova(null);
        setModalForm(null);
        setModalSepList([]);
        setModalExpandedIndex(null);
    };


    return (
        <>
            {ToastElement}
            <ConfirmationDialog
                open={Boolean(pendingCancelExumacao)}
                onClose={closeCancelExumacaoDialog}
                onConfirm={confirmCancelExumacao}
                title="Cancelar exumação"
                alertSeverity="error"
                alertMessage="Esta ação removerá a exumação pendente do sistema."
                description={pendingCancelExumacao ? `Cancelar exumação pendente para ${pendingCancelExumacao.sep?.nome_sep || "este registro"}?` : "Confirme o cancelamento da exumação."}
                confirmLabel="Cancelar exumação"
                confirmTone="delete"
                confirmDisabled={!pendingCancelExumacao}
                isSubmitting={isMapLoading}
                ariaDescriptionId="exumacao-cancel-dialog-description"
            />
            <Container>
                <Title>Controle de Sepulturas</Title>
                <Subtitle>Controle e visualização das quadras e sepulturas do cemitério vigente.</Subtitle>

                <LoadingOverlay open={isMapLoading} />

                <MapToolbar>
                    <ToolbarLabel>Quadra: </ToolbarLabel>

                    <QuadraDropdownWrapper ref={dropdownRef}>
                        <QuadraSelectButton disabled={isMapLoading} onClick={() => { if (isMapLoading) return; setIsQuadraDropdownOpen(!isQuadraDropdownOpen) }}
                        >
                            {selectedQuadraId ? formatQuadraDisplay(quadrasDesc.find((q) => String(q.id) === String(selectedQuadraId)) || selectedQuadraId) : "Selecione uma quadra"}
                            <DropdownIcon>
                                {isQuadraDropdownOpen ? "▲" : "▼"}
                            </DropdownIcon>
                        </QuadraSelectButton>

                        <QuadraDropdown
                            $isOpen={isQuadraDropdownOpen}
                            aria-hidden={!isQuadraDropdownOpen}>
                            <GridQuadras
                                quadrasDesc={quadrasDesc}
                                value={selectedQuadraId}
                                onChange={handleGridChange}
                                columnsMinWidth={40}
                            />
                        </QuadraDropdown>

                    </QuadraDropdownWrapper>

                    <ToolbarLabel>Ordenar:</ToolbarLabel>

                    <SortDropdownWrapper ref={sortDropdownRef}>
                        <QuadraSelectButton
                            type="button"
                            disabled={isMapLoading}
                            onClick={() => {
                                if (isMapLoading) return;
                                setIsSortDropdownOpen((current) => !current);
                            }}
                        >
                            {covaSortLabel}
                            <DropdownIcon>
                                {isSortDropdownOpen ? "▲" : "▼"}
                            </DropdownIcon>
                        </QuadraSelectButton>

                        <SortDropdown
                            $isOpen={isSortDropdownOpen}
                            aria-hidden={!isSortDropdownOpen}
                        >
                            <SortOptionButton
                                type="button"
                                $active={covaSortMode === mapHelpers.COVA_SORT_MODES.cadastro}
                                onClick={() => {
                                    setCovaSortMode(mapHelpers.COVA_SORT_MODES.cadastro);
                                    setIsSortDropdownOpen(false);
                                }}
                            >
                                Cadastro
                            </SortOptionButton>
                            <SortOptionButton
                                type="button"
                                $active={covaSortMode === mapHelpers.COVA_SORT_MODES.numero}
                                onClick={() => {
                                    setCovaSortMode(mapHelpers.COVA_SORT_MODES.numero);
                                    setIsSortDropdownOpen(false);
                                }}
                            >
                                Número
                            </SortOptionButton>
                        </SortDropdown>
                    </SortDropdownWrapper>

                    <QuadraActions>
                        <SystemButton style={{ width: "100px", paddingLeft: "1px", paddingRight: "1px", background: "#fff", color: "#191970" }} type="button" disabled={isMapLoading} onClick={handleAddQuadra}><SquarePlus /> Quadra </SystemButton>
                        <SystemButton style={{ width: "115px", paddingLeft: "1px", paddingRight: "1px", background: "#fff", color: "#191970" }} type="button" disabled={isMapLoading} onClick={handleAddCova}><SquarePlus /> Sepultura </SystemButton>
                    </QuadraActions>
                </MapToolbar>

                <QuadraWrapper key={quadraSelecionada.id || "preview"}>
                    <QuadraHeader>
                        <QuadraTitle>{quadraSelecionada.nome || "Nenhuma quadra selecionada"}</QuadraTitle>
                        <QuadraInfo key={String(quadraSelecionada.id)}>
                            <InfoPill>Capacidade máxima de sepulturas: {quadraSelecionada.max_covas > 0 ? quadraSelecionada.max_covas : "-"}</InfoPill>
                            <InfoPill>Número atual de sepulturas: {Array.isArray(quadraSelecionada.covas) ? quadraSelecionada.covas.length : getCovasCount?.(quadraSelecionada.num_quadra ?? quadraSelecionada.id) ?? 0}</InfoPill>
                            <InfoPill>Número atual de sepultados: {getSepultadosCountLocal(quadraSelecionada.id ?? quadraSelecionada.num_quadra ?? selectedQuadraId)}</InfoPill>
                        </QuadraInfo>
                    </QuadraHeader>



                    {filteredCovas.length === 0 ? (
                        <EmptyMapState>
                            {statusFilter ? `Nenhuma sepultura encontrada para ${activeStatusLabel}.` : "Nenhuma sepultura cadastrada nesta quadra."}
                        </EmptyMapState>
                    ) : (
                        <CovaGrid>
                            {displayedCovas.map((cova) => {

                                const grave = cova?.cova?.grave ?? cova?.grave ?? {};
                                const backendStatus = String(grave?.status ?? "").toUpperCase();
                                const rawAreaType = grave?.areaType ?? grave?.area_type ?? cova?.areaType ?? cova?.area_type ?? "";
                                const isPerpetual = String(rawAreaType).toUpperCase() === "PERPETUAL";
                                const isBlocked = !!grave?.blocked;

                                const sepCount = getSepultadosCountBySepLocal(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra);
                                const petCount = getPetsCountBySepLocal(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra);

                                const capacidadeDisponivel = Number(grave?.bodyCapacity ?? cova?.capacidade ?? 0);
                                const occupiedCount =
                                    sepCount > 0
                                        ? sepCount
                                        : backendStatus === "OCCUPIED" && capacidadeDisponivel > 0
                                            ? capacidadeDisponivel
                                            : 0;
                                const capacidadeTotal = Number.isFinite(capacidadeDisponivel)
                                    ? capacidadeDisponivel + occupiedCount
                                    : occupiedCount;
                                const slotCount = capacidadeTotal > 0 ? capacidadeTotal : 0;
                                const occupiedSlots = Math.min(Math.max(occupiedCount, 0), slotCount);

                                let displayStatus = "disponivel";

                                if (isBlocked || backendStatus === "MAINTENANCE") {
                                    displayStatus = "indisponivel";
                                } else if (backendStatus === "OCCUPIED") {
                                    displayStatus = isPerpetual ? "particular_ocupada" : "ocupada";
                                } else if (isPerpetual) {
                                    displayStatus = "reservada";
                                }

                                return (
                                    <CovaItem
                                        key={cova.id}
                                        status={displayStatus}
                                        borderColor={(displayStatus === "reservada" || displayStatus === "particular_ocupada") ? "#d2b24a" : undefined}
                                        borderWidth={(displayStatus === "reservada" || displayStatus === "particular_ocupada") ? 5 : undefined}
                                        $selected={String(selectedCova?.id) === String(cova.id)}
                                        $progressContrast={displayStatus === "ocupada" || displayStatus === "particular_ocupada" ? "light" : "dark"}
                                        onClick={() => handleClickCova(cova)}
                                        title={`Sepultura ${cova.numero} - ${displayStatus} (${occupiedCount}/${capacidadeTotal}${petCount > 0 ? ` | 🐾 ${petCount}` : ""})`}
                                    >
                                        <CovaNumber aria-hidden="true">{cova.numero}</CovaNumber>
                                        <span className="cova-capacity" aria-hidden="true"><PiFlowerTulipBold />{`${occupiedCount}/${capacidadeTotal}`}  </span>
                                        {slotCount > 0 ? (
                                            <span
                                                className="cova-progress"
                                                style={{ "--slot-count": slotCount }}
                                                aria-hidden="true"
                                            >
                                                {Array.from({ length: slotCount }).map((_, slotIndex) => (
                                                    <span
                                                        key={slotIndex}
                                                        className="cova-progress-slot"
                                                        data-filled={slotIndex < occupiedSlots ? "true" : "false"}
                                                    />
                                                ))}
                                            </span>
                                        ) : null}
                                        {petCount > 0 && (
                                            <>
                                                <span className="cova-divider" aria-hidden="true" />
                                                <span className="cova-petCap" aria-hidden="true">
                                                    <MdPets size={12} />
                                                    {petCount}
                                                </span>
                                            </>
                                        )}
                                    </CovaItem>
                                )
                            })}
                        </CovaGrid>
                    )}
                </QuadraWrapper>

                <LegendWrapper>
                    <LegendRow>
                        {statusList.map(s => (
                            <LegendButton
                                key={s.key}
                                type="button"
                                color={s.color}
                                borderColor={s.borderColor}
                                borderWidth={s.borderWidth}
                                $active={statusFilter === s.key}
                                onClick={() => setStatusFilter((current) => current === s.key ? null : s.key)}
                                aria-pressed={statusFilter === s.key}
                            >
                                <span className="color" />
                                <span>{s.label}</span>
                            </LegendButton>
                        ))}

                        {statusFilter && (
                            <ActiveFilterPill type="button" onClick={() => setStatusFilter(null)}>
                                Limpar filtro: {activeStatusLabel}
                            </ActiveFilterPill>
                        )}
                    </LegendRow>

                    <CovaGridToolbar>
                        <SystemButton type="button" tone="cancel" disabled={isMapLoading} onClick={() => setIsPieChartOpen(true)}>
                            <FaChartPie /> Distribuição de Sepulturas
                        </SystemButton>
                    </CovaGridToolbar>
                </LegendWrapper>

                <DefaultModal
                    open={isPieChartOpen}
                    title="Distribuição de Sepulturas"
                    subtitle={"Visualização da ocupação das sepulturas."}
                    width="500px"
                    onClose={() => setIsPieChartOpen(false)}
                >
                    <ChartModalBody>
                        <ChartArea>
                            <PieChartSepulturas />
                        </ChartArea>
                        <ChartLegend>
                            {statusList.map(s => (
                                <LegendItem key={s.key} color={s.color} borderColor={s.borderColor} borderWidth={s.borderWidth}>
                                    <span className="color" />
                                    <span>{s.label}</span>
                                </LegendItem>
                            ))}
                        </ChartLegend>
                    </ChartModalBody>
                </DefaultModal>
                <DrawerComponent
                    open={structureDrawerOpen}
                    title="Adicionar estrutura"
                    subtitle="Cadastre quadras e sepulturas diretamente no mapa."
                    width="560px"
                    bodyDisplay="block"
                    onClose={closeStructureDrawer}
                >
                    <SectionCard>
                        <SectionHeader>
                            <StructureSectionToggle
                                type="button"
                                onClick={() => toggleStructureSection("quadra")}
                                aria-expanded={structureSectionsOpen.quadra}
                            >
                                <div>
                                    <SectionTitle>Cadastro de quadra</SectionTitle>
                                    <SectionHint>Informe a identificação da nova quadra.</SectionHint>
                                </div>
                                <StructureChevron $open={structureSectionsOpen.quadra}>
                                    <LuChevronDown size={20} />
                                </StructureChevron>
                            </StructureSectionToggle>
                        </SectionHeader>
                        {structureSectionsOpen.quadra ? (
                            <form onSubmit={handleCreateQuadra}>
                                <InfoGrid>
                                    <Field>
                                        <Label>Nº da quadra</Label>
                                        <Input
                                            name="num_quadra"
                                            value={formQuadra.num_quadra}
                                            onChange={handleQuadraChange}
                                        />
                                    </Field>

                                    <Field>
                                        <Label>Descrição</Label>
                                        <Input
                                            name="descricao"
                                            value={formQuadra.descricao || ""}
                                            onChange={handleQuadraChange}
                                        />
                                    </Field>
                                </InfoGrid>

                                <ModalActions>
                                    <SystemButton
                                        type="button"
                                        tone="cancel"
                                        onClick={closeStructureDrawer}
                                    >
                                        Cancelar
                                    </SystemButton>

                                    <SystemButton type="submit" disabled={creatingBlock}>
                                        {creatingBlock ? "Criando..." : "Criar quadra"}
                                    </SystemButton>
                                </ModalActions>
                            </form>
                        ) : null}
                    </SectionCard>

                    <SectionCard>
                        <SectionHeader>
                            <StructureSectionToggle
                                type="button"
                                onClick={() => toggleStructureSection("sepultura")}
                                aria-expanded={structureSectionsOpen.sepultura}
                            >
                                <div>
                                    <SectionTitle>Cadastro de sepultura</SectionTitle>
                                    <SectionHint>Vincule a sepultura a uma quadra e defina seus dados operacionais.</SectionHint>
                                </div>
                                <StructureChevron $open={structureSectionsOpen.sepultura}>
                                    <LuChevronDown size={20} />
                                </StructureChevron>
                            </StructureSectionToggle>
                        </SectionHeader>
                        {structureSectionsOpen.sepultura ? (
                            <form onSubmit={handleCreateCova}>
                                <StructureTripleGrid>
                                    <StructureGridSpanTwo>
                                        <Field>
                                            <Label>Quadra</Label>
                                            <CustomSelect
                                                name="quadra_cova"
                                                value={formCova.quadra_cova}
                                                onChange={handleCovaChange}
                                                placeholder="Selecione a quadra"
                                                options={quadrasDesc.map(getQuadraOption)}
                                                renderValue={(_, option) => (
                                                    <InfoPill>{formatQuadraDisplay(option.raw)}</InfoPill>
                                                )}
                                                renderDropdown={({ selectOption }) => (
                                                    <GridQuadras
                                                        quadrasDesc={quadrasDesc}
                                                        value={formCova.quadra_cova}
                                                        onChange={(quadra) => {
                                                            const option = quadra
                                                                ? getQuadraOption(quadra)
                                                                : null;
                                                            selectOption(option);
                                                        }}
                                                        columnsMinWidth={40}
                                                    />
                                                )}
                                            />
                                        </Field>
                                    </StructureGridSpanTwo>

                                    <Field>
                                        <Label>Status</Label>
                                        <SystemSelect name="status" value={formCova.status} onChange={handleCovaChange}>
                                            <option value="disponivel">Disponível</option>
                                            <option value="indisponivel">Indisponível</option>
                                        </SystemSelect>
                                    </Field>

                                    <Field>
                                        <Label>Número</Label>
                                        <Input name="num_cova" value={formCova.num_cova} onChange={handleCovaChange} />
                                    </Field>

                                    <Field>
                                        <Label>Tipo</Label>
                                        <SystemSelect name="tipo_cova" value={formCova.tipo_cova} onChange={handleCovaChange}>
                                            <option value="cova">Cova</option>
                                            <option value="gaveta">Gaveta</option>
                                            <option value="nicho">Nicho</option>
                                        </SystemSelect>
                                    </Field>

                                    <Field>
                                        <Label>Capacidade</Label>
                                        <Input type="number" name="capacidade" value={formCova.capacidade} onChange={handleCovaChange} />
                                    </Field>

                                    {formCova.concessao?.ativa ? (
                                        <>
                                            <Field>
                                                <Label>Responsável</Label>
                                                <Input name="concessao.responsavel" value={formCova.concessao?.responsavel || ""} onChange={handleCovaChange} />
                                            </Field>
                                            <Field>
                                                <Label>Prazo (anos)</Label>
                                                <Input type="number" name="concessao.prazo_anos" value={formCova.concessao?.prazo_anos || 0} onChange={handleCovaChange} />
                                            </Field>
                                            <Field>
                                                <Label>Data Início</Label>
                                                <Input type="date" name="concessao.data_inicio" value={formCova.concessao?.data_inicio || ""} onChange={handleCovaChange} />
                                            </Field>

                                            <Field>
                                                <Label>Data Fim</Label>
                                                <Input type="date" name="concessao.data_fim" value={formCova.concessao?.data_fim || ""} onChange={handleCovaChange} />
                                            </Field>
                                        </>
                                    ) : null}

                                    <StructureGridFull>
                                        <Field>
                                            <Label>Observações</Label>
                                            <Textarea name="obs" value={formCova.obs || ""} onChange={handleCovaChange}></Textarea>
                                        </Field>
                                    </StructureGridFull>
                                </StructureTripleGrid>
                                <ModalActions>
                                    <SystemButton type="button" tone="cancel" onClick={closeStructureDrawer}>Cancelar</SystemButton>
                                    <SystemButton type="submit">Criar sepultura</SystemButton>
                                </ModalActions>
                            </form>
                        ) : null}
                    </SectionCard>
                </DrawerComponent>

                {modalOpen && selectedCova && (
                    <DrawerComponent
                        open={modalOpen && selectedCova}
                        title={`Sepultura ${numeroForModal}`}
                        subtitle={quadraSelecionada.nome || "Quadra selecionada"}
                        width="440px"
                        zIndex={1200}
                        overlay="rgba(12, 16, 36, 0.28)"
                        panelShadow="-18px 0 42px rgba(0, 0, 0, 0.18)"
                        headerPlain
                        bodyPadding="16px 18px 22px"
                        bodyDisplay="block"
                        onClose={closeCovaDrawer}
                        closeButton={<SystemButton type="button" tone="cancel" onClick={closeCovaDrawer}>Fechar</SystemButton>}
                    >
                        <SectionCard>
                            <SectionHeader>
                                <div>
                                    <SectionTitle>Dados da sepultura</SectionTitle>
                                    <SectionHint>Resumo operacional da sepultura selecionada.</SectionHint>
                                </div>
                            </SectionHeader>

                            <InfoGrid>
                                <InfoTile>
                                    <InfoLabel>Nº da sepultura</InfoLabel>
                                    <InfoValue>{numeroForModal}</InfoValue>
                                </InfoTile>
                                <InfoTile>
                                    <InfoLabel>Status</InfoLabel>
                                    <InfoValue>{selectedCova.status ?? (isOccupiedForModal ? "ocupada" : "-")}</InfoValue>
                                </InfoTile>
                                <InfoTile>
                                    <InfoLabel>Tipo</InfoLabel>
                                    <InfoValue>{tipoForModal}</InfoValue>
                                </InfoTile>
                                <InfoTile>
                                    <InfoLabel>Espaços disponíveis</InfoLabel>
                                    <InfoValue>{capacidadeForModal}</InfoValue>
                                </InfoTile>
                                <InfoTile>
                                    <InfoLabel>Bloqueio legal</InfoLabel>
                                    <InfoValue>{bloqueadoForModal ? "Sim" : "Não"}</InfoValue>
                                </InfoTile>
                                <InfoTile>
                                    <InfoLabel>Observações</InfoLabel>
                                    <InfoValue>{observacoesForModal}</InfoValue>
                                </InfoTile>
                            </InfoGrid>

                            <ToggleStatusRow>
                                <ToggleStatusText>
                                    {String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"
                                        ? "Indisponível (manutenção)"
                                        : "Disponível para uso"}
                                </ToggleStatusText>

                                <ToggleStatusLabel
                                    type="button"
                                    onClick={handleToggleStatus}
                                    disabled={!selectedGraveForModal?.id || statusToggleBlocked}
                                    $active={String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"}
                                    aria-label="Alternar status da sepultura"
                                    aria-pressed={String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"}
                                    title={statusToggleTitle}
                                />
                            </ToggleStatusRow>
                            {statusToggleBlocked ? (
                                <SectionHint>Há {selectedCovaSepultadosCount} falecido(s) sepultado(s). A indisponibilidade só pode ser alterada quando a sepultura estiver vazia.</SectionHint>
                            ) : null}
                        </SectionCard>
                        {hasContratoForModal ? (
                            <SectionCard style={{border: "1px solid #d2b24a"}}>
                                <SectionHeader>
                                    <div>
                                        <SectionTitle>Contrato / título de posse</SectionTitle>
                                        <SectionHint>Dados vinculados à sepultura particular ou reservada.</SectionHint>
                                    </div>
                                </SectionHeader>

                                <InfoGrid >
                                    <InfoTile style={{border: "1px solid #d2b24a"}}>
                                        <InfoLabel>Nº do título</InfoLabel>
                                        <InfoValue>{contratoForModal.numero_titulo || "-"}</InfoValue>
                                    </InfoTile>
                                    <InfoTile style={{border: "1px solid #d2b24a"}}>
                                        <InfoLabel>Titular</InfoLabel>
                                        <InfoValue>{contratoForModal.nome_titular || "-"}</InfoValue>
                                    </InfoTile>
                                    <InfoTile style={{border: "1px solid #d2b24a"}}>
                                        <InfoLabel>Contato responsável</InfoLabel>
                                        <InfoValue>{contratoForModal.contato_responsavel || "-"}</InfoValue>
                                    </InfoTile>
                                    <InfoTile style={{border: "1px solid #d2b24a"}}>
                                        <InfoLabel>Visualizar título de posse</InfoLabel>
                                        <SepulturaPreviewButton
                                            type="button"
                                            onClick={openContratoForModal}
                                            sx={{ mt: 2 }}
                                            disabled={!contratoForModal.numero_titulo}
                                        >
                                            <FaFileContract />
                                        </SepulturaPreviewButton>
                                    </InfoTile>
                                </InfoGrid>


                            </SectionCard>
                        ) : null}
                        <SectionCard>
                            <SectionHeader>
                                <div>
                                    <SectionTitle>Sepultamentos e pets</SectionTitle>
                                    <SectionHint>Registros vinculados a esta sepultura.</SectionHint>
                                </div>
                            </SectionHeader>

                            <CovaPetsSection
                                selectedCova={selectedCova}
                                sepultamentos={modalSepList}
                                petsAll={petsAll}
                                onPetCreated={(createdPet) => {
                                    setPetsAll((prev) => {
                                        const id = createdPet?.id;
                                        if (id == null) return [...prev, createdPet];
                                        const idx = prev.findIndex((p) => String(p.id) === String(id));
                                        if (idx >= 0) {
                                            const clone = [...prev];
                                            clone[idx] = createdPet;
                                            return clone;
                                        }
                                        return [...prev, createdPet];
                                    });
                                }}
                                onPetDeleted={(petId) => {
                                    setPetsAll((prev) => prev.filter((p) => String(p.id) !== String(petId)));
                                }}
                            >

                                {(modalSepList && modalSepList.length > 0) ? (
                                    <>
                                        <SepDivider />
                                        <SepList>
                                            {modalSepList.map((s, idx) => {
                                                const expanded = modalExpandedIndex === idx;
                                                return (
                                                    <div key={s.id ?? idx}>
                                                        <SepItemRow>
                                                            <SepItemButton
                                                                type="button"
                                                                onClick={() => {
                                                                    setModalExpandedIndex(expanded ? null : idx);
                                                                    if (!expanded) {
                                                                        (async () => {
                                                                            const falId = s?.falecido ?? s?.falecido_id ?? s?.falecidoId;
                                                                            let fall = null;
                                                                            if (falId) {
                                                                                try {
                                                                                    const rf = await api.get(`/falecidos/${falId}`);
                                                                                    fall = rf.data;
                                                                                } catch (e) {
                                                                                    console.error("Erro ", e)
                                                                                }
                                                                            }
                                                                            setModalForm({ ...s, falecido: fall || null });
                                                                        })();
                                                                    }
                                                                }}
                                                            >
                                                                <SepItemContent>
                                                                    <SepItemName>{s.nome_sep || s.falecido || "-"}</SepItemName>

                                                                </SepItemContent>
                                                            </SepItemButton>

                                                            <SepToggle
                                                                aria-expanded={expanded}
                                                                onClick={() => {
                                                                    const willExpand = !expanded;
                                                                    setModalExpandedIndex(willExpand ? idx : null);
                                                                    if (willExpand) {
                                                                        (async () => {
                                                                            const falId = s?.falecido ?? s?.falecido_id ?? s?.falecidoId;
                                                                            let fall = null;
                                                                            if (falId) {
                                                                                try {
                                                                                    const rf = await api.get(`/falecidos/${falId}`);
                                                                                    fall = rf.data;
                                                                                } catch (e) {
                                                                                    console.error("Erro ", e)
                                                                                }
                                                                            }
                                                                            setModalForm({ ...s, falecido: fall || null });
                                                                        })();
                                                                    }
                                                                }}
                                                            >
                                                                {expanded ? "▾" : "▸"}
                                                            </SepToggle>
                                                        </SepItemRow>

                                                        {expanded && modalForm && modalForm.id === (s.id ?? modalForm.id) ? (
                                                            <SepDetailPanel>
                                                                <InfoGrid>
                                                                    <InfoTile>
                                                                        <InfoLabel>Nome do sepultado</InfoLabel>
                                                                        <InfoValue>{modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "-"}</InfoValue>
                                                                    </InfoTile>
                                                                    <InfoTile>
                                                                        <InfoLabel>Sepultamento</InfoLabel>
                                                                        <InfoValue>{modalForm.dh_sep || modalForm.data_hora || modalForm.data_obito_sep || "-"}</InfoValue>
                                                                    </InfoTile>
                                                                    <InfoTile>
                                                                        <InfoLabel>Data do óbito</InfoLabel>
                                                                        <InfoValue>{modalForm.data_obito || modalForm.data_obito_sep || "-"}</InfoValue>
                                                                    </InfoTile>
                                                                    <InfoTile>
                                                                        <InfoLabel>Responsável</InfoLabel>
                                                                        <InfoValue>{modalForm.nome_resp || modalForm.falecido?.nome_resp || "-"}</InfoValue>
                                                                    </InfoTile>
                                                                    <InfoTile>
                                                                        <InfoLabel>Contato</InfoLabel>
                                                                        <InfoValue>{modalForm.tel_resp || modalForm.falecido?.tel_resp || "-"}</InfoValue>
                                                                    </InfoTile>
                                                                </InfoGrid>
                                                                {exumacoesPending[String(s.id)] ? (
                                                                    <SystemButton type="button" tone="delete" onClick={() => cancelExumacao(s)}>Cancelar exumação</SystemButton>
                                                                ) : (
                                                                    <SystemButton style={{ marginTop: "15px" }} type="button" onClick={() => openExumacaoForm(s)}>Iniciar exumação</SystemButton>
                                                                )}
                                                            </SepDetailPanel>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </SepList>
                                    </>
                                ) : (
                                    sepDataForModal ? (
                                        <InfoGrid>
                                            <InfoTile>
                                                <InfoLabel>Nome do sepultado</InfoLabel>
                                                <InfoValue>{sepDataForModal.nome_sep || sepDataForModal.falecido?.nome_fal || sepDataForModal.falecido?.nome || "-"}</InfoValue>
                                            </InfoTile>
                                            <InfoTile>
                                                <InfoLabel>Sepultamento</InfoLabel>
                                                <InfoValue>{sepDataForModal.dh_sep || sepDataForModal.data_hora || sepDataForModal.data_obito_sep || "-"}</InfoValue>
                                            </InfoTile>
                                            <InfoTile>
                                                <InfoLabel>Data do óbito</InfoLabel>
                                                <InfoValue>{sepDataForModal.data_obito || sepDataForModal.data_obito_sep || "-"}</InfoValue>
                                            </InfoTile>
                                        </InfoGrid>
                                    ) : null

                                )}
                            </CovaPetsSection>
                        </SectionCard>
                        <SectionCard>
                            <SectionHeader>
                                <div>
                                    <SectionTitle>Timeline da sepultura</SectionTitle>
                                    <SectionHint>Histórico de eventos vinculados à sepultura selecionada.</SectionHint>
                                </div>
                            </SectionHeader>
                            <EventTimeline
                                items={covaTimelineItems}
                                emptyText="Nenhum evento vinculado a esta sepultura."
                            />
                        </SectionCard>
                    </DrawerComponent>
                )}

                {exumacoesModalIsOpen && exumacoesForm && (
                    <DrawerComponent
                        open={exumacoesModalIsOpen && exumacoesForm}
                        title="Iniciar exumação"
                        subtitle={`Quadra ${exumacoesForm.quadra_sep || "-"} · Sepultura ${exumacoesForm.num_sepultura_sep || "-"}`}
                        width="520px"
                        zIndex={1300}
                        overlay="rgba(12, 16, 36, 0.28)"
                        panelShadow="-18px 0 42px rgba(0, 0, 0, 0.18)"
                        headerPlain
                        bodyAs="form"
                        bodyProps={{ onSubmit: submitExumacao }}
                        bodyPadding="16px 18px 22px"
                        bodyDisplay="block"
                        onClose={closeExumacaoForm}
                        closeOnOverlayClick={false}
                        closeButton={
                            <SystemButton type="button" tone="cancel" onClick={closeExumacaoForm} disabled={isSubmittingExumacao}>
                                Fechar
                            </SystemButton>
                        }
                    >
                        <SectionCard>
                            <SectionHeader>
                                <div>
                                    <SectionTitle>Dados da exumação</SectionTitle>
                                    <SectionHint>Preencha as informações para registrar a movimentação.</SectionHint>
                                </div>
                            </SectionHeader>
                            <ModalGrid>
                                <div>
                                    <Label>Quadra</Label>
                                    <Input readOnly value={exumacoesForm.quadra_sep || ""} />
                                </div>

                                <div>
                                    <Label>Sepultura</Label>
                                    <Input readOnly value={exumacoesForm.num_sepultura_sep || ""} />
                                </div>

                                <ModalGridFull>
                                    <Label>Nome do sepultado</Label>
                                    <Input readOnly value={exumacoesForm.nome_sep || ""} />
                                </ModalGridFull>

                                <div>
                                    <Label>Data e hora</Label>
                                    <Input type="datetime-local" value={exumacoesForm.dh_exu || ""} onChange={(ev) => handleExumacaoField("dh_exu", ev.target.value)} />
                                </div>

                                <div>
                                    <Label>Motivo</Label>
                                    <Input
                                        value={exumacoesForm.motivo || ""}
                                        onChange={(ev) => handleExumacaoField("motivo", ev.target.value)}
                                        $invalid={!!exumacoesErrors.motivo}
                                        aria-invalid={!!exumacoesErrors.motivo}
                                    />
                                    {exumacoesErrors.motivo && <FieldErrorText>{exumacoesErrors.motivo}</FieldErrorText>}
                                </div>

                                <div>
                                    <Label>Destino</Label>
                                    <SystemSelect
                                        value={exumacoesForm.destino || ""}
                                        onChange={(ev) => handleExumacaoField("destino", ev.target.value)}
                                        invalid={!!exumacoesErrors.destino}
                                        aria-invalid={!!exumacoesErrors.destino}
                                    >
                                        <option value="">Selecione o ossário</option>
                                        {ossariosAll.map((ossario) => (
                                            <option key={String(ossario.id)} value={String(ossario.numero ?? ossario.id ?? "")}>{`Ossário ${ossario.numero ?? ossario.id} - ${String(ossario.tipo || "-").replace(/_/g, " ")} - ${String(ossario.status || "-")}`}</option>
                                        ))}
                                    </SystemSelect>
                                    {exumacoesErrors.destino && <FieldErrorText>{exumacoesErrors.destino}</FieldErrorText>}
                                </div>

                                <div>
                                    <Label>Coveiro</Label>
                                    <Input
                                        value={exumacoesForm.coveiro || ""}
                                        onChange={(ev) => handleExumacaoField("coveiro", ev.target.value)}
                                        $invalid={!!exumacoesErrors.coveiro}
                                        aria-invalid={!!exumacoesErrors.coveiro}
                                    />
                                    {exumacoesErrors.coveiro && <FieldErrorText>{exumacoesErrors.coveiro}</FieldErrorText>}
                                </div>

                                <ModalGridFull>
                                    <Label>Observações</Label>
                                    <Textarea value={exumacoesForm.obs_exu || ""} onChange={(ev) => handleExumacaoField("obs_exu", ev.target.value)} />
                                </ModalGridFull>
                            </ModalGrid>
                        </SectionCard>

                        <ModalActions>
                            <SystemButton type="button" tone="cancel" onClick={closeExumacaoForm} disabled={isSubmittingExumacao}>Voltar</SystemButton>
                            <SystemButton type="submit" disabled={isSubmittingExumacao}>
                                {isSubmittingExumacao ? "Enviando..." : "Registrar exumação"}
                            </SystemButton>
                        </ModalActions>
                    </DrawerComponent>
                )}

            </Container >

        </>
    )
}





