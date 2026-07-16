import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { getGraves } from "../../../services/graveService.js";
import { useEffect, useState, useRef, useMemo } from "react";

const PIE_SERIES = [
    { key: "disponivel", label: "Disponível", color: "#9e9e9e" },
    { key: "ocupada", label: "Ocupada", color: "#000" },
    { key: "indisponivel", label: "Indisponível", color: "#c55" },
    { key: "particular", label: "Particular", color: "#d2b24a" },
    { key: "particular_ocupada", label: "P/O", color: "#000", borderColor: "#d2b24a", borderWidth: 4 },
];

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function normalizeBackendStatus(grave) {
    const backendStatus = String(grave?.status ?? "").toUpperCase();
    const areaType = String(grave?.areaType ?? grave?.area_type ?? "").toUpperCase();
    const isBlocked = grave?.blocked === true;

    if (isBlocked || backendStatus === "MAINTENANCE") {
        return "indisponivel";
    }

    if (backendStatus === "OCCUPIED") {
        return areaType === "PERPETUAL" ? "particular_ocupada" : "ocupada";
    }

    if (areaType === "PERPETUAL") {
        return "particular";
    }

    return "disponivel";
}

export default function PieChartSepulturas() {
    const [graves, setGraves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [animFactor, setAnimFactor] = useState(1);
    const animFactorRef = useRef(1);
    const rafRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        getGraves()
            .then((raw) => {
                if (!mounted) return;

                const list = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.content)
                      ? raw.content
                      : Array.isArray(raw?.data)
                        ? raw.data
                        : [];

                setGraves(list);
            })
            .catch((err) => {
                if (!mounted) return;
                console.error("Erro ao carregar dados do gráfico:", err);
                setGraves([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const data = useMemo(() => {
        const counts = {
            disponivel: 0,
            ocupada: 0,
            indisponivel: 0,
            particular: 0,
            particular_ocupada: 0,
        };

        (graves || []).forEach((grave) => {
            const bucket = normalizeBackendStatus(grave);
            counts[bucket] += 1;
        });

        return PIE_SERIES.map((item) => ({
            status: item.label,
            key: item.key,
            value: counts[item.key] ?? 0,
        }));
    }, [graves]);

    useEffect(() => {
        animFactorRef.current = animFactor;
    }, [animFactor]);

    useEffect(() => {
        cancelAnimationFrame(rafRef.current);
        const from = animFactorRef.current;
        const to = activeIndex === null ? 1 : 1.2;
        const duration = 220;
        const startTime = performance.now();

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const v = from + (to - from) * easeOutCubic(t);
            setAnimFactor(v);
            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        }

        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [activeIndex]);

    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

    function renderActiveShape(props) {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

        const animatedOuter = outerRadius * animFactor;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius + 10}
                    outerRadius={animatedOuter + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />

                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={animatedOuter + 6}
                    outerRadius={animatedOuter + 12}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={"rgba(0,0,0,0.06)"}
                />

                <text x={cx} y={cy - 8} textAnchor="middle" fill="#111" fontSize={12} fontWeight={600}>
                    {payload.status}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#333" fontSize={12}>
                    {value} ({(percent * 100).toFixed(1)}%)
                </text>
            </g>
        );
    }

    if (loading) {
        return (
            <div
                style={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <p style={{ color: "#666" }}>Carregando...</p>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <PieChart width={400} height={400}>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        innerRadius={40}
                        paddingAngle={2}
                        label={false}
                        activeIndex={activeIndex ?? undefined}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {data.map((entry, index) => {
                            const colorEntry = PIE_SERIES[index % PIE_SERIES.length];
                            return colorEntry.borderColor ? (
                                <Cell
                                    key={entry.key}
                                    fill={colorEntry.color}
                                    stroke={colorEntry.borderColor}
                                    strokeWidth={colorEntry.borderWidth}
                                />
                            ) : (
                                <Cell key={entry.key} fill={colorEntry.color} />
                            );
                        })}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} (${((value / total) * 100).toFixed(1)}%)`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
