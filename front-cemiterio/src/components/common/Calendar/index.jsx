import React, { useState, useMemo, useEffect } from "react";
import { buildCalendarEvents, formatDateDMY, formatDateKey, groupCalendarEventsByDate } from "../../../utils";
import { Card, Subtitle, CardHeader, CardBody, CalendarGrid, DayCell, DayButton, Btn } from "./styles";
import DefaultModal, { DefaultModalActions } from "../DefaultModal";
import SystemButton from "../SystemButton";

export default function Calendar({ sepultamentos = [], quadras = [], exumacoes = [] }) {
    const hoje = new Date();
    const [anoMes, setAnoMes] = useState({ year: hoje.getFullYear(), month: hoje.getMonth() });
    const [open, setOpen] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [sepultamentosDia, setSepultamentosDia] = useState([]);

    const eventosFonte = useMemo(
        () => buildCalendarEvents({ sepultamentos, exumacoes, quadras }),
        [sepultamentos, exumacoes, quadras]
    );

    const eventosPorData = useMemo(() => groupCalendarEventsByDate(eventosFonte), [eventosFonte]);

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
