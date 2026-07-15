import React, { useState, useMemo, useEffect } from "react";
import { formatDateDMY, formatDateKey, formatDateNormalized, parseDateValue } from "../../../utils/date";
import { resolveQuadraDisplay } from "../../../utils";
import { Card, Subtitle, CardHeader, CardBody, CalendarGrid, DayCell, DayButton, Btn } from "./styles";
import DefaultModal, { DefaultModalActions } from "../DefaultModal";
import SystemButton from "../SystemButton";
import { getCalendarEventKey } from "./utils";

const hasTimePart = (value) => /(?:T|\s)\d{2}:\d{2}/.test(String(value ?? "").trim());

const formatTimeLabel = (value) => {
    if (!hasTimePart(value)) return "";

    const date = parseDateValue(value);
    if (!date) return "";

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export default function Calendar({ sepultamentos = [], quadras = [], exumacoes = [] }) {
    const hoje = new Date();
    const [anoMes, setAnoMes] = useState({ year: hoje.getFullYear(), month: hoje.getMonth() });
    const [open, setOpen] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [sepultamentosDia, setSepultamentosDia] = useState([]);

    const eventosFonte = useMemo(() => {
        const normalizeSep = (s, sourceIndex) => ({
            _type: "Sepultamento",
            id: s.id ?? s._id,
            sourceIndex,
            nome: s.nome_sep,
            rawDate: s.dh_sep,
            quadraCandidate: s.num_quadra ?? s.quadra_sep,
            cova: s.num_sepultura_sep,
            status: s.status,
            extra: {},
        });

        const normalizeExu = (x, sourceIndex) => ({
            _type: "Exumação",
            id: x.id,
            sourceIndex,
            nome: x.nome_sep,
            rawDate: x.dh_exu,
            quadraCandidate: x.quadra_sep ?? x.num_quadra,
            cova: x.num_sepultura_sep,
            status: x.status ?? "",
            extra: { motivo: x.motivo, destino: x.destino, coveiro: x.coveiro },
        });

        const allNormalized = [...(sepultamentos || []).map(normalizeSep), ...(exumacoes || []).map(normalizeExu)];

        const mapped = allNormalized
            .map((item) => {
                const data = formatDateKey(item.rawDate);
                const horario = formatTimeLabel(item.rawDate);
                const dataLabel = formatDateDMY(item.rawDate, "");
                const dataHoraLabel = formatDateNormalized(item.rawDate, dataLabel);

                const quadraRef = item.quadraCandidate ?? "";
                return {
                    id: getCalendarEventKey(item._type, item.id, item.sourceIndex),
                    nomeFalecido: item.nome,
                    data,
                    dataLabel,
                    dataHoraLabel,
                    horario,
                    quadra: resolveQuadraDisplay(quadraRef, quadras, "Sem número"),
                    cova: item.cova,
                    status: item.status,
                    tipo: item._type,
                    ...item.extra,
                };
            })
            .filter((e) => !!e.data)
            .sort((a, b) => {
                if (a.data != b.data) return String(a.data).localeCompare(String(b.data));

                const ha = String(a.horario || "");
                const hb = String(b.horario || "");
                const timeCmp = ha.localeCompare(hb);
                if (timeCmp !== 0) return timeCmp;

                const priority = (tipo) => (tipo === "Sepultamento" ? 0 : tipo === "Exumação" ? 1 : 2);
                const pa = priority(a.tipo);
                const pb = priority(b.tipo);
                if (pa !== pb) return pa - pb;

                return String(a.nomeFalecido || "").localeCompare(String(b.nomeFalecido || ""));
            });

        return mapped;
    }, [sepultamentos, exumacoes, quadras]);

    const eventosPorData = useMemo(() => {
        const map = {};
        eventosFonte.forEach((s) => {
            map[s.data] = map[s.data] || [];
            map[s.data].push(s);
        });

        const priority = (tipo) => (tipo === "Sepultamento" ? 0 : tipo === "Exumação" ? 1 : 2);
        Object.keys(map).forEach((k) => {
            map[k].sort((a, b) => {
                const pa = priority(a.tipo);
                const pb = priority(b.tipo);
                if (pa != pb) return pa - pb;
                const ha = String(a.horario || "");
                const hb = String(b.horario || "");
                const timeCmp = ha.localeCompare(hb);
                if (timeCmp !== 0) return timeCmp;
                return String(a.nomeFalecido || "").localeCompare(String(b.nomeFalecido || ""));
            });
        });
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

    const voltarMes = () =>
        setAnoMes((s) => {
            const m = s.month - 1;
            if (m < 0) return { year: s.year - 1, month: 11 };
            return { year: s.year, month: m };
        });
    const avancarMes = () =>
        setAnoMes((s) => {
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
    const nomesMes = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    return (
        <Card style={{ marginTop: 16 }}>
            <CardHeader>Calendário</CardHeader>
            <Subtitle>Registros de sepultamentos e exumações realizadas.</Subtitle>
            <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: 600 }}>
                            {nomesMes[anoMes.month]} {anoMes.year}
                        </div>
                        <Btn onClick={voltarMes} aria-label="Mês anterior">
                            ◀
                        </Btn>
                        <Btn onClick={avancarMes} aria-label="Próximo mês">
                            ▶
                        </Btn>
                    </div>
                </div>

                <CalendarGrid>
                    {nomesSemana.map((n) => (
                        <div key={n} style={{ textAlign: "center", fontWeight: 600 }}>
                            {n}
                        </div>
                    ))}
                    {semanasDoMes.map((sem, i) => (
                        <React.Fragment key={i}>
                            {sem.map((dia, idx) => {
                                const key = formatDateKey(dia);
                                const eventos = key ? eventosPorData[key] || [] : [];
                                return (
                                    <DayCell key={key ?? `${i}-${idx}`} $isCurrentMonth={!!dia}>
                                        {dia ? (
                                            <DayButton
                                                onClick={() => abrirDia(dia)}
                                                aria-label={`Abrir ${key ?? `${i}-${idx}`}`}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{ fontWeight: 600 }}>{dia.getDate()}</div>
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                                                    {eventos.slice(0, 2).map((e) => {
                                                        const tipoCor = e.tipo === "Exumação" ? "#d97706" : "#191970";
                                                        const labelTipo = e.tipo || "Sepult.";
                                                        return (
                                                            <div
                                                                key={e.id}
                                                                style={{
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                }}
                                                            >
                                                                {e.nomeFalecido}{" "}
                                                                <span
                                                                    style={{
                                                                        color: tipoCor,
                                                                        marginLeft: 6,
                                                                        fontSize: 11,
                                                                    }}
                                                                >
                                                                    ⦿ {labelTipo}
                                                                </span>
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

                <DefaultModal
                    open={open}
                    title={`Sepultamentos e exumações em ${formatDateDMY(dataSelecionada, "-")}`}
                    width="560px"
                    onClose={() => setOpen(false)}
                >
                    <div style={{ marginTop: 12 }}>
                        {sepultamentosDia.length === 0 ? (
                            <div style={{ color: "#666" }}>Nenhum sepultamento ou exumação registrado neste dia.</div>
                        ) : (
                            sepultamentosDia.map((s) => (
                                <div
                                    key={
                                        s.id ?? s._id ?? `${formatDateDMY(dataSelecionada, "-")}-${s.quadra}-${s.cova}`
                                    }
                                    style={{ marginTop: 8, padding: 8, background: "#f8f9fb", borderRadius: 6 }}
                                >
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontWeight: 700 }}>{s.nomeFalecido}</div>
                                        {s.dataHoraLabel ? (
                                            <div style={{ color: "#555" }}>
                                                {s.tipo === "Exumação"
                                                    ? `Data/Hora da exumação: ${s.dataHoraLabel}`
                                                    : `Data/Hora do sepultamento: ${s.dataHoraLabel}`}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div style={{ color: "#555" }}>
                                        Quadra: {s.quadra} • Cova: {s.cova}
                                    </div>
                                    <div style={{ marginTop: 6, fontSize: 12, color: "#333" }}>
                                        {String(s.status)}
                                        {s.reservada ? " • Particular" : ""}
                                    </div>

                                    {s.tipo === "Exumação" && (
                                        <div style={{ marginTop: 8, padding: 8, background: "#fff", borderRadius: 6 }}>
                                            {s.motivo ? (
                                                <div>
                                                    <strong>Motivo: </strong>
                                                    {s.motivo}
                                                </div>
                                            ) : null}
                                            {s.destino ? (
                                                <div>
                                                    <strong>Destino: </strong>
                                                    {s.destino}
                                                </div>
                                            ) : null}
                                            {s.coveiro ? (
                                                <div>
                                                    <strong>Coveiro: </strong>
                                                    {s.coveiro}
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <DefaultModalActions>
                        <SystemButton type="button" tone="cancel" onClick={() => setOpen(false)}>
                            Fechar
                        </SystemButton>
                    </DefaultModalActions>
                </DefaultModal>
            </CardBody>
        </Card>
    );
}
