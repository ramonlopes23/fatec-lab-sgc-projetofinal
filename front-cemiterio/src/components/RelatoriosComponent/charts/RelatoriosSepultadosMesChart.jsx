import React from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function RelatoriosSepultadosMesChart({ data = [], loading = false }) {
    if (loading) {
        return <div style={{ padding: 16, color: "#666" }}>Carregando gráfico...</div>;
    }

    if (!data.length) {
        return <div style={{ padding: 16, color: "#666" }}>Sem dados para o período selecionado.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecf5" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                    cursor={{ fill: "rgba(25,25,112,0.05)" }}
                    formatter={(value) => [value, "Sepultamentos"]}
                    labelStyle={{ color: "#191970", fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #dbe1f2", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}
                />
                <Bar dataKey="value" fill="#6f63ff" radius={[8, 8, 0, 0]} barSize={22} />
            </BarChart>
        </ResponsiveContainer>
    );
}
