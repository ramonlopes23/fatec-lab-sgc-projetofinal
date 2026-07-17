import React, { useEffect, useState } from "react";
import { FaCross, FaSkullCrossbones, FaTools } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useOperationalInbox } from "../../../../hooks";
import {
    buildOperationalProcesses,
    formatDateNormalized,
    getFalecidoName,
    getOperationalProcessKey,
    sortOperationalProcesses,
} from "../../../../utils";
import SystemButton from "../../../common/SystemButton";
import {
    DashboardCard as Card,
    DashboardCardBody as CardBody,
    DashboardCardHeader as CardHeader,
    DashboardCardTitle as CardTitle,
} from "../styles";
import {
    CountBadge,
    EmptyState,
    ProcessAction,
    ProcessInfo,
    ProcessItem,
    ProcessList,
    ProcessMetadata,
    ProcessTitle,
    StatIcon,
    StatusMessage,
} from "./styles";

const PROCESS_ICONS = {
    Sepultamento: <FaCross aria-hidden="true" />,
    Exumação: <FaSkullCrossbones aria-hidden="true" />,
    Velório: <LuBellRing aria-hidden="true" />,
    Manutenção: <FaTools aria-hidden="true" />,
};

const getProcessDate = (process) =>
    process.dh_inicio_velorio ||
    process.data_velorio ||
    process.dh_sep ||
    process.dh_exu ||
    process.data ||
    process.horario ||
    "";

const getProcessTitle = (process) => {
    if (process._type === "Sepultamento") return "Confirmar conclusão de sepultamento";
    if (process._type === "Exumação") return "Confirmar conclusão de exumação";
    if (process._type === "Velório") return "Confirmar conclusão de velório";
    return `Concluir ${String(process._type || "processo").toLowerCase()}`;
};

export default function OperationalInbox({ dashboardData = {} }) {
    const {
        falecidos = [],
        sepultamentos = [],
        velorios = [],
        exumacoes = [],
        blocks = [],
        loading = false,
        error = null,
        reload = async () => null,
    } = dashboardData;
    const [processes, setProcesses] = useState([]);
    const { confirmProcess, confirmingKey, isConfirming, ToastElement } = useOperationalInbox({ reload });

    useEffect(() => {
        setProcesses(buildOperationalProcesses({ falecidos, sepultamentos, velorios, exumacoes, blocks }));
    }, [blocks, exumacoes, falecidos, sepultamentos, velorios]);

    useEffect(() => {
        window._loadDashboardProcessos = reload;

        try {
            const saved = JSON.parse(localStorage.getItem("local_processos") || "[]");
            if (Array.isArray(saved) && saved.length) setProcesses((current) => [...saved, ...current]);
        } catch (localStorageError) {
            console.warn("Erro ao ler processos locais", localStorageError);
        }

        const refreshFromEvent = (event) => {
            if (!event?.detail || event.detail._origin === "operational-inbox") return;
            reload();
        };

        window.addEventListener("processoCriado", refreshFromEvent);
        window.addEventListener("processoCriadoLocal", refreshFromEvent);

        return () => {
            window.removeEventListener("processoCriado", refreshFromEvent);
            window.removeEventListener("processoCriadoLocal", refreshFromEvent);
            if (window._loadDashboardProcessos === reload) delete window._loadDashboardProcessos;
        };
    }, [reload]);

    const pendingProcesses = sortOperationalProcesses(processes);

    return (
        <Card aria-busy={loading || isConfirming}>
            {ToastElement}
            <CardHeader>
                <CardTitle>Inbox operacional</CardTitle>
                <CountBadge aria-label={`${pendingProcesses.length} pendências`}>{pendingProcesses.length}</CountBadge>
            </CardHeader>
            <CardBody>
                {error ? <StatusMessage role="status">Alguns dados não puderam ser carregados.</StatusMessage> : null}
                {loading && pendingProcesses.length === 0 ? (
                    <EmptyState>Carregando pendências operacionais...</EmptyState>
                ) : pendingProcesses.length ? (
                    <ProcessList>
                        {pendingProcesses.map((process) => {
                            const processKey = getOperationalProcessKey(process);
                            const isCurrentProcess = confirmingKey === processKey;
                            const dateLabel = formatDateNormalized(getProcessDate(process), "Data não informada");
                            const deceasedName =
                                getFalecidoName(process) || process.nome || "Falecido não identificado";

                            return (
                                <ProcessItem key={processKey}>
                                    <StatIcon $tone="success">
                                        {PROCESS_ICONS[process._type] || <FaTools aria-hidden="true" />}
                                    </StatIcon>
                                    <ProcessInfo>
                                        <ProcessTitle>{getProcessTitle(process)}</ProcessTitle>
                                        <ProcessMetadata>
                                            {deceasedName} • {dateLabel}
                                        </ProcessMetadata>
                                        {process._type === "Sepultamento" &&
                                        (process.quadra_num || process.num_sepultura) ? (
                                            <ProcessMetadata>
                                                {process.quadra_num ? `Quadra ${process.quadra_num}` : ""}
                                                {process.quadra_num && process.num_sepultura ? " • " : ""}
                                                {process.num_sepultura ? `Sepultura ${process.num_sepultura}` : ""}
                                            </ProcessMetadata>
                                        ) : null}
                                        {process.local ? <ProcessMetadata>{process.local}</ProcessMetadata> : null}
                                    </ProcessInfo>
                                    <ProcessAction>
                                        <SystemButton
                                            type="button"
                                            disabled={isConfirming}
                                            aria-label={`${getProcessTitle(process)} de ${deceasedName}`}
                                            onClick={() => confirmProcess(process)}
                                            sx={{ minWidth: 116, minHeight: 36, px: 2, boxShadow: "none" }}
                                        >
                                            {isCurrentProcess ? "Confirmando..." : "Confirmar"}
                                        </SystemButton>
                                    </ProcessAction>
                                </ProcessItem>
                            );
                        })}
                    </ProcessList>
                ) : (
                    <EmptyState>Nenhuma pendência operacional.</EmptyState>
                )}
            </CardBody>
        </Card>
    );
}
