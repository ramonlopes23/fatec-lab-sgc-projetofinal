import { getSepultamentos } from "../../../services/sepultamentoService.js";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardBody, CardHeader, DashboardWrapper } from "./styles";

export default function SepultadosTotal() {
    const [sepultamentos, setSepultamentos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getSepultamentos()
            .then((data) => {
                if (!mounted) return;
                setSepultamentos(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!mounted) return;
                setSepultamentos([]);
            })
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, []);

    const total = useMemo(() => (sepultamentos || []).length, [sepultamentos]);

    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>
                    {" "}
                    Número total de sepultados:{" "}
                    {loading ? (
                        <div style={{ padding: 12, color: "#666" }}>Carregando...</div>
                    ) : (
                        <div style={{ padding: 5, fontSize: 18, fontWeight: 600, color: "#000" }}>{total}</div>
                    )}
                </CardHeader>
            </Card>
        </DashboardWrapper>
    );
}
