import { useEffect, useState } from "react";
import { getBlocks } from "../../services/blockService.js";
import { getFalecidos } from "../../services/falecidoService.js";
import { getGraves } from "../../services/graveService.js";
import { getMunicipios } from "../../services/ibgeService.js";
import { normalizeFalecido } from "../../utils/falecido.js";
import { normalizeQuadra } from "../../utils/quadra.js";
import { normalizeSepultura } from "../../utils/sepultura.js";

export default function useApiInitDataCad() {
    const [cidades, setCidades] = useState([]);
    const [quadras, setQuadras] = useState([]);
    const [covas, setCovas] = useState([]);
    const [falecidos, setFalecidos] = useState([]);

    useEffect(() => {
        let mounted = true;

        getMunicipios()
            .then((data) => {
                if (mounted) setCidades(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (mounted) setCidades([]);
            });

        Promise.all([getBlocks(), getGraves()])
            .then(([loadedQuadras, loadedCovas]) => {
                if (!mounted) return;
                const quadrasData = Array.isArray(loadedQuadras) ? loadedQuadras.map(normalizeQuadra) : [];
                const covasData = Array.isArray(loadedCovas) ? loadedCovas.map(normalizeSepultura) : [];
                setQuadras(quadrasData);
                setCovas(covasData);
            })
            .catch(() => {
                if (mounted) {
                    setQuadras([]);
                    setCovas([]);
                }
            });

        getFalecidos()
            .then((data) => {
                if (!mounted) return;
                setFalecidos(Array.isArray(data) ? data.map(normalizeFalecido) : []);
            })
            .catch(() => {
                if (mounted) setFalecidos([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return { cidades, setCidades, quadras, setQuadras, covas, setCovas, falecidos, setFalecidos };
}
