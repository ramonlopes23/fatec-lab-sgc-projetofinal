import React, { useState, useMemo, useEffect } from "react";
import { formatDateDMY, formatDateKey } from "../../utils/date";
import { Card, CardHeader, CardBody, CalendarGrid, DayCell, DayButton, Btn, Title } from "./styles";


export default function Calendar({ sepultamentos = [], quadras = [], exumacoes = [] }) {
    const hoje = new Date();
    const [anoMes, setAnoMes] = useState({ year: hoje.getFullYear(), month: hoje.getMonth() });
    const [open, setOpen] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [sepultamentosDia, setSepultamentosDia] = useState([]);

    
    const quadraMap = useMemo(() => {
        const m = {};
        (quadras || []).forEach(q => {
            const id = q.id ?? q._id ?? q.codigo ?? q.key;
            if (id != null) m[String(id)] = q.num_quadra ?? q.numero ?? q.nome ?? String(id);
        });
        return m;
    }, [quadras]);

    const eventosFonte = useMemo(() => {
        const normalizeSep = (s) => ({
            _type: "Sepultamento",
            id: s.id ?? s._id,
            nome: s.nome_sep,
            rawDate: s.dh_sep,
            quadraCandidate: s.num_quadra ?? s.quadra_sep,
            cova: s.num_sepultura_sep,
            status: s.status,
            extra: {}
        });

        const normalizeExu = (x) => ({
            _type: "Exumação",
            id: x.id,
            nome: x.nome_sep,
            rawDate: x.dh_exu,
            quadraCandidate: x.quadra_sep ?? x.num_quadra,
            cova: x.num_sepultura_sep,
            status: x.status ?? "",
            extra: { motivo: x.motivo, destino: x.destino, coveiro: x.coveiro }

        });

        const allNormalized = [
            ...(sepultamentos || []).map(normalizeSep),
            ...(exumacoes || []).map(normalizeExu),

        ]

        const mapped = allNormalized
            .map(item => {
                const data = formatDateKey(item.rawDate);
                const horario = (() => {
                    const raw = item.rawDate || "";
                    if (!raw) return "";
                    if (String(raw).includes("T")) return String(raw).split("T")[1].slice(0, 5);
                    const parts = String(raw).split(" ");
                    return parts[1] || "";
                })();

                const quadraStr = typeof item.quadraCandidate === "object"
                    ? (item.quadraCandidate.num_quadra ?? item.quadraCandidate.id ?? "")
                    : String(item.quadraCandidate ?? "");
                return {
                    id: `evt-${item._type}-${item.id ?? Math.random().toString(36).slice(2, 9)}`,
                    nomeFalecido: item.nome,
                    data,
                    horario,
                    quadra: quadraMap[quadraStr] ?? quadraStr,
                    cova: item.cova,
                    status: item.status,
                    tipo: item._type,
                    ...item.extra
                }
            })
            .filter(e => !!e.data)
            .sort((a, b) => {
                if (a.data != b.data) return String(a.data).localeCompare(String(b.data));

                const ha = String(a.horario || "");
                const hb = String(b.horario || "");
                const timeCmp = ha.localeCompare(hb);
                if (timeCmp !== 0) return timeCmp;

                const priority = (tipo) => tipo === "Sepultamento" ? 0 : (tipo === "Exumação" ? 1 : 2);
                const pa = priority(a.tipo);
                const pb = priority(b.tipo);
                if (pa !== pb) return pa - pb;

                return String(a.nomeFalecido || "").localeCompare(String(b.nomeFalecido || ""));
            });

        return mapped;

    }, [sepultamentos, exumacoes, quadraMap])



    const eventosPorData = useMemo(() => {
        const map = {};
        eventosFonte.forEach((s) => {
            map[s.data] = map[s.data] || [];
            map[s.data].push(s);
        });

        const priority = (tipo) => tipo === "Sepultamento" ? 0 : (tipo === "Exumação" ? 1 : 2);
        Object.keys(map).forEach(k => {
            map[k].sort((a, b) => {
                const pa = priority(a.tipo);
                const pb = priority(b.tipo);
                if (pa != pb) return pa - pb;
                const ha = String(a.horario || "");
                const hb = String(b.horario || "");
                const timeCmp = ha.localeCompare(hb);
                if (timeCmp !== 0) return timeCmp;
                return String(a.nomeFalecido || "").localeCompare(String(b.nomeFalecido || ""));
            })
        })
        return map;
    }, [eventosFonte]);

    const semanasDoMes = useMemo(() => {
        const { year, month } = anoMes;
        const primeiro = new Date(year, month, 1);
        const ultimo = new Date(year, month + 1, 0);
        const primeiraSemanaDia = primeiro.getDay();
        const totalDias = ultimo.getDate();
        const dias = [];
        for (let i = 0; i < primeiraSemanaDia; i++) dias.push(null);
        for (let d = 1; d <= totalDias; d++) dias.push(new Date(year, month, d));
        while (dias.length % 7 !== 0) dias.push(null);
        const semanas = [];
        for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));
        return semanas;
    }, [anoMes]);

    const abrirDia = (date) => {
        const key = formatDateKey(date);
        setDataSelecionada(key);
        setSepultamentosDia(eventosPorData[key] || []);
        setOpen(true);
    };

    const voltarMes = () => setAnoMes(s => {
        const m = s.month - 1;
        if (m < 0) return { year: s.year - 1, month: 11 };
        return { year: s.year, month: m };
    });
    const avancarMes = () => setAnoMes(s => {
        const m = s.month + 1;
        if (m > 11) return { year: s.year + 1, month: 0 };
        return { year: s.year, month: m };
    });

    useEffect(() => {
        if (!open) {
            setDataSelecionada(null);
            setSepultamentosDia([]);
        }
    }, [open]);

    const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const nomesMes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];



    return (
        <Card style={{ marginTop: 16 }}>
            <CardHeader>CALENDÁRIO DE SEPULTAMENTOS E EXUMAÇÕES</CardHeader>
            <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: 600 }}>{nomesMes[anoMes.month]} {anoMes.year}</div>
                        <Btn onClick={voltarMes} aria-label="Mês anterior">◀</Btn>
                        <Btn onClick={avancarMes} aria-label="Próximo mês">▶</Btn>
                    </div>
                </div>

                <CalendarGrid>
                    {nomesSemana.map((n) => (<div key={n} style={{ textAlign: "center", fontWeight: 600 }}>{n}</div>))}
                    {semanasDoMes.map((sem, i) => (
                        <React.Fragment key={i}>
                            {sem.map((dia, idx) => {
                                const key = formatDateKey(dia);
                                const eventos = key ? eventosPorData[key] || [] : [];
                                return (
                                    <DayCell key={key ?? `${i}-${idx}`} isCurrentMonth={!!dia}>
                                        {dia ? (
                                            <DayButton onClick={() => abrirDia(dia)} aria-label={`Abrir ${key ?? `${i}-${idx}`}`}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ fontWeight: 600 }}>{dia.getDate()}</div>
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                                    {eventos.slice(0, 2).map(e => {
                                                        const tipoCor = e.tipo === "Exumação" ? "#d97706" : "#191970";
                                                        const labelTipo = e.tipo || "Sepult.";
                                                        return (
                                                            <div key={e.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {e.nomeFalecido} <span style={{ color: tipoCor, marginLeft: 6, fontSize: 11 }}>⦿ {labelTipo}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </DayButton>
                                        ) : null}
                                    </DayCell>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </CalendarGrid>

                {open && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                        <div style={{ width: 560, maxHeight: '80vh', overflowY: 'auto', background: '#fff', borderRadius: 8, padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Title style={{ margin: 0 }}>Sepultamentos e exumações em {formatDateDMY(dataSelecionada)}</Title>
                                <Btn onClick={() => setOpen(false)}>Fechar</Btn>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                {sepultamentosDia.length === 0 ? (
                                    <div style={{ color: '#666' }}>Nenhum sepultamento ou exumação registrado neste dia.</div>
                                ) : sepultamentosDia.map(s => (
                                    <div style={{ marginTop: 8, padding: 8, background: "#f8f9fb", borderRadius: 6 }}>

                                        <div key={s.id ?? s._id ?? `${formatDateDMY(dataSelecionada)}-${s.quadra}-${s.cova}`} style={{ marginBottom: 12 }}>
                                            <div style={{ fontWeight: 700 }}>{s.nomeFalecido}</div>
                                            {(s.data || s.horario) ? (
                                                <div style={{ color: '#555' }}>
                                                    {s.tipo === "Exumação"
                                                        ? `Data/Hora da exumação: ${formatDateDMY(s.data, s.data ?? '')}${s.horario ? ' ' + s.horario : ''}`
                                                        : (s.horario ? `Horario do sepultamento: ${s.horario}` : null)}
                                                </div>
                                            ) : null}
                                        </div>


                                        <div style={{ color: '#555' }}>Quadra: {s.quadra} • Cova: {s.cova}</div>
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#333' }}>{String(s.status)}{s.reservada ? ' • Particular' : ''}</div>

                                        {s.tipo === "Exumação" && (
                                            <div style={{ marginTop: 8, padding: 8, background: "#fff", borderRadius: 6 }}>
                                                {s.motivo ? <div><strong>Motivo: </strong>{s.motivo}</div> : null}
                                                {s.destino ? <div><strong>Destino: </strong>{s.destino}</div> : null}
                                                {s.coveiro ? <div><strong>Coveiro: </strong>{s.coveiro}</div> : null}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card >
    );
}