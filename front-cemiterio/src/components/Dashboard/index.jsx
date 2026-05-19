import React, { useEffect, useState, useRef } from "react";
import { DashboardWrapper, Card, CardHeader, CardBody, ProcessItem, ProcessInfo, ProcessAction, ProcessType, EmptyState, Btn } from "./styles";
import { FaCross } from "react-icons/fa";
import { FaSkullCrossbones } from "react-icons/fa";
import { FaTools } from "react-icons/fa";
import api from "../../services/index.js";

export default function Dashboard() {

    const [processos, setProcessos] = useState([]);
    const mountedRef = useRef(true);

    const icones = {
        Sepultamento: <FaCross />,
        Exumação: <FaSkullCrossbones />,
        Manutenção: <FaTools />
    };

    const isConfirmedSepultamento = (sep) => {
        const confirmed = sep?.confirmado === true || String(sep?.confirmado).toLowerCase() === "true";
        const concluded = String(sep?.status ?? "").toLowerCase().includes("concl");
        return confirmed || concluded;
    };

    const resolveGraveBySep = async (quadra, num) => {
        const rc = await api.get("/covas", { params: { blockId: quadra, number: num } }).catch(() => null);
        if (rc && Array.isArray(rc.data) && rc.data.length) return rc.data[0];

        const fallback = await api.get("/covas").catch(() => null);
        const allGraves = Array.isArray(fallback?.data) ? fallback.data : [];
        return allGraves.find((g) => String(g.blockId ?? g.quadra_cova ?? g.quadra ?? "") === String(quadra)
            && String(g.number ?? g.num_cova ?? g.numero ?? "") === String(num)) ?? null;
    };

    const getActiveConfirmedSepsCount = async (quadra, num) => {
        const rS = await api.get("/sepultamentos").catch(() => null);
        const seps = Array.isArray(rS?.data) ? rS.data : [];
        return seps.filter((s) => {
            const sameQuadra = String(s.quadra_sep ?? s.quadra ?? "") === String(quadra);
            const sameNum = String(s.num_sepultura_sep ?? s.num_sepultura ?? s.numero ?? "") === String(num);
            const active = s.foi_exumado !== true;
            return sameQuadra && sameNum && active && isConfirmedSepultamento(s);
        }).length;
    };

    const loadProcessos = async () => {
        try {
            const [rFalecidos, rSep, rVel, rExu, rQuadras] = await Promise.all([
                api.get("/falecidos"),
                api.get("/sepultamentos"),
                api.get("/velorios"),
                api.get("/exumacoes"),
                api.get("/quadras"),
            ]);

            const falecidos = rFalecidos.data || [];
            const sep = (rSep.data || []).map(s => ({ ...s, _type: "Sepultamento" }));
            const vel = (rVel.data || []).map(v => ({ ...v, _type: "Velório" }));
            const exu = (rExu.data || []).map(x => ({ ...x, _type: "Exumação" }));
            const quadras = rQuadras.data || [];

            const all = [...vel, ...sep, ...exu].map(item => {
                const fk = item.falecido ?? item.falecido_id ?? item.falecidoId;
                const f = falecidos.find(fr => String(fr.id) === String(fk));

                let quadra_num = null;
                if (item._type === "Sepultamento") {
                    const qKey = item.quadra_sep ?? item.quadra ?? item.quadra_cova ?? null;
                    const qObj = quadras.find(qt =>
                        String(qt.id) === String(qKey)
                        || String(qt.num_quadra) === String(qKey)
                        || (qt.nome && String(qt.nome).endsWith(String(qKey)))
                    );
                    quadra_num = qObj ? (qObj.num_quadra ?? qObj.id) : (qKey ?? null);
                }

                const num_sepultura = item.num_sepultura_sep ?? item.num_sepultura ?? item.numero ?? item.num_cova ?? null;

                return {
                    ...item,
                    nome_fal: item.nome_sep || item.nome_vel || item.nome_exu || (f ? (f.nome_fal || f.nome) : item.nome),
                    falecido: f || null,
                    quadra_num,
                    num_sepultura,
                }
            })

            if (!mountedRef.current) return;
            const active = all.filter(it => {
                const st = String(it.status ?? "").toLowerCase();
                const confirmed = it.confirmado === true || it.confirmado === "true";
                return !(st === "concluído" || confirmed);
            })
            setProcessos(active.sort((a, b) => (a.dh_sep || a.data_velorio || a.dh_exu || "").localeCompare(b.dh_sep || b.data_velorio || b.dh_exu || "")));
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
                setProcessos(prev => [...saved, ...prev]);
            }
        } catch (e) {
            console.warn("Erro ao ler local_processos", e)
        }

        const onCreated = (ev) => {
            const item = ev?.detail;
            if (!item) return;
            loadProcessos();

        }

        const onLocal = (ev) => {
            const item = ev?.detail;
            if (!item) return;
            loadProcessos();
        };

        window.addEventListener("processoCriado", onCreated);
        window.addEventListener("processoCriadoLocal", onLocal);

        return () => {
            mountedRef.current = false;
            window.removeEventListener("processoCriado", onCreated)
            window.removeEventListener("processoCriadoLocal", onLocal)
        }
    }, []);
  


    const getScheduledDate = (item) => {
        const raw = item.dh_sep || item.data_velorio || item.dh_exu || item.data || item.horario || "";
        if (!raw) return null;
        if (typeof raw === "number") return new Date(raw);
        const s = String(raw).trim();

        if (/^\d{4}-\d{2}-\d{2}([T\s].*)?$/.test(s)) {
            const iso = s.includes("T") ? s : `${s}T00:00:00`;
            const parsed = new Date(iso);
            return isNaN(parsed) ? null : parsed;
        }

        const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}:\d{2}(?::\d{2})?))?$/);
        if (m) {
            const [, day, month, year, time] = m;
            const timePart = time || "00:00:00";
            const iso = `${year}-${month}-${day}T${timePart}`;
            const parsed = new Date(iso);
            return isNaN(parsed) ? null : parsed;
        }

        const parsed = new Date(s);
        return isNaN(parsed) ? null : parsed;
    };

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
            setProcessos(prev => prev.filter(p => !(p._type === item._type && p.id === item.id)));
            if (item._type === "Velório") {
                await api.patch(`/velorios/${item.id}`, { status: "Concluído", confirmado: true }).catch(() => { });
            } else if (item._type === "Sepultamento") {
                await api.patch(`/sepultamentos/${item.id}`, { status: "Concluído", confirmado: true }).catch(() => { });
                sepId = item.id;

                try {
                    const rSep = await api.get(`/sepultamentos/${item.id}`).catch(() => null);
                    const sep = rSep?.data ?? null;
                    if (sep) {
                        const quadra = sep.quadra_sep ?? sep.quadra;
                        const num = sep.num_sepultura_sep ?? sep.num_sepultura ?? sep.numero;
                        if (quadra != null && num != null) {
                            const found = await resolveGraveBySep(quadra, num);
                            if (found && found.id != null) {
                                const curCap = Number(found.bodyCapacity ?? found.capacidade ?? 0);
                                const newCap = Math.max(0, curCap - 1);
                                const activeConfirmedSeps = await getActiveConfirmedSepsCount(quadra, num);
                                const newStatus = activeConfirmedSeps > 0 ? "OCCUPIED" : "AVAILABLE";

                                await api.patch(`/covas/${found.id}`, { bodyCapacity: newCap, status: newStatus }).catch(() => { });
                                try { window.dispatchEvent(new CustomEvent("covaCapacidadeAlterada", { detail: { covaId: found.id, capacidade: newCap } })); } catch (e) { e }
                            }
                        }
                    }
                } catch (capErr) {
                    console.warn("Erro ao decrementar capacidade de cova ao confirmar sepultamento:", capErr)
                }

            } else if (item._type === "Exumação") {
                await api.patch(`/exumacoes/${item.id}`, { status: "Concluído", confirmado: true }).catch(() => { });

                sepId = item.sepultamentoId ?? item.sepultamento ?? item.falecido_id ?? null;
                if (sepId) {
                    try {
                        await api.patch(`/sepultamentos/${sepId}`, { foi_exumado: true }).catch(() => { });
                    } catch (patchErr) {
                        console.warn("Erro ao marcar sepultamento como exumado:", patchErr);
                    }

                    try {
                        const rSep = await api.get(`/sepultamentos/${sepId}`).catch(() => null);
                        const sep = rSep?.data ?? null;
                        if (sep) {
                            const quadra = sep.quadra_sep ?? sep.quadra;
                            const num = sep.num_sepultura_sep ?? sep.num_sepultura ?? sep.numero;
                            if (quadra != null && num != null) {
                                const found = await resolveGraveBySep(quadra, num);
                                if (found && found.id != null) {
                                    const curCap = Number(found.bodyCapacity ?? found.capacidade ?? 0);
                                    const newCap = curCap + 1;

                                    const activeConfirmedSeps = await getActiveConfirmedSepsCount(quadra, num);
                                    const newStatus = activeConfirmedSeps > 0 ? "OCCUPIED" : "AVAILABLE";

                                    await api.patch(`/covas/${found.id}`, { bodyCapacity: newCap, status: newStatus }).catch(() => { });
                                    try { window.dispatchEvent(new CustomEvent("covaCapacidadeAlterada", { detail: { covaId: found.id, capacidade: newCap } })); } catch (e) { e }
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
                window.dispatchEvent(new CustomEvent("processoConfirmado", { detail: { id: item.id, type: item._type } }))
            } catch (e) {
                console.error("Erro ao dispatch evento processoConfirmado", e)
            }
            alert("Processo Confirmado")
        } catch (err) {
            console.error("Erro ao confirmar processo", err);
            alert("Erro ao confirmar processo");
        }


    }
    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>PRÓXIMOS PROCESSOS</CardHeader>
                <CardBody>
                    {processosPendentes.length ? processosPendentes.map((p) => (
                        <ProcessItem key={`${p._type}-${p.id}`}>
                            <ProcessInfo>
                                <strong>{p.nome_fal || p.nome}</strong>
                                {p._type === "Velório" && p.data_velorio && <span>Velorio:{p.data_velorio}</span>}
                                {p._type === "Exumação" && p.dh_exu && <span>Exumação: {p.dh_exu}</span>}
                                {p._type === "Sepultamento" && p.dh_sep && (
                                    <span>
                                        Sepultamento: {p.dh_sep}
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
                                <Btn onClick={() => handleConfirm(p)}>Confirmar conclusão</Btn>
                            </ProcessAction>
                        </ProcessItem>
                    )) : <EmptyState>Nenhum processo pendente.</EmptyState>}                </CardBody>
            </Card>
        </DashboardWrapper>

    )
}
