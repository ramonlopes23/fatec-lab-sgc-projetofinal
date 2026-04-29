import api from "../../services/index.js";
import { Card, CardBody, CardHeader, DashboardWrapper, ChartWrapper, Controls, PeriodButton } from "./styles";
import React, { useMemo, useEffect, useState } from "react";
import {Bar} from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const periodos = [
    { key: 7, label: "Última semana" },
    { key: 15, label: "Últimos 15 dias" },
    { key: 30, label: "Últimos 30 dias" },
];

function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatLabel(d) {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}


export default function SepultadosMedia() {
    const [sepultamentos, setSepultamentos] = useState([]);
    const [period, setPeriod] = useState(7);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api.get("/sepultamentos").then((res) => {
            if (!mounted) return;
            setSepultamentos(Array.isArray(res.data) ? res.data : []);
        }).catch(() => {
            if (!mounted) return;
            setSepultamentos([]);
        }).finally(() => mounted && setLoading(false));
        return () => (mounted = false);

    }, []);

    const { labels, counts, avg } = useMemo(() => {
        const days = Number(period) || 7;
        const today = startOfDay(new Date());
        const labelsArr = [];
        for (let i = days - 1; i >= 0; i--) {
            const dt = new Date(today);
            dt.setDate(today.getDate() - i);
            labelsArr.push(dt);
        }

        const countsArr = labelsArr.map((labelDate) => {
            const count = sepultamentos.reduce((acc, it) => {
                if (!it?.dh_sep) return acc;
                const d = new Date(it.dh_sep);
                const itemDay = startOfDay(d);
                return itemDay.getTime() === labelDate.getTime() ? acc + 1 : acc;
            }, 0);
            return count;
        });

        const sum = countsArr.reduce((a, b)=>a + b, 0);
        const average = countsArr.length ? sum / countsArr.length : 0;

        return{
            labels:labelsArr.map(formatLabel),
            counts:countsArr,
            avg:average,
        };
    },[sepultamentos, period]);

    const data = useMemo(()=>{
        return {
            labels,
            datasets: [
                {
                    label: "Sepultamentos",
                    data: counts,
                    backgroundColor: "#191970",
                    borderRadius: 6,
                },
            ],
        };

    }, [labels, counts]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    const formatAvg = (v) => new Intl.NumberFormat("pt-BR", {minimumFractionDigits: 1, maximumFractionDigits:1}).format(v);

    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>
                    Média de sepultamentos: {formatAvg(avg)} / dia
                </CardHeader>
                <CardBody >
                    <Controls>
                        {periodos.map((p) => (
                            <PeriodButton key={p.key} type="button" onClick={() => setPeriod(p.key)} $active={p.key === period} aria-pressed={p.key === period}>
                                {p.label}
                            </PeriodButton>
                        ))}
                    </Controls>

                    <ChartWrapper>
                        {loading ? (
                            <div style={{ padding: 12, color: "#666" }}>
                                Carregando...
                            </div>
                        ) : sepultamentos.length === 0 ? (
                            <div style={{ padding: 12, color: "#666" }}>
                                Nenhum sepultamento.
                            </div>
                        ) : (
                            <Bar data={data} options={options} />
                        )}
                    </ChartWrapper>
                </CardBody>
            </Card>
        </DashboardWrapper>
    )
}