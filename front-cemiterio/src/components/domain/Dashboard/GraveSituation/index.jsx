import React, { useMemo } from "react";
import { LuBadgeCheck, LuCircleCheck, LuMap, LuUsers } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { getGraveSituationCounts } from "../../../../utils";
import SystemButton from "../../../common/SystemButton";
import { DashboardCard, DashboardCardBody, DashboardCardHeader, DashboardCardTitle } from "../styles";
import {
    EmptyState,
    GraveFooter,
    SituationBody,
    SituationGrid,
    SituationHint,
    StatCard,
    StatCopy,
    StatIcon,
    StatLabel,
    StatValue,
} from "./styles";

const SITUATION_ITEMS = [
    { key: "available", label: "Disponíveis", icon: <LuCircleCheck aria-hidden="true" /> },
    { key: "occupied", label: "Ocupadas", icon: <LuUsers aria-hidden="true" /> },
    { key: "private", label: "Particulares", icon: <LuBadgeCheck aria-hidden="true" /> },
];

export default function GraveSituation({ dashboardData = {} }) {
    const navigate = useNavigate();
    const {
        graves = [],
        blocks = [],
        sepultamentos = [],
        pets = [],
        selectedCemeteryId = null,
        loading = false,
    } = dashboardData;

    const counts = useMemo(
        () =>
            getGraveSituationCounts({
                graves,
                blocks,
                sepultamentos,
                pets,
                selectedCemeteryId,
            }),
        [blocks, graves, pets, selectedCemeteryId, sepultamentos]
    );

    const hasSelectedCemetery = selectedCemeteryId != null && selectedCemeteryId !== "";

    return (
        <DashboardCard aria-busy={loading}>
            <DashboardCardHeader>
                <LuMap aria-hidden="true" />
                <DashboardCardTitle>Situação das sepulturas</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardBody>
                <SituationBody>
                    {loading && counts.total === 0 ? (
                        <EmptyState>Carregando situação das sepulturas...</EmptyState>
                    ) : !hasSelectedCemetery ? (
                        <EmptyState>Selecione um cemitério para visualizar as sepulturas.</EmptyState>
                    ) : counts.total === 0 ? (
                        <EmptyState>Nenhuma sepultura cadastrada neste cemitério.</EmptyState>
                    ) : (
                        <>
                            <SituationGrid>
                                {SITUATION_ITEMS.map(({ key, label, icon }) => (
                                    <StatCard key={key}>
                                        <StatIcon $tone="success">{icon}</StatIcon>
                                        <StatCopy>
                                            <StatValue>{counts[key]}</StatValue>
                                            <StatLabel>{label}</StatLabel>
                                        </StatCopy>
                                    </StatCard>
                                ))}
                            </SituationGrid>
                            <SituationHint>
                                {counts.total} sepulturas mapeadas
                                {counts.unavailable > 0 ? ` • ${counts.unavailable} indisponíveis` : ""}
                            </SituationHint>
                        </>
                    )}

                    <GraveFooter>
                        <SystemButton
                            type="button"
                            tone="cancel"
                            onClick={() => navigate("/vermapa")}
                            sx={{ minHeight: 36, px: 2, boxShadow: "none" }}
                        >
                            Ver mapa <LuMap aria-hidden="true" />
                        </SystemButton>
                    </GraveFooter>
                </SituationBody>
            </DashboardCardBody>
        </DashboardCard>
    );
}
