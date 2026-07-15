import React, { useEffect, useState } from "react";
import Calendar from "../../components/common/Calendar";
import LoadingOverlay from "../../components/common/LoadingOverlay";

export default function Calendario() {
    const [sepultamentos, setSepultamentos] = useState([]);
    const [exumacoes, setExumacoes] = useState([]);
    const [quadras, setQuadras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("/db.json")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                setSepultamentos(data.sepultamentos || []);
                setExumacoes(data.exumacoes || []);
                setQuadras(data.quadras || []);
            })
            .catch((err) => {
                console.warn("Erro ao carregar db.json", err);
                setError(err);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {loading ? (
                <LoadingOverlay open={loading} label="Carregando calendário..." />
            ) : error ? (
                <div>Erro ao carregar dados do calendário.</div>
            ) : (
                <Calendar sepultamentos={sepultamentos} exumacoes={exumacoes} quadras={quadras} />
            )}
        </div>
    );
}
