import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useBlocks } from "../../hooks/useBlocks";
import { useCreateBlocks } from "../../hooks/useCreateBlocks";
import api from "../../services/api";
import GridQuadras from "../../components/GridQuadras";
import PieChartSepulturas from "../../components/PieChartSepulturas";
import CovaPetsSection from "../../components/CovaPetsSection";
import { GiCoffin } from "react-icons/gi";
import { FaChartPie } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import { useLocation } from "react-router-dom";
import { MdPets } from "react-icons/md";
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
    LegendRow,
    SmallSelect,
    BtnAdd,
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
    ModalContent,
    ModalButtonsRow,
    SepDivider,
    SepHeader,
    SepItemButton,
    SepItemName,
    SepList,
    SepItemRow,
    SepToggle,
} from "./styles";

const normalizeStatus = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "livre";
    if (raw.includes("reserv") || raw.includes("particular")) return "reservada";
    if (raw.includes("ocup")) return "ocupada";
    if (raw.includes("indispon")) return "indisponivel";
    if (raw.includes("livre")) return "livre";
    return raw;
};


export default function VerMapa() {

    const FIXED_CEMETERY_ID = 1;

    const {
        blocks,
        loadBlocks,
        setBlocks
    } = useBlocks();

    const { handleCreateBlock, loading: creatingBlock } = useCreateBlocks({
        existingBlocks: blocks,
        onSuccess: async (created) => {
            setBlocks((prev) => {
                if (!Array.isArray(prev)) return [created];
                const exists = prev.some((b) => String(b.id) === String(created.id));
                return exists ? prev : [...prev, created];
            })
            setSelectedQuadraId(created.id);
            setModalAddQuadraOpen(false);
            alert("Quadra criada");
        }
    });

    const [formQuadra, setFormQuadra] = useState({
        num_quadra: "",
        descricao: "",
    });

    const [covasData, setCovasData] = useState([]);
    const [petsAll, setPetsAll] = useState([]);
    const [sepultamentosAll, setSepultamentosAll] = useState([]);
    const [selectedQuadraId, setSelectedQuadraId] = useState(null);

    const quadras = useMemo(() => {
        const normalizeCovaStatus = (s) => {
            if (!s) return "livre";
            const raw = String(s).toLowerCase();
            if (raw.includes("reserv")) return "reservada";
            if (raw.includes("indispon")) return "indisponivel";
            if (raw.includes("ocup")) return "ocupada";
            if (raw === "livre" || raw === "disponivel" || raw === "disponivel") return "livre";
            return raw;
        };

        const visibleSepData = (sepultamentosAll || []).filter((s) => !s.foi_exumado);

        const quadraMap = new Map();

        (blocks || []).forEach((block) => {
            quadraMap.set(String(block.id), {
                id: block.id,
                num_quadra: String(block.number),
                nome: `Quadra ${block.number}`,
                descricao: block.description || "",
                cemeteryId: block.cemeteryId,
                max_covas: 0,
                covas: []
            });
        });

        (covasData || []).forEach((cova) => {
            const qKey = String(cova.quadra_cova ?? cova.quadra ?? "0");

            if (!quadraMap.has(qKey)) {
                quadraMap.set(qKey, {
                    id: qKey,
                    num_quadra: String(qKey),
                    nome: `Quadra ${qKey}`,
                    max_covas: 0,
                    descricao: "",
                    covas: [],
                })
            }

            const quadraObj = quadraMap.get(qKey);
            const numero = cova.num_cova ?? cova.num_sepultura ?? cova.numero ?? "";
            const cap = cova.capacidade === "" || cova.capacidade === null ? null : Number(cova.capacidade);

            const normalizedStatus = cap !== null && !Number.isNaN(cap) && cap <= 0 ? "lotada" : normalizeCovaStatus(cova.status);

            quadraObj.covas.push({
                id: cova.id ?? `${qKey}-${numero}`,
                numero,
                status: normalizedStatus,
                capacidade: cap,
                cova,
            });
        });

        visibleSepData.forEach((sep) => {
            const qKey = String(sep.quadra_sep ?? sep.quadra ?? "0");
            if (!quadraMap.has(qKey)) {
                quadraMap.set(qKey, {
                    id: qKey,
                    num_quadra: String(qKey),
                    nome: `Quadra ${qKey}`,
                    max_covas: 0,
                    descricao: "",
                    covas: [],
                })
            }

            const quadraObj = quadraMap.get(qKey);
            const numero = sep.num_sepultura_sep || sep.num_sepultura || sep.numero || "";
            const titulo_posse = String(sep.titulo_posse ?? "").toLowerCase() === "sim";
            const confirmed = sep.confirmado === true || String(sep.confirmado).toLowerCase() === "true";
            const sepIsConcluded = confirmed || String(sep.status ?? "").toLowerCase().includes("concl");

            const existing = quadraObj.covas.find((c) => String(c.numero) === String(numero));

            if (existing) {
                if (sepIsConcluded) {
                    existing.status = "ocupada";
                    existing.sep = sep;
                } else if (titulo_posse && existing.status !== "ocupada") {
                    existing.status = "reservada";
                    existing.sep = existing.sep || sep;
                } else {
                    existing.sep = existing.sep || sep;
                }
            } else {
                quadraObj.covas.push({
                    id: sep.id ?? `${qKey}-${numero}`,
                    numero,
                    status: titulo_posse ? "reservada" : "ocupada",
                    sep,
                });
            }
        });

        return Array.from(quadraMap.values()).sort((a, b) =>
            Number(a.num_quadra) - Number(b.num_quadra)
        );
    }, [blocks, covasData, sepultamentosAll]);

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

    const quadrasDesc = useMemo(() => {
        return [...quadras].sort((a, b) => Number(a.num_quadra) - Number(b.num_quadra));
    }, [quadras]);

    const [selectedCova, setSelectedCova] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);
    const [modalAddQuadraOpen, setModalAddQuadraOpen] = useState(false);

    const [modalAddCovaOpen, setModalAddCovaOpen] = useState(false);
    const [formCova, setFormCova] = useState({
        quadra_cova: "",
        num_cova: "",
        tipo_cova: "cova",
        status: "",
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
            alert("Já existe uma exumação para esse registro");
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
            dh_exu: new Date().toISOString().slice(0, 16),
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
        if (!exumacoesForm || !exumacoesForm.sepultamentoId) return alert("Dados inválidos");

        const key = String(exumacoesForm.sepultamentoId)
        if (exumacoesPending[key]) return alert("Já existe uma exumação pendente para este registro.");

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
            alert("Exumação cadastrada e aguardando confirmação. ");
        } catch (err) {
            console.error("Erro ao enviar exumação", err);
            alert("Erro ao cadastrar exumação" + (err?.message || ""));
        }
    }


    const cancelExumacao = async (sep) => {
        if (!sep || !sep.id) return alert("Sepultamento inválido");
        const key = String(sep.id);
        const ex = exumacoesPending[key];
        if (!ex || !ex.id) {
            return alert("Nenhuma exumação pendente para este registro");
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
            alert("Exumação cancelada. ");
        } catch (err) {
            console.error("Erro ao cancelar exumação", err);
            alert("Erro ao cancelar exumação");
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

    const getSepultadosCount = (quadraOrId) => {
        const quadraNum = (quadraOrId && typeof quadraOrId === "object") ? (quadraOrId.num_quadra ?? quadraOrId.id) : quadraOrId;
        if (quadraNum === null || quadraNum === undefined || quadraNum === "") return 0;
        const qStr = String(quadraNum);

        if (sepCountsByQuadra && Object.prototype.hasOwnProperty.call(sepCountsByQuadra, qStr)) {
            return Number(sepCountsByQuadra[qStr] || 0);
        }

        const ids = new Set();
        (sepultamentosAll || []).forEach(s => {
            if (s.foi_exumado) return;
            const sQ = s.quadra_sep ?? s.quadra ?? "";
            if (String(sQ) === qStr) {
                const id = s.id ?? s._id ?? null;
                if (id != null) ids.add(String(id));
                else ids.add(`${qStr}-${s.num_sepultura_sep ?? s.num_sepultura ?? ""}-${s.dh_sep ?? s.data_obito_sep ?? ""}`);
            }
        });
        return ids.size;
    }

    const getSepultadosCountBySep = (cova, quadraId) => {
        if (!cova) return 0;
        const quadraKey = String(
            quadraId ?? cova.quadra_cova ?? ""
        );

        const numero = String(
            cova.numero ?? cova.num_cova ?? cova.num_sepultura_sep ?? ""
        );
        if (!quadraKey || !numero) return 0;

        const ids = new Set();
        (sepultamentosAll || []).forEach(s => {
            if (s.foi_exumado) return;
            const sQuadra = String(s.quadra_sep ?? "");
            const sNum = String(s.num_sepultura_sep ?? "");
            if (sQuadra === quadraKey && sNum === numero) {
                const id = s.id ?? s._id ?? null;
                if (id != null) ids.add(String(id));
                else ids.add(`${sQuadra}-${sNum}-${s.dh_sep ?? ""}`);

            }
        });
        if (cova.sep) {
            const sepId = cova.sep.id ?? null;
            if (sepId != null) ids.add(String(sepId));
        }
        return ids.size;
    }

    const handleAddCova = () => {
        setFormCova({
            quadra_cova: "",
            num_cova: "",
            tipo_cova: "cova",
            status: "disponivel",
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


    const handleCreateQuadra = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        const num = String(formQuadra.num_quadra || "").trim();
        const description = String(formQuadra.descricao || "").trim();

        if (!num) {
            alert("Informe o número da quadra");
            return;
        }

        try {
            await handleCreateBlock({
                number: Number(num),
                description,
                cemeteryId: FIXED_CEMETERY_ID,
            });
        } catch (err) {
            console.error("Erro ao criar quadra", err);
            alert(err.message || "Erro ao criar quadra");
        }
    };


    const handleCreateCova = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const quadra = String(formCova.quadra_cova || "").trim();
        const num = String(formCova.num_cova || "").trim();
        const tipo = String(formCova.tipo_cova || "").trim();
        if (!quadra || !num) {
            alert("Informe quadra e número da cova");
            return;
        }

        const payload = {
            quadra_cova: quadra,
            num_cova: num,
            tipo_cova: tipo || "cova",
            status: normalizeStatus(formCova.status),
            capacidade: formCova.capacidade || "",
            concessao: {
                ativa: !!(formCova.concessao && formCova.concessao.ativa),
                responsavel: formCova.concessao?.responsavel || "",
                prazo_anos: Number(formCova.concessao?.prazo_anos || 0),
                data_inicio: formCova.concessao?.data_inicio || "",
                data_fim: formCova.concessao?.data_fim || ""
            },
            obs: formCova.obs || "",
        };
        try {
            const chk = await api.get("/covas", { params: { quadra_cova: quadra, num_cova: num } })
            if (Array.isArray(chk.data) && chk.data.length > 0) {
                alert("Já existe uma cova com essa quadra e número");
                return;
            }

        } catch (e) {
            console.warn("Erro ao checar duplicata", e)
        }
        try {
            await api.post("/covas", payload);
            setModalAddCovaOpen(false);
            await loadMapData();
            alert("Sepultura criada");
        } catch (err) {
            console.error("Erro ao criar cova", err);
            alert("Erro ao criar cova");
        }
    }

    const handleCloseAddCovaModal = () => {
        setModalAddCovaOpen(false);
    };

    const handleCloseAddQuadraModal = () => {
        setModalAddQuadraOpen(false);
    }

    const loadMapData = useCallback(async () => {
        try {
            const [rCovas, rSep, rExu, rPets] = await Promise.all([
                api.get("/covas"),
                api.get("/sepultamentos"),
                api.get("/exumacoes"),
                api.get("/pets"),
            ]);

            await loadBlocks();

            const covasData = Array.isArray(rCovas.data) ? rCovas.data : [];
            const sepData = Array.isArray(rSep.data) ? rSep.data : [];
            const petsData = Array.isArray(rPets.data) ? rPets.data : [];
            const exuData = Array.isArray(rExu.data) ? rExu.data : [];

            setCovasData(covasData);
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


            const covaIdToQuadra = Object.fromEntries(
                covasData.map((c) => [String(c.id), String(c.quadra_cova ?? c.quadra ?? "")])
            );

            const tmp = {};
            const visibleSepData = sepData.filter((sep) => !sep.foi_exumado);

            visibleSepData.forEach((sep) => {
                const sepId = sep.id ?? sep._id ?? null;
                const quadraKey = String(
                    sep.quadra_sep ??
                    sep.quadra ??
                    covaIdToQuadra[String(sep.covaId ?? sep.cova_id ?? sep.cova ?? "")] ??
                    "0"
                );

                if (!tmp[quadraKey]) tmp[quadraKey] = new Set();

                if (sepId != null) {
                    tmp[quadraKey].add(String(sepId));
                } else {
                    tmp[quadraKey].add(
                        `${quadraKey}-${sep.num_sepultura_sep ?? sep.num_sepultura ?? ""}-${sep.dh_sep ?? sep.data_obito_sep ?? ""}`
                    );
                }
            });

            const countsObj = {};
            Object.keys(tmp).forEach((k) => {
                countsObj[k] = tmp[k].size;
            });
            setSepCountsByQuadra(countsObj);

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
        { key: "disponível", label: "Disponível", color: "#9e9e9e" },
        { key: "indisponível", label: "Indisponível", color: "#c55" },
        { key: "particular", label: "Particular", color: "#d2b24a" },
        { key: "particular_ocupada", label: "P/O (Particular e ocupada)", color: "#000", borderColor: "#d2b24a", borderWidth: 3 }
    ];

    const sepDataForModal = modalForm ?? selectedCova?.sep ?? null;
    const isOccupiedForModal = String(selectedCova?.status || "").toLowerCase().includes("ocup") || !!sepDataForModal;
    const tipoForModal = selectedCova?.tipo_cova ?? selectedCova?.cova?.tipo_cova ?? sepDataForModal?.tipo_cova ?? sepDataForModal?.tipo_sep ?? "-";
    const capacidadeForModal = selectedCova?.capacidade ?? selectedCova?.cova?.capacidade ?? selectedCova?.sep?.capacidade ?? sepDataForModal?.capacidade ?? "-";
    const observacoesForModal = selectedCova?.obs ?? selectedCova?.cova?.obs ?? "-";
    const numeroForModal = sepDataForModal?.num_sepultura_sep ?? sepDataForModal?.num_sepultura ?? sepDataForModal?.numero ?? selectedCova?.numero ?? "-";
    /* const nomeSepForModal = sepDataForModal?.nome_sep ?? sepDataForModal?.falecido?.nome_fal ?? sepDataForModal?.falecido?.nome ?? null; */

    const getPetsCountBySep = (cova, quadraId) => {
        if (!cova) return 0;

        const quadraKey = String(
            quadraId ?? cova.cova?.quadra_cova ?? cova.quadra_cova ?? cova.quadra_sep ?? ""
        );

        const numero = String(
            cova.numero ?? cova.num_cova ?? cova.num_sepultura_sep ?? ""
        );

        if (!quadraKey || !numero) return 0;

        const ids = new Set();
        (petsAll || []).forEach((p) => {
            if (p.foi_exumado) return;

            const pQuadra = String(p.quadra_sep ?? p.quadra ?? "");
            const pNum = String(p.num_sepultura_sep ?? "");

            if (pQuadra === quadraKey && pNum === numero) {
                const id = p.id ?? p._id ?? null;
                if (id != null) ids.add(String(id));
                else ids.add(`${pQuadra}-${pNum}-${p.dh_sep_pet ?? p.data_obito_pet ?? ""}`);

            }
        });
        return ids.size;
    }

    return (
        <>
            <Container>
                <Title>CONTROLE DE SEPULTURAS</Title>


                <div style={{ margin: "12px 0", display: "flex", gap: 12, alignItems: "center" }}>
                    <label style={{ fontWeight: 600, color: "#171770" }}>Quadra: </label>

                    <QuadraDropdownWrapper style={{ position: "relative", }} ref={dropdownRef}>
                        <QuadraSelectButton onClick={() => setIsQuadraDropdownOpen(!isQuadraDropdownOpen)}
                        >
                            {selectedQuadraId ? `Quadra ${quadrasDesc.find(q => String(q.id) === String(selectedQuadraId))?.num_quadra || selectedQuadraId}` : "Selecione uma quadra"}
                            <span style={{ marginLeft: "8px" }}>
                                {isQuadraDropdownOpen ? "▲" : "▼"}
                            </span>
                        </QuadraSelectButton>

                        {isQuadraDropdownOpen && (
                            <QuadraDropdown>
                                <GridQuadras
                                    quadrasDesc={quadrasDesc}
                                    value={selectedQuadraId}
                                    onChange={(quadra) => {
                                        handleGridChange(quadra);
                                        setIsQuadraDropdownOpen(true);
                                    }}
                                    columnsMinWidth={40}
                                />
                            </QuadraDropdown>
                        )}
                    </QuadraDropdownWrapper>
                </div>
                <QuadraWrapper key={quadraSelecionada.id || "preview"}>
                    <QuadraInfo key={String(quadraSelecionada.id)}>
                        <InfoPill>Capacidade máxima de sepulturas: {quadraSelecionada.max_covas > 0 ? quadraSelecionada.max_covas : "-"}</InfoPill>
                        <InfoPill>Número atual de sepulturas: {Array.isArray(quadraSelecionada.covas) ? quadraSelecionada.covas.length : getCovasCount?.(quadraSelecionada.num_quadra ?? quadraSelecionada.id) ?? 0}</InfoPill>
                        <InfoPill>Número atual de sepultados: {getSepultadosCount(quadraSelecionada.id ?? quadraSelecionada.num_quadra ?? selectedQuadraId)}</InfoPill>

                    </QuadraInfo>
                    <QuadraTitle>{quadraSelecionada.nome || "Nenhuma quadra selecionada"}</QuadraTitle>
                    <CovaGrid>
                        {quadraSelecionada.covas.map((cova) => {

                            const rawStatus = String(cova.status || "").toLowerCase();
/*                             const isReservadaByStatus = rawStatus.includes("reserv");
 */                            const hasTitulo = /* isReservadaByStatus */  !!cova?.cova?.concessao?.ativa || !!(cova.sep && String(cova.sep.titulo_posse ?? "").toLowerCase() === "sim");
                            const sepCount = getSepultadosCountBySep(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra);
                            const petCount = getPetsCountBySep(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra);
                            const capacidadeNum = Number(cova.capacidade ?? 0);
                            const capacidadeTotal = capacidadeNum + sepCount;

                            let displayStatus = cova.status;

                            if (rawStatus.includes("indispon")) {
                                displayStatus = "indisponível";
                            }
                            else if (capacidadeTotal > 0) {
                                if (sepCount >= capacidadeTotal) {
                                    displayStatus = hasTitulo ? "particular_ocupada" : "ocupada";
                                }
                                else if (hasTitulo) {
                                    displayStatus = "reservada"
                                }
                                else {
                                    displayStatus = "disponível"
                                }

                            } /* else if(isReservadaByStatus){
                                displayStatus = "reservada";
                            } */

                            return (
                                <CovaItem
                                    key={cova.id}
                                    status={displayStatus}
                                    borderColor={(displayStatus === "reservada" || displayStatus === "particular_ocupada") ? "#d2b24a" : undefined}
                                    borderWidth={(displayStatus === "reservada" || displayStatus === "particular_ocupada") ? 5 : undefined}
                                    onClick={() => handleClickCova(cova)}
                                    title={`Cova ${cova.numero} - ${displayStatus} (⚰️ ${sepCount}/${capacidadeTotal}${petCount > 0 ? ` | 🐾 ${petCount}` : ""})`}
                                >
                                    {/*  <GiCoffin aria-hidden="true" /> */}
                                    <span className="cova-number" aria-hidden="true">{cova.numero}  </span>
                                    <span className="cova-capacity" aria-hidden="true"><GiCoffin />{`${sepCount}/${capacidadeTotal}`}  </span>
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

                    <BtnAction onClick={() => setIsPieChartOpen(true)}>
                        <FaChartPie /> DISTRIBUIÇÃO DE SEPULTURAS
                    </BtnAction>
                </QuadraWrapper>

                <LegendRow>
                    {statusList.map(s => (
                        <LegendItem key={s.key} color={s.color} borderColor={s.borderColor} borderWidth={s.borderWidth}>
                            <span className="color" />
                            <span>{s.label}</span>
                        </LegendItem>
                    ))}

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <BtnAction onClick={handleAddQuadra}>ADICIONAR QUADRA</BtnAction>
                        <BtnAction onClick={handleAddCova}>ADICIONAR SEPULTURA</BtnAction>
                    </div>

                </LegendRow>

                {isPieChartOpen && (
                    <div style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }} onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsPieChartOpen(false);
                    }}>
                        <div style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 20,
                            width: "90%",
                            maxWidth: 500,
                            maxHeight: "60vh",
                            overflow: "auto",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <h2 style={{ marginLeft: 55, color: "#191970", fontSize: 25 }}>DISTRIBUIÇÃO DAS SEPULTURAS </h2>
                            </div>

                            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flex: 1 }}>

                                <div style={{ flex: 1, minWidth: 300 }}>
                                    <PieChartSepulturas />
                                </div>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                    minWidth: 180,
                                    paddingTop: 70
                                }}>
                                    {statusList.map(s => (
                                        <LegendItem key={s.key} color={s.color} borderColor={s.borderColor} borderWidth={s.borderWidth}>
                                            <span className="color" />
                                            <span>{s.label}</span>
                                        </LegendItem>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {modalAddQuadraOpen && (
                    <ModalOverlay>
                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(0,0,0,0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 9999
                            }}
                            onMouseDown={(e) => {
                                if (e.target === e.currentTarget) handleCloseAddQuadraModal();
                            }}
                        >
                            <form
                                onSubmit={handleCreateQuadra}
                                style={{
                                    color: "#171770",
                                    width: 400,
                                    background: "#fff",
                                    padding: 18,
                                    borderRadius: 8
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>Criar quadra</h3>

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

                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                    <BtnAction
                                        type="button"
                                        onClick={handleCloseAddQuadraModal}
                                        style={{ padding: "8px 10px" }}
                                    >
                                        Cancelar
                                    </BtnAction>

                                    <BtnAdd
                                        type="submit"
                                        disabled={creatingBlock}
                                        style={{ padding: "8px 10px" }}
                                    >
                                        {creatingBlock ? "Criando..." : "Criar"}
                                    </BtnAdd>
                                </div>
                            </form>
                        </div>
                    </ModalOverlay>
                )}


                {modalAddCovaOpen && (
                    <ModalOverlay >
                        <div style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                        }} onMouseDown={(e) => { if (e.target === e.currentTarget) handleCloseAddCovaModal(); }}>
                            <FormStyled onSubmit={handleCreateCova} style={{ color: "#171770", width: 520, background: "#fff", padding: 18, borderRadius: 8 }}>
                                <h3 style={{ marginTop: 0 }} >Criar sepultura</h3>

                                <FormGrid >
                                    <ColumnLeft>
                                        <Field>
                                            <Label>Quadra: </Label>
                                            <SmallSelect style={{ width: 200 }} name="quadra_cova" value={formCova.quadra_cova} onChange={handleCovaChange}>
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
                                            </SmallSelect>
                                        </Field>

                                        <Field>
                                            <Label>Status: </Label>
                                            <SmallSelect style={{ width: 200 }} name="status" value={formCova.status} onChange={handleCovaChange}>
                                                <option value="livre">Disponível</option>
                                                <option value="reservada">Particular</option>
                                                <option value="indisponível">Indisponível</option>
                                            </SmallSelect>
                                        </Field>

                                        <TwoCols>
                                            <Field>
                                                <Label>Número: </Label>
                                                <Input style={{ width: 70 }} name="num_cova" value={formCova.num_cova} onChange={handleCovaChange} />
                                            </Field>

                                            <Field>
                                                <Label>Tipo: </Label>
                                                <SmallSelect style={{ width: 80 }} name="tipo_cova" value={formCova.tipo_cova} onChange={handleCovaChange}>
                                                    <option value="cova">Cova</option>
                                                    <option value="gaveta">Gaveta</option>
                                                    <option value="nicho">Nicho</option>
                                                </SmallSelect>
                                            </Field>
                                        </TwoCols>

                                        <Field>
                                            <Label>Capacidade: </Label>
                                            <Input style={{ width: 200 }} type="number" name="capacidade" value={formCova.capacidade} onChange={handleCovaChange} />
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
                                    <BtnClose type="button" onClick={handleCloseAddCovaModal} style={{ padding: "8px 10px" }}>Cancelar</BtnClose>
                                    <BtnAdd type="submit" style={{ padding: "8px 10px" }}>Criar</BtnAdd>
                                </ButtonsRow>
                            </FormStyled>
                        </div>
                    </ModalOverlay>
                )}

                {modalOpen && selectedCova && (

                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                    }} onMouseDown={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setSelectedCova(null); setModalForm(null); } }}>
                        <ModalContent>

                            <p><strong>Nº da sepultura:</strong> {numeroForModal}</p>
                            <p><strong>Status:</strong> {selectedCova.status ?? (isOccupiedForModal ? "ocupada" : "-")}</p>
                            <p><strong>Tipo:</strong> {tipoForModal}</p>
                            <p><strong>Espaços disponíveis na sepultura:</strong> {capacidadeForModal}</p>
                            <p><strong>Observações:</strong> {observacoesForModal}</p>

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
                                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                                                    <SepItemName>{s.nome_sep || s.falecido || "-"}</SepItemName>

                                                                </div>
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
                                                            <div style={{ padding: "8px 12px 12px", borderLeft: "3px solid #eef0ff", background: "#fff" }}>
                                                                <p style={{ margin: "6px 0" }}><strong>Nome do sepultado: </strong>{modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "-"}</p>
                                                                <p style={{ margin: "6px 0" }}><strong>Data e hora do sepultamento: </strong>{modalForm.dh_sep || modalForm.data_hora || modalForm.data_obito_sep || "-"}</p>
                                                                <p style={{ margin: "6px 0" }}><strong>Data do óbito: </strong>{modalForm.data_obito || modalForm.data_obito_sep || "-"}</p>
                                                                <p style={{ margin: "6px 0" }}><strong>Responsável: </strong>{modalForm.nome_resp || modalForm.falecido?.nome_resp || "-"}</p>
                                                                <p style={{ margin: "6px 0" }}><strong>Contato do responsável: </strong>{modalForm.tel_resp || modalForm.falecido?.tel_resp || "-"}</p>
                                                                {exumacoesPending[String(s.id)] ? (
                                                                    <BtnAdd style={{ backgroundColor: "#cf142b" }} type="button" onClick={() => cancelExumacao(s)}>Cancelar exumação</BtnAdd>
                                                                ) : (
                                                                    <BtnAdd type="button" onClick={() => { openExumacaoForm(s); setModalOpen(false); }}>Iniciar exumação</BtnAdd>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </SepList>
                                    </>
                                ) : (
                                    sepDataForModal ? (
                                        <>
                                            <p><strong>Nome do sepultado: </strong> {modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "-"}</p>
                                            <p><strong>Data e hora do sepultamento: </strong> {modalForm.dh_sep || modalForm.data_hora || modalForm.data_obito_sep || "-"}</p>
                                            <p><strong>Data do óbito: </strong> {modalForm.data_obito || modalForm.data_obito_sep || "-"}</p>
                                        </>
                                    ) : null

                                )}
                            </CovaPetsSection>

                            <ModalButtonsRow>
                                <BtnPrimaryClose onClick={() => { setModalOpen(false); setSelectedCova(null); setModalForm(null); }} style={{ padding: "8px 10px" }}>Fechar</BtnPrimaryClose>
                            </ModalButtonsRow>

                        </ModalContent>
                    </div>
                )}

                {exumacoesModalIsOpen && exumacoesForm && (
                    <ModalOverlay>
                        <form onSubmit={submitExumacao} style={{ color: "#171770", width: 520, background: "#fff", padding: 18, borderRadius: 8 }}>
                            <h3 style={{ marginTop: 0 }}>Iniciar exumação</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div>
                                    <Label>Quadra</Label>
                                    <Input readOnly value={exumacoesForm.quadra_sep || ""} />
                                </div>

                                <div>
                                    <Label>Sepultura</Label>
                                    <Input readOnly value={exumacoesForm.num_sepultura_sep || ""} />
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <Label>Nome do sepultado</Label>
                                    <Input readOnly value={exumacoesForm.nome_sep || ""} />
                                </div>

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
                            </div>


                            <ButtonsRow style={{ marginTop: 12 }}>
                                <BtnClose type="button" onClick={() => setExumacoesModalIsOpen(false)}>Cancelar</BtnClose>
                                <BtnAdd type="submit">Confirmar</BtnAdd>
                            </ButtonsRow>

                        </form>
                    </ModalOverlay>


                )}

            </Container >

        </>
    )
}
