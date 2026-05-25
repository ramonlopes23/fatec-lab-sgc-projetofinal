import React, { useMemo } from "react";
import { FaSkullCrossbones } from "react-icons/fa";
import { TbFlowerFilled } from "react-icons/tb";
import { Card, CardHeader, CardBody, ProcessItem, ProcessInfo, ProcessAction, ProcessType, EmptyState } from "./styles";
import { formatDateDMY, parseDateValue } from "../../utils/date";

const DAY_MS = 24 * 60 * 60 * 1000;

const getDaysUntil = (deadline) => {
    const date = parseDateValue(deadline);
    if (!date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / DAY_MS);
};

const isConfirmedSepultamento = (sepultamento) => {
    const confirmed = sepultamento?.confirmado === true || String(sepultamento?.confirmado).toLowerCase() === "true";
    const concluded = String(sepultamento?.status ?? "").toLowerCase().includes("concl");
    return confirmed || concluded;
};

const buildStatusLabel = (daysLeft) => {
    if (daysLeft === null) return "Data inválida";
    if (daysLeft < 0) return "Prazo vencido";
    if (daysLeft <= 29) return "Em alerta";
    if (daysLeft <= 90) return "Próximo do prazo";
    return "Em acompanhamento";
};

const buildBadgeTone = (daysLeft) => {
    if (daysLeft === null) return "#5f637a";
    if (daysLeft < 0) return "#b42318";
    if (daysLeft <= 29) return "#b42318";
    if (daysLeft <= 90) return "#b26a00";
    return "#191970";
};

const buildExumacaoAlert = (sepultamento, falecidos) => {
    if (!sepultamento || sepultamento.foi_exumado === true || !isConfirmedSepultamento(sepultamento)) return null;

    const sepultamentoDate = parseDateValue(sepultamento?.dh_sep);
    if (!sepultamentoDate) return null;

    const deadline = new Date(sepultamentoDate);
    deadline.setFullYear(deadline.getFullYear() + 3);

    const daysLeft = getDaysUntil(deadline);
    if (daysLeft === null) return null;

    const fk = sepultamento?.falecido ?? sepultamento?.falecido_id ?? sepultamento?.falecidoId;
    const falecido = falecidos.find((item) => String(item?.id) === String(fk)) || null;

    const nomeResp = falecido?.nome_resp || sepultamento?.nome_resp || "-";
    const telResp = falecido?.tel_resp || sepultamento?.tel_resp || "";

    return {
        id: sepultamento?.id,
        nome: falecido?.nome_fal || sepultamento?.nome_sep || sepultamento?.nome || "-",
        sepultamento: formatDateDMY(sepultamento?.dh_sep, "-"),
        exumacaoPrevista: formatDateDMY(deadline, "-"),
        quadra: sepultamento?.quadra_sep || sepultamento?.quadra || "-",
        sepultura: sepultamento?.num_sepultura_sep || sepultamento?.num_sepultura || sepultamento?.numero || "-",
        responsavel: telResp ? `${nomeResp} • ${telResp}` : nomeResp,
        daysLeft,
        statusLabel: buildStatusLabel(daysLeft),
        badgeTone: buildBadgeTone(daysLeft),
    };
};

const formatDaysLeft = (daysLeft) => {
    if (daysLeft === null) return "--";
    if (daysLeft < 0) return `${Math.abs(daysLeft)} dia(s) em atraso`;
    if (daysLeft === 0) return "Hoje";
    return `${daysLeft} dia(s)`;
};

export default function ExumacaoAlertCard({ sepultamentos = [], falecidos = [] }) {
    const items = useMemo(() => (
        sepultamentos
            .map((sepultamento) => buildExumacaoAlert(sepultamento, falecidos))
            .filter(Boolean)
            .sort((a, b) => a.daysLeft - b.daysLeft)
    ), [falecidos, sepultamentos]);

    const alertItems = items.filter((item) => item.daysLeft <= 29);
    const forecastItems = items.filter((item) => item.daysLeft > 29);

    return (
        <Card>
            <CardHeader>Previsão de exumações</CardHeader>
            <CardBody>

                {items.length ? (
                    <>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(179, 36, 24, 0.12)", color: "#b42318", fontSize: 12, fontWeight: 700 }}>
                                {alertItems.length} em alerta
                            </span>
                            <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(25, 25, 112, 0.08)", color: "#191970", fontSize: 12, fontWeight: 700 }}>
                                {forecastItems.length} em acompanhamento
                            </span>
                        </div>

                        {items.map((item) => (
                            <ProcessItem key={String(item.id)} style={{ borderColor: item.daysLeft <= 29 ? "rgba(180, 35, 24, 0.25)" : "#e5e7eb", background: item.daysLeft <= 29 ? "#fff8f7" : "#ffffff" }}>
                                <ProcessInfo>
                                    <strong>{item.nome}</strong>
                                    <span>Sepultamento: {item.sepultamento}</span>
                                    <span>Previsão de exumação: {item.exumacaoPrevista}</span>
                                    <span>Responsável para contato: {item.responsavel}</span>
                                </ProcessInfo>
                                <ProcessAction>
                                    <ProcessType style={{ background: `${item.badgeTone}14`, color: item.badgeTone }}>
                                        <TbFlowerFilled />
                                        {item.statusLabel}
                                    </ProcessType>
                                    <span>{formatDaysLeft(item.daysLeft)}</span>
                                    <span>{item.quadra ? `Quadra ${item.quadra}` : ""}{item.quadra && item.sepultura ? " • " : ""}{item.sepultura ? `Sepultura ${item.sepultura}` : ""}</span>
                                </ProcessAction>
                            </ProcessItem>
                        ))}
                    </>
                ) : <EmptyState>Não há sepultamentos confirmados para calcular exumação.</EmptyState>}
            </CardBody>
        </Card>
    );
}
