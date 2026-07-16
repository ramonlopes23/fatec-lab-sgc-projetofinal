import React, { useEffect, useState, useRef } from "react";
import {
    DashboardWrapper,
    Card,
    CardHeader,
    CardBody,
    ProcessItem,
    ProcessInfo,
    ProcessAction,
    ProcessType,
    EmptyState,
} from "./styles";
import { FaCross } from "react-icons/fa";
import { FaSkullCrossbones } from "react-icons/fa";
import { FaTools } from "react-icons/fa";
import { getBlocks } from "../../../services/blockService.js";
import { getExumacoes, patchExumacao } from "../../../services/exumacaoService.js";
import { getFalecidos } from "../../../services/falecidoService.js";
import { getGraves, patchGrave } from "../../../services/graveService.js";
import { getSepultamentoById, getSepultamentos, patchSepultamento } from "../../../services/sepultamentoService.js";
import { getVelorios, patchVelorio } from "../../../services/velorioService.js";
import { useToastFeedback } from "../../../hooks";
import {
    formatDateNormalized,
    getFalecidoId,
    getFalecidoIdFromRecord,
    getFalecidoName,
    getSepulturaCapacity,
    getSepulturaNumber,
    getSepulturaQuadraRef,
    normalizeFalecido,
    parseDateValue,
    resolveQuadraDisplay,
} from "../../../utils";
import SystemButton from "../../common/SystemButton";

export default function Dashboard() {
    const [processos, setProcessos] = useState([]);
    const mountedRef = useRef(true);
    const { showSuccess, showError, ToastElement } = useToastFeedback();

    const icones = {
        Sepultamento: <FaCross />,
        Exumação: <FaSkullCrossbones />,
        Manutenção: <FaTools />,
    };

    const isConfirmedSepultamento = (sep) => {
        const confirmed = sep?.confirmado === true || String(sep?.confirmado).toLowerCase() === "true";
        const concluded = String(sep?.status ?? "")
            .toLowerCase()
            .includes("concl");
        return confirmed || concluded;
    };

    const resolveGraveBySep = async (quadra, num) => {
        const matchingGraves = await getGraves({ blockId: quadra, number: num }).catch(() => null);
        if (Array.isArray(matchingGraves) && matchingGraves.length) return matchingGraves[0];

        const fallback = await getGraves().catch(() => null);
        const allGraves = Array.isArray(fallback) ? fallback : [];
        return (
            allGraves.find(
                (g) =>
                    String(getSepulturaQuadraRef(g)) === String(quadra) && String(getSepulturaNumber(g)) === String(num)
            ) ?? null
        );
    };

    const getActiveConfirmedSepsCount = async (quadra, num) => {
        const loadedSepultamentos = await getSepultamentos().catch(() => null);
        const seps = Array.isArray(loadedSepultamentos) ? loadedSepultamentos : [];
        return seps.filter((s) => {
            const sameQuadra = String(getSepulturaQuadraRef(s)) === String(quadra);
            const sameNum = String(getSepulturaNumber(s)) === String(num);
            const active = s.foi_exumado !== true;
            return sameQuadra && sameNum && active && isConfirmedSepultamento(s);
        }).length;
    };

    const loadProcessos = async () => {
        try {
            const [rFalecidos, rSep, rVel, rExu, rQuadras] = await Promise.all([
                getFalecidos(),
                getSepultamentos(),
                getVelorios(),
                getExumacoes(),
                getBlocks(),
            ]);

            const loadedFalecidos = Array.isArray(rFalecidos) ? rFalecidos.map(normalizeFalecido) : [];
            const loadedSepultamentos = Array.isArray(rSep) ? rSep : [];
            const sep = loadedSepultamentos.map((s) => ({ ...s, _type: "Sepultamento" }));
            const vel = (Array.isArray(rVel) ? rVel : []).map((v) => ({ ...v, _type: "Velório" }));
            const exu = (Array.isArray(rExu) ? rExu : []).map((x) => ({ ...x, _type: "Exumação" }));
            const quadras = Array.isArray(rQuadras) ? rQuadras : [];

            const all = [...vel, ...sep, ...exu].map((item) => {
                const fk = getFalecidoIdFromRecord(item);
                const f = loadedFalecidos.find((fr) => getFalecidoId(fr) === String(fk));

                let quadra_num = null;
                if (item._type === "Sepultamento") {
                    const qKey = item.quadra_sep ?? item.quadra ?? item.quadra_cova ?? null;
                    const qObj = quadras.find(
                        (qt) =>
                            String(qt.id) === String(qKey) ||
                            String(qt.num_quadra) === String(qKey) ||
                            String(qt.number) === String(qKey) ||
                            (qt.nome && String(qt.nome).endsWith(String(qKey)))
                    );
                    quadra_num = resolveQuadraDisplay(qObj ?? qKey, quadras, "");
                }

                const num_sepultura = getSepulturaNumber(item) || null;
                const velorio_inicio = item.dh_inicio_velorio ?? item.data_velorio ?? null;

                return {
                    ...item,
                    nome_fal: item.nome_sep || item.nome_vel || item.nome_exu || getFalecidoName(f) || item.nome,
                    falecido: f || null,
                    quadra_num,
                    num_sepultura,
                    local: item.local_velorio || item.local || "",
                    velorio_inicio,
                };
            });

            if (!mountedRef.current) return;
            const active = all.filter((it) => {
                const st = String(it.status ?? "").toLowerCase();
                const confirmed = it.confirmado === true || it.confirmado === "true";
                return !(st === "concluído" || confirmed || st.includes("aguardando velorio"));
            });
            setProcessos(
                active.sort((a, b) =>
                    (a.dh_inicio_velorio || a.data_velorio || a.dh_sep || a.dh_exu || "").localeCompare(
                        b.dh_inicio_velorio || b.data_velorio || b.dh_sep || b.dh_exu || ""
                    )
                )
            );
        } catch (err) {
            console.error("Erro ao carregar dashboard", err);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        window._loadDashboardProcessos = loadProcessos;
        loadProcessos();

        try {
            const saved = JSON.parse(localStorage.getItem("local_processos") || "[]");
            if (Array.isArray(saved) && saved.length) {
                setProcessos((prev) => [...saved, ...prev]);
            }
        } catch (e) {
            console.warn("Erro ao ler local_processos", e);
        }

        const onCreated = (ev) => {
            const item = ev?.detail;
            if (!item) return;
            loadProcessos();
        };

        const onLocal = (ev) => {
            const item = ev?.detail;
            if (!item) return;
            loadProcessos();
        };

        window.addEventListener("processoCriado", onCreated);
        window.addEventListener("processoCriadoLocal", onLocal);

        return () => {
            mountedRef.current = false;
            window.removeEventListener("processoCriado", onCreated);
            window.removeEventListener("processoCriadoLocal", onLocal);
        };
    }, []);

    const getScheduledDate = (item) =>
        parseDateValue(
            item.dh_inicio_velorio || item.dh_sep || item.data_velorio || item.dh_exu || item.data || item.horario || ""
        );

    const processosPendentes = [...processos].sort((a, b) => {
        const da = getScheduledDate(a);
        const db = getScheduledDate(b);
        const ta = da ? da.getTime() : Number.MAX_SAFE_INTEGER;
        const tb = db ? db.getTime() : Number.MAX_SAFE_INTEGER;
        return ta - tb;
    });

    const handleConfirm = async (item) => {
        let sepId = null;
        try {
            setProcessos((prev) => prev.filter((p) => !(p._type === item._type && p.id === item.id)));
            if (item._type === "Velório") {
                await patchVelorio(item.id, { status: "Concluído", confirmado: true }).catch(() => {});

                const linkedSepultamentoId = item.sepultamento_id ?? item.sepultamentoId ?? null;
                if (linkedSepultamentoId) {
                    try {
                        await patchSepultamento(linkedSepultamentoId, {
                            status: "Pendente",
                            confirmado: false,
                            liberado_por_velorio: true,
                        }).catch(() => {});
                        const sepultamento = await getSepultamentoById(linkedSepultamentoId).catch(() => null);
                        if (sepultamento) {
                            window.dispatchEvent(
                                new CustomEvent("processoCriado", {
                                    detail: { ...sepultamento, _type: "Sepultamento" },
                                })
                            );
                        }
                    } catch (libErr) {
                        console.warn("Erro ao liberar sepultamento após velório:", libErr);
                    }
                }
            } else if (item._type === "Sepultamento") {
                await patchSepultamento(item.id, { status: "Concluído", confirmado: true }).catch(() => {});
                sepId = item.id;

                try {
                    const sep = await getSepultamentoById(item.id).catch(() => null);
                    if (sep) {
                        const quadra = sep.quadra_sep ?? sep.quadra;
                        const num = getSepulturaNumber(sep);
                        if (quadra != null && num != null) {
                            const found = await resolveGraveBySep(quadra, num);
                            if (found && found.id != null) {
                                const curCap = Number(getSepulturaCapacity(found));
                                const newCap = Math.max(0, curCap - 1);
                                const activeConfirmedSeps = await getActiveConfirmedSepsCount(quadra, num);
                                const newStatus = activeConfirmedSeps > 0 ? "OCCUPIED" : "AVAILABLE";

                                await patchGrave(found.id, { bodyCapacity: newCap, status: newStatus }).catch(() => {});
                                try {
                                    window.dispatchEvent(
                                        new CustomEvent("covaCapacidadeAlterada", {
                                            detail: { covaId: found.id, capacidade: newCap },
                                        })
                                    );
                                } catch (e) {
                                    e;
                                }
                            }
                        }
                    }
                } catch (capErr) {
                    console.warn("Erro ao decrementar capacidade de cova ao confirmar sepultamento:", capErr);
                }
            } else if (item._type === "Exumação") {
                await patchExumacao(item.id, { status: "Concluído", confirmado: true }).catch(() => {});

                sepId = item.sepultamentoId ?? item.sepultamento ?? item.falecido_id ?? null;
                if (sepId) {
                    try {
                        await patchSepultamento(sepId, { foi_exumado: true }).catch(() => {});
                    } catch (patchErr) {
                        console.warn("Erro ao marcar sepultamento como exumado:", patchErr);
                    }

                    try {
                        const sep = await getSepultamentoById(sepId).catch(() => null);
                        if (sep) {
                            const quadra = sep.quadra_sep ?? sep.quadra;
                            const num = getSepulturaNumber(sep);
                            if (quadra != null && num != null) {
                                const found = await resolveGraveBySep(quadra, num);
                                if (found && found.id != null) {
                                    const curCap = Number(getSepulturaCapacity(found));
                                    const newCap = curCap + 1;

                                    const activeConfirmedSeps = await getActiveConfirmedSepsCount(quadra, num);
                                    const newStatus = activeConfirmedSeps > 0 ? "OCCUPIED" : "AVAILABLE";

                                    await patchGrave(found.id, {
                                        bodyCapacity: newCap,
                                        status: newStatus,
                                    }).catch(() => {});
                                    try {
                                        window.dispatchEvent(
                                            new CustomEvent("covaCapacidadeAlterada", {
                                                detail: { covaId: found.id, capacidade: newCap },
                                            })
                                        );
                                    } catch (e) {
                                        e;
                                    }
                                }
                            }
                        }
                    } catch (capErr) {
                        console.warn("Erro ao restaurar capacidade de cova ao confirmar exumação:", capErr);
                    }
                }
            }

            await loadProcessos();

            try {
                window.dispatchEvent(
                    new CustomEvent("processoConfirmado", { detail: { id: item.id, type: item._type } })
                );
            } catch (e) {
                console.error("Erro ao dispatch evento processoConfirmado", e);
            }
            showSuccess("Processo confirmado.");
        } catch (err) {
            console.error("Erro ao confirmar processo", err);
            showError("Erro ao confirmar processo");
        }
    };
    return (
        <DashboardWrapper>
            {ToastElement}
            <Card>
                <CardHeader>Próximos processos</CardHeader>
                <CardBody>
                    {processosPendentes.length ? (
                        processosPendentes.map((p) => (
                            <ProcessItem key={`${p._type}-${p.id}`}>
                                <ProcessInfo>
                                    <strong>{getFalecidoName(p) || p.nome}</strong>
                                    {p._type === "Velório" && (p.dh_inicio_velorio || p.data_velorio) && (
                                        <span>
                                            Velório: {formatDateNormalized(p.dh_inicio_velorio || p.data_velorio, "-")}
                                            {p.dh_fim_velorio
                                                ? ` até ${formatDateNormalized(p.dh_fim_velorio, "-")}`
                                                : ""}
                                        </span>
                                    )}
                                    {p._type === "Exumação" && p.dh_exu && (
                                        <span>Exumação: {formatDateNormalized(p.dh_exu, "-")}</span>
                                    )}
                                    {p._type === "Sepultamento" && p.dh_sep && (
                                        <span>
                                            Sepultamento: {formatDateNormalized(p.dh_sep, "-")}
                                            {p.quadra_num ? ` — Quadra: ${p.quadra_num}` : ""}
                                            {p.num_sepultura ? ` — Sepultura: ${p.num_sepultura}` : ""}
                                        </span>
                                    )}
                                </ProcessInfo>
                                <ProcessAction>
                                    <ProcessType>
                                        {icones[p._type] || null}
                                        {p._type}
                                    </ProcessType>
                                    {p.local && <span> {p.local} </span>}
                                    <SystemButton type="button" onClick={() => handleConfirm(p)}>
                                        Confirmar conclusão
                                    </SystemButton>
                                </ProcessAction>
                            </ProcessItem>
                        ))
                    ) : (
                        <EmptyState>Nenhum processo pendente.</EmptyState>
                    )}{" "}
                </CardBody>
            </Card>
        </DashboardWrapper>
    );
}
