import { useCallback, useEffect, useRef, useState } from "react";
import { getBlocks } from "../../services/blockService.js";
import { getExumacoes } from "../../services/exumacaoService.js";
import { getFalecidos } from "../../services/falecidoService.js";
import { getGraves } from "../../services/graveService.js";
import { getPets } from "../../services/petService.js";
import { getSepultamentos } from "../../services/sepultamentoService.js";
import { getVelorios } from "../../services/velorioService.js";
import { useCemeteryStore } from "../../stores/cemeteryStore.js";

const EMPTY_DATA = {
    falecidos: [],
    sepultamentos: [],
    velorios: [],
    exumacoes: [],
    blocks: [],
    graves: [],
    pets: [],
};

const DASHBOARD_LOADERS = {
    falecidos: getFalecidos,
    sepultamentos: getSepultamentos,
    velorios: getVelorios,
    exumacoes: getExumacoes,
    blocks: getBlocks,
    graves: getGraves,
    pets: getPets,
};

export default function useDashboardData() {
    const selectedCemeteryId = useCemeteryStore((state) => state.selectedCemeteryId);
    const [data, setData] = useState(EMPTY_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const requestIdRef = useRef(0);

    const reload = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoading(true);
        setError(null);

        const entries = Object.entries(DASHBOARD_LOADERS);
        const results = await Promise.allSettled(entries.map(([, loader]) => loader()));
        if (requestId !== requestIdRef.current) return null;

        const nextData = { ...EMPTY_DATA };
        const failedResources = [];

        results.forEach((result, index) => {
            const [resource] = entries[index];
            if (result.status === "fulfilled") {
                nextData[resource] = Array.isArray(result.value) ? result.value : [];
            } else {
                failedResources.push(resource);
            }
        });

        setData(nextData);
        setError(failedResources.length ? `Falha ao carregar: ${failedResources.join(", ")}.` : null);
        setLoading(false);
        return nextData;
    }, []);

    useEffect(() => {
        reload();
        return () => {
            requestIdRef.current += 1;
        };
    }, [reload]);

    return {
        ...data,
        selectedCemeteryId,
        loading,
        error,
        reload,
    };
}
