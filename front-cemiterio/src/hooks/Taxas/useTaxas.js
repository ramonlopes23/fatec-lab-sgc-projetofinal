import { useCallback, useEffect, useState } from "react";
import { getTaxas } from "../../services/taxaService";
import { buildTaxaOptions, getFallbackTaxas, normalizeTaxa } from "../../utils/taxas";

export default function useTaxas({ autoLoad = true, onlyActive = false } = {}) {
    const [taxas, setTaxas] = useState(() => getFallbackTaxas());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadTaxas = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getTaxas();
            const normalized = Array.isArray(data) && data.length
                ? data.map(normalizeTaxa)
                : getFallbackTaxas();

            setTaxas(onlyActive ? normalized.filter((taxa) => taxa.active) : normalized);
            return normalized;
        } catch (err) {
            console.error("Erro ao carregar taxas", err);
            const fallback = getFallbackTaxas();
            setTaxas(onlyActive ? fallback.filter((taxa) => taxa.active) : fallback);
            setError("Nao foi possivel carregar taxas da API. Usando taxas padrao.");
            return fallback;
        } finally {
            setLoading(false);
        }
    }, [onlyActive]);

    useEffect(() => {
        if (autoLoad) {
            loadTaxas();
        }
    }, [autoLoad, loadTaxas]);

    return {
        taxas,
        taxaOptions: buildTaxaOptions(taxas),
        loading,
        error,
        loadTaxas,
        setTaxas,
    };
}
