import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowRight, LuCalendarDays } from "react-icons/lu";
import { buildCalendarEvents, getCalendarEventsForDate } from "../../../../utils";
import SystemButton from "../../../common/SystemButton";
import { DashboardCard, DashboardCardBody, DashboardCardHeader, DashboardCardTitle } from "../styles";
import {
    AgendaFooter,
    AgendaList,
    EmptyState,
    EventDetails,
    EventLocation,
    EventName,
    EventRow,
    EventStatus,
    EventTime,
    TimelineMarker,
    TimelineRail,
} from "./styles";

export default function OperationalAgenda({ dashboardData = {} }) {
    const navigate = useNavigate();
    const {
        sepultamentos = [],
        exumacoes = [],
        blocks = [],
        selectedCemeteryId = null,
        loading = false,
    } = dashboardData;

    const todayEvents = useMemo(() => {
        const events = getCalendarEventsForDate(
            buildCalendarEvents({ sepultamentos, exumacoes, quadras: blocks }),
            new Date()
        );
        if (selectedCemeteryId == null || selectedCemeteryId === "") return events;
        return events.filter((event) => String(event.cemeteryId) === String(selectedCemeteryId));
    }, [blocks, exumacoes, selectedCemeteryId, sepultamentos]);

    return (
        <DashboardCard aria-busy={loading}>
            <DashboardCardHeader>
                <LuCalendarDays aria-hidden="true" />
                <DashboardCardTitle>Agenda de hoje</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardBody>
                {loading && todayEvents.length === 0 ? (
                    <EmptyState>Carregando agenda operacional...</EmptyState>
                ) : todayEvents.length ? (
                    <AgendaList>
                        {todayEvents.map((event, index) => (
                            <EventRow key={event.id}>
                                <EventTime>{event.horario || "—"}</EventTime>
                                <TimelineRail>
                                    <TimelineMarker $type={event.tipo} />
                                    {index < todayEvents.length - 1 ? <span aria-hidden="true" /> : null}
                                </TimelineRail>
                                <EventDetails>
                                    <EventName>{event.tipo}</EventName>
                                    <span>{event.nomeFalecido || "Falecido não identificado"}</span>
                                    <EventLocation>
                                        {event.quadra ? `Quadra ${event.quadra}` : "Quadra não informada"}
                                        {event.cova ? ` • Sepultura ${event.cova}` : ""}
                                    </EventLocation>
                                </EventDetails>
                                <EventStatus $status={event.statusKey}>{event.statusLabel}</EventStatus>
                            </EventRow>
                        ))}
                    </AgendaList>
                ) : (
                    <EmptyState>Nenhum evento agendado para hoje.</EmptyState>
                )}
                <AgendaFooter>
                    <SystemButton
                        type="button"
                        tone="cancel"
                        onClick={() => navigate("/calendario")}
                        sx={{ minHeight: 36, px: 2, boxShadow: "none" }}
                    >
                        Ver calendário completo <LuArrowRight aria-hidden="true" />
                    </SystemButton>
                </AgendaFooter>
            </DashboardCardBody>
        </DashboardCard>
    );
}
