import api from "../../../services/index.js";
import { Card, CardBody, CardHeader, DashboardWrapper } from "./styles";
import React, { useState, useMemo, useEffect } from "react";


export default function SepultadosMes() {

    const [sepultamentos, setSepultamentos] = useState([]);
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

    const totalThisMonth = useMemo(() => {
        if (!sepultamentos || sepultamentos.length === 0) return 0;
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return sepultamentos.reduce((acc, it) => {
            if (!it?.dh_sep) return acc;
            const d = new Date(it.dh_sep);
            const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return itemDay >= start ? acc + 1 : acc;
        }, 0)
    }, [sepultamentos])



    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>Número de sepultados no mês atual:

                    {loading ? (
                        <div style={{ padding: 12, color: "#666" }}>Carregando...</div>
                    ) : (
                        <div style={{ padding: 5, fontSize: 18, fontWeight: 600, color: "#000" }}>
                            {totalThisMonth} 
                        </div>
                    )}

                </CardHeader>
            </Card>
        </DashboardWrapper>
    )
}
