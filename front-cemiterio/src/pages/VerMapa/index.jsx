import React, { useEffect, useState, useCallback, useRef } from "react";
import { useBlocks } from "../../hooks/Blocks/useBlocks";
import { useCreateBlocks } from "../../hooks/Blocks/useCreateBlocks.js";
import { useCreateGraves } from "../../hooks/Graves/useCreateGraves";
import { useCreateCemetery } from "../../hooks/Cemetery/useCreateCemetery.js";
import { useCemeteryStore } from "../../stores/cemeteryStore.js";
import { useToastFeedback } from "../../hooks/ToastFeedback/useToastFeedback.jsx"
import api from "../../services/index.js";
import { patchGraveStatus } from "../../services/graveService";
import LoadingOverlay from "../../components/LoadingOverlay";
import GridQuadras from "../../components/GridQuadras";
import PieChartSepulturas from "../../components/PieChartSepulturas";
import CovaPetsSection from "../../components/CovaPetsSection";
import { GiCoffin } from "react-icons/gi";
import { FaChartPie } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { MdPets } from "react-icons/md";
import { PiFlowerTulipLight, PiFlowerTulipBold } from "react-icons/pi";
import { formatDateTimeKey } from "../../utils/date";
import {
    BtnAction,
    QuadraDropdown,
    QuadraDropdownWrapper,
    QuadraSelectButton,
    Container,
    CovaGrid,
    CovaItem,
    QuadraTitle,
    QuadraWrapper,
    QuadraInfo,
    InfoPill,
    Title,
    LegendItem,
    LegendButton,
    LegendRow,
    ActiveFilterPill,
    EmptyMapState,
    SmallSelect,
    BtnAdd,
    BtnActionCancel,
    BtnClose,
    BtnPrimaryClose,
    Input,
    Label,
    ModalOverlay,
    FormGrid,
    Textarea,
    Field,
    FormStyled,
    ColumnLeft,
    ColumnRight,
    ButtonsRow,
    TwoCols,
    ModalButtonsRow,
    DrawerOverlay,
    CovaDrawer,
    DrawerHeader,
    DrawerTitle,
    DrawerCloseButton,
    DrawerBody,
    DrawerSection,
    DrawerSectionTitle,
    SepDivider,
    SepHeader,
    SepItemButton,
    SepItemContent,
    SepDetailPanel,
    SepDetailText,
    SepItemName,
    SepList,
    SepItemRow,
    SepToggle,
    MapToolbar,
    ToolbarLabel,
    DropdownIcon,
    LegendActions,
    CemeteryForm,
    CompactField,
    InlineCheckLabel,
    CompactButton,
    CompactCancelButton,
    ModalSurface,
    ModalTitle,
    ModalActions,
    ModalGrid,
    ModalGridFull,
    SelectMedium,
    SelectSmall,
    InputTiny,
    InputMedium,
    ToggleStatusLabel,
    BtnDanger,
    ChartModalContent,
    ChartModalHeader,
    ChartModalTitle,
    ChartModalBody,
    ChartArea,
    ChartLegend,
    ToggleStatusRow,
    ToggleStatusText
} from "./styles";

import * as mapHelpers from "../../utils/mapHelpers";

export default function VerMapa() {
    const { selectedCemeteryId, loadCemeteries, setSelectedCemeteryId } = useCemeteryStore();

    const FIXED_CEMETERY_ID = 1;

    const {
        blocks,
        loadBlocks,
        setBlocks
    } = useBlocks();

    const {
        showSuccess,
        showError,
        ToastElement,
    } = useToastFeedback();

    const { handleCreateBlock, loading: creatingBlock } = useCreateBlocks({
        onSuccess: async (created) => {
            setBlocks((prev) => {
                if (!Array.isArray(prev)) return [created];
                const exists = prev.some((b) => String(b.id) === String(created.id));
                return exists ? prev : [...prev, created];
            })
            setSelectedQuadraId(created.id);
            setModalAddQuadraOpen(false);
            showSuccess("Quadra criada")
        }
    });

    const { handleCreateGrave, loading: creatingGrave } = useCreateGraves();

    const { handleCreateCemetery, loading: creatingCemetery } = useCreateCemetery();

    const [formCemetery, setFormCemetery] = useState({
        name: "",
        foundation: "",
        active: true,
    })

    const [formQuadra, setFormQuadra] = useState({
        num_quadra: "",
        descricao: "",
    });

    const [covasData, setCovasData] = useState([]);
    const [petsAll, setPetsAll] = useState([]);
    const [isMapLoading, setIsMapLoading] = useState(true);
    const [sepultamentosAll, setSepultamentosAll] = useState([]);
    const [selectedQuadraId, setSelectedQuadraId] = useState(null);

    const visibleBlocks = mapHelpers.getVisibleBlocks(blocks, selectedCemeteryId);

    const quadras = mapHelpers.buildQuadrasFromData(visibleBlocks, covasData, sepultamentosAll);

    const [isQuadraDropdownOpen, setIsQuadraDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isPieChartOpen, setIsPieChartOpen] = useState(false);
    const [sepCountsByQuadra, setSepCountsByQuadra] = useState({});
    const [modalSepList, setModalSepList] = useState([]);
    const [modalExpandedIndex, setModalExpandedIndex] = useState(null);
    const [exumacoesPending, setExumacoesPending] = useState({});
    const [exumacoesModalIsOpen, setExumacoesModalIsOpen] = useState(false);
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
    const [modalAddQuadraOpen, setModalAddQuadraOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null);

    const [modalAddCovaOpen, setModalAddCovaOpen] = useState(false);
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
            setSelectedQuadraId(null);
            return;
        }

        const selectedExists = visibleBlocks.some((block) => String(block.id) === String(selectedQuadraId));
        if (!selectedExists) {
            setSelectedQuadraId(visibleBlocks[0].id);
        }
    }, [visibleBlocks, selectedQuadraId]);

    const location = useLocation();


    const handleAddQuadra = () => {
        setFormQuadra({
            num_quadra: "",
            descricao: "",
        });
        setModalAddQuadraOpen(true)
    };

    const openExumacaoForm = (sep) => {
        if (!sep) return;
        const key = String(sep.id);
        if (exumacoesPending[key]) {
            showError("Já existe uma exumação para esse registro");
        }

        const sepQuadraKey = sep.quadra_sep ?? sep.quadra ?? (selectedCova?.cova?.quadra_cova ?? selectedCova?.quadra_cova) ?? selectedQuadraId ?? "";

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
            num_sepultura_sep: sep.num_sepultura_sep,
            dh_exu: formatDateTimeKey(new Date()),
            motivo: "",
            destino: "",
            coveiro: "",
            obs_exu: "",
            status: "pendente",
            confirmacao: false,
            origem: "frontend"
        })
        setExumacoesModalIsOpen(true);
    }


    const handleExumacaoField = (name, value) => {
        setExumacoesForm(prev => ({ ...prev, [name]: value }));
    }

    const submitExumacao = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!exumacoesForm || !exumacoesForm.sepultamentoId) return showError("Dados inválidos");

        const key = String(exumacoesForm.sepultamentoId)
        if (exumacoesPending[key]) return showError("Já existe uma exumação pendente para este registro.");

        try {
            const payload = { ...exumacoesForm, status: "pendente", confirmado: false };
            const res = await api.post("/exumacoes", payload);
            const created = res?.data ?? null;
            if (!created) throw new Error("Resposta inválida do servidot ao criar exumação");


            setExumacoesPending(prev => ({ ...prev, [key]: created }));

            try {
                window.dispatchEvent(new CustomEvent("processoCriado", { detail: created }));
            }
            catch (evErr) {
                console.warn("Erro ao dispatch processoCriado", evErr);
            };

            setExumacoesModalIsOpen(false);
            showSuccess("Exumação cadastrada e aguardando confirmação. ");
        } catch (err) {
            console.error("Erro ao enviar exumação", err);
            showError("Erro ao cadastrar exumação" + (err?.message || ""));
        }
    }


    const cancelExumacao = async (sep) => {
        if (!sep || !sep.id) return showError("Sepultamento inválido");
        const key = String(sep.id);
        const ex = exumacoesPending[key];
        if (!ex || !ex.id) {
            return showError("Nenhuma exumação pendente para este registro");
        }
        if (!confirm(`Cancelar exumação pendente para ${sep.nome_sep || "este registro"}?`)) return;
        try {
            await api.delete(`/exumacoes/${ex.id}`);
            setExumacoesPending(prev => {
                const clone = { ...prev };
                delete clone[key];
                return clone;
            });
            try { window.dispatchEvent(new CustomEvent("processoCancelado", { detail: ex })); } catch (e) { e };
            showError("Exumação cancelada. ");
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
        setModalAddCovaOpen(true)
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

    const handleGridChange = (item) => {
        const newId = item?.id ?? null;
        setSelectedQuadraId(prev => {
            if (prev === newId) return prev;
            return newId;
        })
    }

    const handleCovaChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;
        updateFieldByName(name, incoming);
    };

    const handleCemeteryChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;
        setFormCemetery((prev) => ({ ...prev, [name]: incoming }));
    };

    const handleCreateCemeterySubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        const name = String(formCemetery.name || "").trim();
        const foundation = String(formCemetery.foundation || "").trim();
        const active = Boolean(formCemetery.active);

        if (!name) {
            showError("Informe o nome do cemitério.");
            return;
        }

        if (!foundation) {
            showError("Informe a data de fundação.");
            return;
        }

        try {
            const created = await handleCreateCemetery({ name, foundation, active });
            if (created?.id != null) {
                setSelectedCemeteryId(created.id);
            }
            await loadCemeteries().catch(() => { });
            showSuccess("Cemitério criado com sucesso.");
            setFormCemetery({
                name: "",
                foundation: "",
                active: true,
            });
        } catch (err) {
            showError(err?.message || "Erro ao criar cemitério.");
        }
    };

    const handleCreateQuadra = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        const cemeteryId = Number(selectedCemeteryId);
        if (!Number.isInteger(cemeteryId) || cemeteryId <= 0) {
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

        try {
            const currentStatus = String(grave?.status || "").toUpperCase();
            const nextStatus = currentStatus === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";

            await patchGraveStatus(grave.id, nextStatus);

            // Atualizar covasData
            setCovasData((prev) =>
                prev.map((item) =>
                    String(item?.grave?.id) !== String(grave.id)
                        ? item
                        : {
                            ...item,
                            grave: { ...item.grave, status: nextStatus },
                            status: item.blocked ? "indisponivel" : nextStatus === "OCCUPIED" ? "ocupada" : "livre",
                        }
                )
            );

            // Atualizar selectedCova
            setSelectedCova((prev) => {
                if (!prev) return prev;
                const prevGrave = prev?.cova?.grave ?? prev?.grave ?? null;
                if (!prevGrave || String(prevGrave.id) !== String(grave.id)) return prev;

                if (prev?.cova) {
                    return {
                        ...prev,
                        cova: {
                            ...prev.cova,
                            grave: { ...prev.cova.grave, status: nextStatus },
                        },
                        status: prev.blocked ? "indisponivel" : nextStatus === "OCCUPIED" ? "ocupada" : "livre",
                    };
                }

                return {
                    ...prev,
                    grave: { ...prev.grave, status: nextStatus },
                    status: prev.blocked ? "indisponivel" : nextStatus === "OCCUPIED" ? "ocupada" : "livre",
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

        const parsedBlockId = Number(quadra);
        if (!Number.isInteger(parsedBlockId) || parsedBlockId <= 0) {
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

            setModalAddCovaOpen(false);
            await loadMapData();
            showSuccess("Sepultura criada");
        } catch (err) {
            console.error("Erro ao criar sepultura", err);
            showError(err.message || "Erro ao criar sepultura")
        }
    }

    const handleCloseAddCovaModal = () => {
        setModalAddCovaOpen(false);
    };

    const handleCloseAddQuadraModal = () => {
        setModalAddQuadraOpen(false);
    }

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
                quadra_cova: String(Number(mapHelpers.resolveBlockId(grave?.blockId ?? grave?.block)) || 0),
                num_cova: grave?.number ?? "",
                tipo_cova: String(grave?.graveType || "").toUpperCase() === "MAUSOLEUM" ? "gaveta" : "cova",
                capacidade: grave?.bodyCapacity === null || grave?.bodyCapacity === undefined ? "" : Number(grave.bodyCapacity),
                status: grave?.blocked ? "indisponivel" : String(grave?.status || "").toUpperCase() === "OCCUPIED" ? "ocupada" : "livre",
                active: grave?.active,
                blocked: grave?.blocked,
                reason: grave?.reason ?? "",
                grave,
            }));

            setCovasData(normalizedCovasData);

            const [rSep, rExu, rPets] = await Promise.allSettled([
                api.get("/sepultamentos"),
                api.get("/exumacoes"),
                api.get("/pets"),
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

            setSepultamentosAll(sepData);
            setPetsAll(petsData);

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

                    const qid = Number(sep.quadra_sep ?? sep.quadra);
                    if (!Number.isNaN(qid)) setSelectedQuadraId(qid);

                    setSelectedCova({
                        id: sep.id,
                        numero: sep.num_sepultura_sep || sep.num_sepultura || sep.numero || "",
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
            if (String(detail.type).toLowerCase().includes("exum")) {
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
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);


    const quadraSelecionada = quadras.find(q => String(q.id) === String(selectedQuadraId)) || { covas: [] };

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
        const quadraKey = String(selectedQuadraId ?? cova.cova?.quadra_cova ?? cova.quadra_cova ?? cova.quadra_sep ?? cova.sep?.quadra_sep ?? "");
        const numero = String(cova.numero ?? cova.num_cova ?? cova.num_sepultura_sep ?? "");
        const list = (sepultamentosAll || []).filter(s => {
            if (s.foi_exumado) return false;
            const sQuadra = String(s.quadra_sep ?? s.quadra ?? "");
            const sNum = String(s.num_sepultura_sep ?? s.num_sepultura ?? s.numero ?? "");
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
        { key: "indisponivel", label: "Indisponivel", color: "#c55" },
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
    const numeroForModal =
        sepDataForModal?.num_sepultura_sep ??
        sepDataForModal?.num_sepultura ??
        sepDataForModal?.numero ??
        selectedCova?.numero ??
        selectedCova?.cova?.num_cova ??
        selectedCova?.cova?.grave?.number ??
        "-";    /* const nomeSepForModal = sepDataForModal?.nome_sep ?? sepDataForModal?.falecido?.nome_fal ?? sepDataForModal?.falecido?.nome ?? null; */

    const getPetsCountBySepLocal = (cova, quadraId) => mapHelpers.getPetsCountBySep(cova, quadraId, petsAll);

    /* getCovaDisplayMeta moved to src/utils/mapHelpers.js */
    const covaMeta = (cova) => mapHelpers.getCovaDisplayMeta(cova, quadraSelecionada, sepultamentosAll, petsAll);

    const filteredCovas = (quadraSelecionada.covas || []).filter((cova) => {
        if (!statusFilter) return true;
        return covaMeta(cova).displayStatus === statusFilter;
    });

    const activeStatusLabel = statusList.find((s) => s.key === statusFilter)?.label ?? "";

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
            <Container>
                <Title>CONTROLE DE SEPULTURAS</Title>

                <LoadingOverlay open={isMapLoading} />

                <MapToolbar>
                    <ToolbarLabel>Quadra: </ToolbarLabel>

                    <QuadraDropdownWrapper ref={dropdownRef}>
                        <QuadraSelectButton disabled={isMapLoading} onClick={() => { if (isMapLoading) return; setIsQuadraDropdownOpen(!isQuadraDropdownOpen) }}
                        >
                            {selectedQuadraId ? `Quadra ${quadrasDesc.find(q => String(q.id) === String(selectedQuadraId))?.num_quadra || selectedQuadraId}` : "Selecione uma quadra"}
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
                                onChange={(quadra) => {
                                    handleGridChange(quadra);
                                }}
                                columnsMinWidth={40}
                            />
                        </QuadraDropdown>

                    </QuadraDropdownWrapper>
                </MapToolbar>
                <QuadraWrapper key={quadraSelecionada.id || "preview"}>
                    <QuadraInfo key={String(quadraSelecionada.id)}>
                        <InfoPill>Capacidade máxima de sepulturas: {quadraSelecionada.max_covas > 0 ? quadraSelecionada.max_covas : "-"}</InfoPill>
                        <InfoPill>Número atual de sepulturas: {Array.isArray(quadraSelecionada.covas) ? quadraSelecionada.covas.length : getCovasCount?.(quadraSelecionada.num_quadra ?? quadraSelecionada.id) ?? 0}</InfoPill>
                        <InfoPill>Número atual de sepultados: {getSepultadosCountLocal(quadraSelecionada.id ?? quadraSelecionada.num_quadra ?? selectedQuadraId)}</InfoPill>

                    </QuadraInfo>
                    <QuadraTitle>{quadraSelecionada.nome || "Nenhuma quadra selecionada"}</QuadraTitle>
                    {filteredCovas.length === 0 ? (
                        <EmptyMapState>
                            {statusFilter ? `Nenhuma sepultura encontrada para ${activeStatusLabel}.` : "Nenhuma sepultura cadastrada nesta quadra."}
                        </EmptyMapState>
                    ) : (
                        <CovaGrid>
                            {filteredCovas.map((cova) => {

                                const grave = cova?.cova?.grave ?? cova?.grave ?? {};
                                const backendStatus = String(grave?.status ?? "").toUpperCase();
                                const rawAreaType = grave?.areaType ?? grave?.area_type ?? cova?.areaType ?? cova?.area_type ?? "";
                                const isPerpetual = String(rawAreaType).toUpperCase() === "PERPETUAL";
                                const isBlocked = !!grave?.blocked;

                                const sepCount = getSepultadosCountBySepLocal(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra);
                                const petCount = getPetsCountBySepLocal(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra);

                                const capacidadeTotal = Number(grave?.bodyCapacity ?? cova?.capacidade ?? 0);
                                const occupiedCount =
                                    sepCount > 0
                                        ? sepCount
                                        : backendStatus === "OCCUPIED" && capacidadeTotal > 0
                                            ? capacidadeTotal
                                            : 0;

                                let displayStatus = "disponivel";

                                if (isBlocked) {
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
                                        onClick={() => handleClickCova(cova)}
                                        title={`Sepultura ${cova.numero} - ${displayStatus} (${occupiedCount}/${capacidadeTotal}${petCount > 0 ? ` | 🐾 ${petCount}` : ""})`}
                                    >
                                        <span className="cova-number" aria-hidden="true">{cova.numero}  </span>
                                        <span className="cova-capacity" aria-hidden="true"><PiFlowerTulipBold />{`${occupiedCount}/${capacidadeTotal}`}  </span>
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

                    <BtnAction disabled={isMapLoading} onClick={() => setIsPieChartOpen(true)}>
                        <FaChartPie /> DISTRIBUIÇÃO DE SEPULTURAS
                    </BtnAction>
                </QuadraWrapper>

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

                    <LegendActions>
                        <BtnAction disabled={isMapLoading} onClick={handleAddQuadra}>ADICIONAR QUADRA</BtnAction>
                        <BtnAction disabled={isMapLoading} onClick={handleAddCova}>ADICIONAR SEPULTURA</BtnAction>
                    </LegendActions>

                </LegendRow>

                <CemeteryForm onSubmit={handleCreateCemeterySubmit}>
                    <CompactField $minWidth="220px">
                        <Label>Nome do cemitério</Label>
                        <Input
                            name="name"
                            value={formCemetery.name}
                            onChange={handleCemeteryChange}
                            placeholder="Ex.: Cemitério do Cambiri"
                        />
                    </CompactField>

                    <CompactField $minWidth="180px">
                        <Label>Data de fundação</Label>
                        <Input
                            type="date"
                            name="foundation"
                            value={formCemetery.foundation}
                            onChange={handleCemeteryChange}
                        />
                    </CompactField>

                    <CompactField>
                        <InlineCheckLabel>
                            Ativo?
                            <input
                                type="checkbox"
                                name="active"
                                checked={!!formCemetery.active}
                                onChange={handleCemeteryChange}
                            />
                        </InlineCheckLabel>
                    </CompactField>

                    <CompactButton type="submit" disabled={creatingCemetery}>
                        {creatingCemetery ? "Salvando..." : "Salvar cemitério"}
                    </CompactButton>
                </CemeteryForm>

                {isPieChartOpen && (
                    <ModalOverlay onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsPieChartOpen(false);
                    }}>
                        <ChartModalContent>
                            <ChartModalHeader>
                                <ChartModalTitle>DISTRIBUICAO DAS SEPULTURAS</ChartModalTitle>
                            </ChartModalHeader>
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
                        </ChartModalContent>
                    </ModalOverlay>
                )}


                {modalAddQuadraOpen && (
                    <ModalOverlay
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) handleCloseAddQuadraModal();
                        }}
                    >
                        <ModalSurface as="form" onSubmit={handleCreateQuadra} $width="400px">
                            <ModalTitle>Criar quadra</ModalTitle>

                            <Field>
                                <Label>Nº da quadra:</Label>
                                <Input
                                    name="num_quadra"
                                    value={formQuadra.num_quadra}
                                    onChange={handleQuadraChange}
                                />
                            </Field>

                            <Field>
                                <Label>Descrição:</Label>
                                <Input
                                    name="descricao"
                                    value={formQuadra.descricao || ""}
                                    onChange={handleQuadraChange}
                                />
                            </Field>

                            <ModalActions>
                                <CompactCancelButton
                                    type="button"
                                    onClick={handleCloseAddQuadraModal}
                                >
                                    Cancelar
                                </CompactCancelButton>

                                <CompactButton
                                    type="submit"
                                    disabled={creatingBlock}
                                >
                                    {creatingBlock ? "Criando..." : "Criar"}
                                </CompactButton>
                            </ModalActions>
                        </ModalSurface>
                    </ModalOverlay>
                )}


                {modalAddCovaOpen && (
                    <ModalOverlay onMouseDown={(e) => { if (e.target === e.currentTarget) handleCloseAddCovaModal(); }}>
                        <ModalSurface as="form" onSubmit={handleCreateCova} $width="520px">
                            <ModalTitle>Criar sepultura</ModalTitle>

                            <FormGrid >
                                <ColumnLeft>
                                    <Field>
                                        <Label>Quadra: </Label>
                                        <SelectMedium name="quadra_cova" value={formCova.quadra_cova} onChange={handleCovaChange}>
                                            <option value="">Selecione a quadra</option>
                                            {quadrasDesc.map((q, idx) => {
                                                const used = Array.isArray(q.covas) ? q.covas.length : getCovasCount(q.num_quadra ?? q.id);
                                                const max = Number(q.max_covas || 0);
                                                const full = max > 0 && used >= max;
                                                return (
                                                    <option key={`${String(q.id ?? q.num_sepultura ?? idx)}`} value={String(q.id)} disabled={full}>
                                                        {q.num_quadra ? `Quadra ${q.num_quadra}` : q.nome || `Quadra ${q.id}`} {full ? `(lotada)` : ''}
                                                    </option>
                                                )
                                            })}
                                        </SelectMedium>
                                    </Field>

                                    <Field>
                                        <Label>Status: </Label>
                                        <SelectMedium name="status" value={formCova.status} onChange={handleCovaChange}>
                                            <option value="disponivel">Disponível</option>
                                            <option value="indisponivel">Indisponível</option>
                                        </SelectMedium>
                                    </Field>


                                    <TwoCols>
                                        <Field>
                                            <Label>Número: </Label>
                                            <InputTiny name="num_cova" value={formCova.num_cova} onChange={handleCovaChange} />
                                        </Field>

                                        <Field>
                                            <Label>Tipo: </Label>
                                            <SelectSmall name="tipo_cova" value={formCova.tipo_cova} onChange={handleCovaChange}>
                                                <option value="cova">Cova</option>
                                                <option value="gaveta">Gaveta</option>
                                                <option value="nicho">Nicho</option>
                                            </SelectSmall>
                                        </Field>
                                    </TwoCols>

                                    <Field>
                                        <Label>Capacidade: </Label>
                                        <InputMedium type="number" name="capacidade" value={formCova.capacidade} onChange={handleCovaChange} />
                                    </Field>


                                </ColumnLeft>

                                <ColumnRight>

                                    <Field>
                                        <Label>
                                            Possui título de posse?<input type="checkbox" name="concessao.ativa" checked={!!formCova.concessao?.ativa} onChange={handleCovaChange} />
                                        </Label>
                                    </Field>

                                    {formCova.concessao?.ativa ? (
                                        <>
                                            <Field>
                                                <Label>Responsável: </Label>
                                                <Input name="concessao.responsavel" value={formCova.concessao?.responsavel || ""} onChange={handleCovaChange} />
                                            </Field>
                                            <Field>
                                                <Label>Prazo (anos): </Label>
                                                <Input type="number" name="concessao.prazo_anos" value={formCova.concessao?.prazo_anos || 0} onChange={handleCovaChange} />
                                            </Field>
                                            <Field>
                                                <Label>Data Início: </Label>
                                                <Input type="date" name="concessao.data_inicio" value={formCova.concessao?.data_inicio || ""} onChange={handleCovaChange} />
                                            </Field>

                                            <Field>
                                                <Label>Data Fim: </Label>
                                                <Input type="date" name="concessao.data_fim" value={formCova.concessao?.data_fim || ""} onChange={handleCovaChange} />
                                            </Field>
                                        </>
                                    ) : null}

                                    <Field>
                                        <Label>Observações: </Label>
                                        <Textarea name="obs" value={formCova.obs || ""} onChange={handleCovaChange}></Textarea>
                                    </Field>
                                </ColumnRight>

                            </FormGrid>
                            <ButtonsRow>
                                <CompactCancelButton type="button" onClick={handleCloseAddCovaModal}>Cancelar</CompactCancelButton>
                                <CompactButton type="submit" disabled={creatingGrave}>
                                    {creatingGrave ? "Criando..." : "Criar"}
                                </CompactButton>
                            </ButtonsRow>
                        </ModalSurface>
                    </ModalOverlay>
                )}

                {modalOpen && selectedCova && (
                    <DrawerOverlay onMouseDown={(e) => { if (e.target === e.currentTarget) closeCovaDrawer(); }}>
                        <CovaDrawer>
                            <DrawerHeader>
                                <DrawerTitle>
                                    <strong>Sepultura {numeroForModal}</strong>
                                    <span>{quadraSelecionada.nome || "Quadra selecionada"}</span>
                                </DrawerTitle>
                                <DrawerCloseButton type="button" onClick={closeCovaDrawer}>Fechar</DrawerCloseButton>
                            </DrawerHeader>
                            <DrawerBody>
                                <DrawerSection>
                                    <DrawerSectionTitle>Dados da sepultura</DrawerSectionTitle>
                                    <SepDetailText><strong>Nº da sepultura:</strong> {numeroForModal}</SepDetailText>
                                    <SepDetailText><strong>Status:</strong> {selectedCova.status ?? (isOccupiedForModal ? "ocupada" : "-")}</SepDetailText>
                                    <SepDetailText><strong>Tipo:</strong> {tipoForModal}</SepDetailText>
                                    <SepDetailText><strong>Espaços disponíveis na sepultura:</strong> {capacidadeForModal}</SepDetailText>
                                    <SepDetailText><strong>Bloqueado por questões legais?:</strong> {bloqueadoForModal ? "Sim" : "Não"}</SepDetailText>
                                    <SepDetailText><strong>Observações:</strong> {observacoesForModal}</SepDetailText>
                                    <ToggleStatusRow>
                                        <ToggleStatusText>
                                            {String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"
                                                ? "Indisponível (manutenção)"
                                                : "Disponível para uso"}
                                        </ToggleStatusText>

                                        <ToggleStatusLabel
                                            type="button"
                                            onClick={handleToggleStatus}
                                            disabled={!selectedGraveForModal?.id}
                                            $active={String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"}
                                            aria-label="Alternar status da sepultura"
                                            aria-pressed={String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"}
                                            title={String(selectedGraveForModal?.status || "").toUpperCase() === "MAINTENANCE"
                                                ? "Liberar para uso"
                                                : "Marcar indisponível (manutenção)"}
                                        />
                                    </ToggleStatusRow>
                                </DrawerSection>
                                <DrawerSection>
                                    <DrawerSectionTitle>Sepultamentos e pets</DrawerSectionTitle>

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
                                                                        <SepDetailText><strong>Nome do sepultado: </strong>{modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "-"}</SepDetailText>
                                                                        <SepDetailText><strong>Data e hora do sepultamento: </strong>{modalForm.dh_sep || modalForm.data_hora || modalForm.data_obito_sep || "-"}</SepDetailText>
                                                                        <SepDetailText><strong>Data do óbito: </strong>{modalForm.data_obito || modalForm.data_obito_sep || "-"}</SepDetailText>
                                                                        <SepDetailText><strong>Responsável: </strong>{modalForm.nome_resp || modalForm.falecido?.nome_resp || "-"}</SepDetailText>
                                                                        <SepDetailText><strong>Contato do responsável: </strong>{modalForm.tel_resp || modalForm.falecido?.tel_resp || "-"}</SepDetailText>
                                                                        {exumacoesPending[String(s.id)] ? (
                                                                            <BtnDanger type="button" onClick={() => cancelExumacao(s)}>Cancelar exumação</BtnDanger>
                                                                        ) : (
                                                                            <BtnAdd type="button" onClick={() => { openExumacaoForm(s); closeCovaDrawer(); }}>Iniciar exumação</BtnAdd>
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
                                                <>
                                                    <SepDetailText><strong>Nome do sepultado: </strong> {sepDataForModal.nome_sep || sepDataForModal.falecido?.nome_fal || sepDataForModal.falecido?.nome || "-"}</SepDetailText>
                                                    <SepDetailText><strong>Data e hora do sepultamento: </strong> {sepDataForModal.dh_sep || sepDataForModal.data_hora || sepDataForModal.data_obito_sep || "-"}</SepDetailText>
                                                    <SepDetailText><strong>Data do óbito: </strong> {sepDataForModal.data_obito || sepDataForModal.data_obito_sep || "-"}</SepDetailText>
                                                </>
                                            ) : null

                                        )}
                                    </CovaPetsSection>
                                </DrawerSection>
                            </DrawerBody>
                        </CovaDrawer>
                    </DrawerOverlay>
                )}

                {exumacoesModalIsOpen && exumacoesForm && (
                    <ModalOverlay>
                        <ModalSurface as="form" onSubmit={submitExumacao} $width="520px">
                            <ModalTitle>Iniciar exumacao</ModalTitle>
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
                                    <Input value={exumacoesForm.motivo || ""} onChange={(ev) => handleExumacaoField("motivo", ev.target.value)} />
                                </div>

                                <div>
                                    <Label>Destino</Label>
                                    <Input value={exumacoesForm.destino || ""} onChange={(ev) => handleExumacaoField("destino", ev.target.value)} />
                                </div>

                                <div>
                                    <Label>Coveiro</Label>
                                    <Input value={exumacoesForm.coveiro || ""} onChange={(ev) => handleExumacaoField("coveiro", ev.target.value)} />
                                </div>

                                <div>
                                    <Label>Observações</Label>
                                    <Textarea value={exumacoesForm.obs_exu || ""} onChange={(ev) => handleExumacaoField("obs_exu", ev.target.value)} />
                                </div>
                            </ModalGrid>


                            <ModalActions>
                                <BtnClose type="button" onClick={() => setExumacoesModalIsOpen(false)}>Cancelar</BtnClose>
                                <BtnAdd type="submit">Confirmar</BtnAdd>
                            </ModalActions>

                        </ModalSurface>
                    </ModalOverlay>


                )}

            </Container >

        </>
    )
}




