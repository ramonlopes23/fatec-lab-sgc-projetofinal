import React, { useMemo, useState } from "react";
import { LuChartLine } from "react-icons/lu";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildDashboardMovementSeries } from "../../../../utils";
import SystemSelect from "../../../common/SystemSelect";
import { DashboardCard, DashboardCardBody, DashboardCardHeader, DashboardCardTitle } from "../styles";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendItem,
    EmptyState,
    HeaderContent,
    HeaderLabel,
    PeriodControl,
    Summary,
    SummaryItem,
} from "./styles";

const PERIOD_OPTIONS = [7, 15, 30];

export default function DashboardMovement({ dashboardData = {} }) {
    const [days, setDays] = useState(7);
    const {
        sepultamentos = [],
        exumacoes = [],
        blocks = [],
        selectedCemeteryId = null,
        loading = false,
    } = dashboardData;

    const { chartData, sepultamentosTotal, exumacoesTotal } = useMemo(() => {
        const series = buildDashboardMovementSeries({
            sepultamentos,
            exumacoes,
            blocks,
            selectedCemeteryId,
            days,
        });
        return {
            chartData: series.labels.map((label, index) => ({
                label,
                sepultamentos: series.sepultamentos[index],
                exumacoes: series.exumacoes[index],
            })),
            sepultamentosTotal: series.sepultamentos.reduce((total, value) => total + value, 0),
            exumacoesTotal: series.exumacoes.reduce((total, value) => total + value, 0),
        };
    }, [blocks, days, exumacoes, selectedCemeteryId, sepultamentos]);

    const hasMovement = sepultamentosTotal > 0 || exumacoesTotal > 0;

    return (
        <DashboardCard aria-busy={loading}>
            <DashboardCardHeader>
                <HeaderContent>
                    <HeaderLabel>
                        <LuChartLine aria-hidden="true" />
                        <DashboardCardTitle>Movimentação operacional</DashboardCardTitle>
                    </HeaderLabel>
                    <PeriodControl>
                        <span>Período</span>
                        <SystemSelect
                            aria-label="Período da movimentação operacional"
                            value={days}
                            onChange={(event) => setDays(Number(event.target.value))}
                        >
                            {PERIOD_OPTIONS.map((period) => (
                                <option key={period} value={period}>
                                    Últimos {period} dias
                                </option>
                            ))}
                        </SystemSelect>
                    </PeriodControl>
                </HeaderContent>
            </DashboardCardHeader>
            <DashboardCardBody>
                <Summary>
                    <SummaryItem $tone="primary">
                        <strong>{sepultamentosTotal}</strong>
                        <span>Sepultamentos</span>
                    </SummaryItem>
                    <SummaryItem $tone="warning">
                        <strong>{exumacoesTotal}</strong>
                        <span>Exumações</span>
                    </SummaryItem>
                    <ChartLegend aria-label="Legenda do gráfico">
                        <ChartLegendItem $tone="primary">Sepultamentos</ChartLegendItem>
                        <ChartLegendItem $tone="warning">Exumações</ChartLegendItem>
                    </ChartLegend>
                </Summary>

                <ChartContainer>
                    {loading && !hasMovement ? (
                        <EmptyState>Carregando movimentações...</EmptyState>
                    ) : !hasMovement ? (
                        <EmptyState>Nenhuma movimentação registrada no período.</EmptyState>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="dashboardBurials" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.24} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="dashboardExhumations" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(25,25,112,0.1)" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                    minTickGap={12}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6b7280", fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        value,
                                        name === "sepultamentos" ? "Sepultamentos" : "Exumações",
                                    ]}
                                    labelStyle={{ color: "#191970", fontWeight: 700 }}
                                    contentStyle={{
                                        border: "1px solid rgba(25,25,112,0.14)",
                                        borderRadius: 12,
                                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sepultamentos"
                                    stroke="#4f46e5"
                                    strokeWidth={2.5}
                                    fill="url(#dashboardBurials)"
                                    activeDot={{ r: 5 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="exumacoes"
                                    stroke="#f97316"
                                    strokeWidth={2.5}
                                    fill="url(#dashboardExhumations)"
                                    activeDot={{ r: 5 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartContainer>
            </DashboardCardBody>
        </DashboardCard>
    );
}
