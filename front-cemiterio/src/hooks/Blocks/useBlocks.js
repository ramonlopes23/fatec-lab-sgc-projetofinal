import { useCallback, useEffect, useState } from "react";
import { getBlocks, inactivateBlock } from "../../services/blockService";

export function useBlocks() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadBlocks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getBlocks();
            setBlocks(data);
        } catch (err) {
            console.error("Erro ao carregar quadras:", err);
            setError("Erro ao carregar quadras.");
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateBlock = async (id) => {
        try {
            const updated = await inactivateBlock(id);
            setBlocks((prev) => prev.map((item) => (item.id === id ? updated : item)));
            return updated;
        } catch (err) {
            console.error("Erro ao inativar quadra:", err);
            throw err;
        }
    };

    useEffect(() => {
        loadBlocks();
    }, [loadBlocks]);

    return {
        blocks,
        loading,
        error,
        loadBlocks,
        setBlocks,
        deactivateBlock,
    };
}
