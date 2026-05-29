import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const DEFAULT_COLORS = ["#6f63ff", "#5ec58f", "#ffb05e"];

export default function RelatoriosTipoSepultamentoPie({ data = [], loading = false }) {
    if (loading) {
        return <div style={{ padding: 16, color: "#666" }}>Carregando gráfico...</div>;
    }

    if (!data.length) {
        return <div style={{ padding: 16, color: "#666" }}>Sem dados para o período selecionado.</div>;
    }

    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${entry.key || index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name) => [
                        `${value} (${total ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
                        name,
                    ]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #dbe1f2", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}
                />
                <Legend verticalAlign="bottom" height={40} iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
}
