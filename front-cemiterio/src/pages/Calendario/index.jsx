import React, { useEffect, useState } from "react";
import Calendar from "../../components/common/Calendar";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { getBlocks } from "../../services/blockService";
import { getExumacoes } from "../../services/exumacaoService";
import { getSepultamentos } from "../../services/sepultamentoService";

export default function Calendario() {
    const [sepultamentos, setSepultamentos] = useState([]);
    const [exumacoes, setExumacoes] = useState([]);
    const [quadras, setQuadras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isActive = true;

        const loadCalendarData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [loadedSepultamentos, loadedExumacoes, loadedQuadras] = await Promise.all([
                    getSepultamentos(),
                    getExumacoes(),
                    getBlocks(),
                ]);

                if (!isActive) return;

                setSepultamentos(Array.isArray(loadedSepultamentos) ? loadedSepultamentos : []);
                setExumacoes(Array.isArray(loadedExumacoes) ? loadedExumacoes : []);
                setQuadras(Array.isArray(loadedQuadras) ? loadedQuadras : []);
            } catch (err) {
                if (!isActive) return;

                console.warn("Erro ao carregar dados do calendário", err);
                setError(err);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadCalendarData();

        return () => {
            isActive = false;
        };
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
