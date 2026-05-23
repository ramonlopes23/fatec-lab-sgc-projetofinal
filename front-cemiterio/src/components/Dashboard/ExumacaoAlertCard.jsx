import React, { useMemo } from "react";
import { FaSkullCrossbones } from "react-icons/fa";
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

const buildExumacaoAlert = (sepultamento, falecidos) => {
    if (!sepultamento || sepultamento.foi_exumado === true || !isConfirmedSepultamento(sepultamento)) return null;

    const sepultamentoDate = parseDateValue(sepultamento?.dh_sep);
    if (!sepultamentoDate) return null;

    const deadline = new Date(sepultamentoDate);
    deadline.setFullYear(deadline.getFullYear() + 3);

    const daysLeft = getDaysUntil(deadline);
    if (daysLeft === null || daysLeft < 0 || daysLeft >= 30) return null;

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
    };
};

export default function ExumacaoAlertCard({ sepultamentos = [], falecidos = [] }) {
    const items = useMemo(() => (
        sepultamentos
            .map((sepultamento) => buildExumacaoAlert(sepultamento, falecidos))
            .filter(Boolean)
            .sort((a, b) => a.daysLeft - b.daysLeft)
    ), [falecidos, sepultamentos]);

    return (
        <Card>
            <CardHeader>Exumações próximas</CardHeader>
            <CardBody>
                {items.length ? items.map((item) => (
                    <ProcessItem key={String(item.id)}>
                        <ProcessInfo>
                            <strong>{item.nome}</strong>
                            <span>Sepultamento: {item.sepultamento}</span>
                            <span>Previsão de exumação: {item.exumacaoPrevista}</span>
                            <span>Responsável para contato: {item.responsavel}</span>
                        </ProcessInfo>
                        <ProcessAction>
                            <ProcessType>
                                <FaSkullCrossbones />
                                {item.daysLeft === 0 ? "Exumação hoje" : `${item.daysLeft} dia(s)`}
                            </ProcessType>
                            <span>{item.quadra ? `Quadra ${item.quadra}` : ""}{item.quadra && item.sepultura ? " • " : ""}{item.sepultura ? `Sepultura ${item.sepultura}` : ""}</span>
                        </ProcessAction>
                    </ProcessItem>
                )) : <EmptyState>Não há exumações próximas a serem realizadas.</EmptyState>}
            </CardBody>
        </Card>
    );
}
