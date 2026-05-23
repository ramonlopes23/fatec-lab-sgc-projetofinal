import React, { useMemo } from "react";
import { FaFileContract } from "react-icons/fa";
import { Card, CardHeader, CardBody, ProcessItem, ProcessInfo, ProcessAction, ProcessType, EmptyState } from "./styles";
import { formatDateDMY, parseDateValue } from "../../utils/date";

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeText = (value) => String(value || "").trim().toLowerCase();

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

const buildContractAlert = (contract) => {
    const daysLeft = getDaysUntil(contract?.validade_titulo);
    if (daysLeft === null || daysLeft < 0 || daysLeft >= 30) return null;

    const status = normalizeText(contract?.status);
    if (status && !status.includes("ativo") && !status.includes("active")) return null;

    return {
        id: contract?.id,
        titular: contract?.nome_titular || "-",
        titulo: contract?.numero_titulo || "-",
        validade: formatDateDMY(contract?.validade_titulo, "-"),
        local: [contract?.cemiterio, contract?.quadra ? `Quadra ${contract.quadra}` : "", contract?.sepultura ? `Sepultura ${contract.sepultura}` : ""]
            .filter(Boolean)
            .join(" • ") || "-",
        contato: contract?.nome_titular || "-",
        daysLeft,
    };
};

export default function ContractExpiryCard({ contratos = [] }) {
    const items = useMemo(() => (
        contratos
            .map(buildContractAlert)
            .filter(Boolean)
            .sort((a, b) => a.daysLeft - b.daysLeft)
    ), [contratos]);

    return (
        <Card>
            <CardHeader>Vigência de títulos de posse / contratos</CardHeader>
            <CardBody>
                {items.length ? items.map((item) => (
                    <ProcessItem key={String(item.id)}>
                        <ProcessInfo>
                            <strong>{item.titular}</strong>
                            <span>Título: {item.titulo}</span>
                            <span>Vencimento: {item.validade}</span>
                            <span>Responsável para contato: {item.contato}</span>
                        </ProcessInfo>
                        <ProcessAction>
                            <ProcessType>
                                <FaFileContract />
                                {item.daysLeft === 0 ? "Vence hoje" : `${item.daysLeft} dia(s)`}
                            </ProcessType>
                            <span>{item.local}</span>
                        </ProcessAction>
                    </ProcessItem>
                )) : <EmptyState>Não há contratos próximos de vencimento.</EmptyState>}
            </CardBody>
        </Card>
    );
}
