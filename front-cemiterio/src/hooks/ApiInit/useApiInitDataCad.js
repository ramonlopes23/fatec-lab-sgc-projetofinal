import { useEffect, useState } from "react";
import api from "../../services/index.js";
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

    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")
      .then((res) => res.json())
      .then((data) => { if (mounted) setCidades(data); })
      .catch(() => { if (mounted) setCidades([]); });

    Promise.all([api.get("/quadras"), api.get("/covas")])
      .then(([rq, rc]) => {
        if (!mounted) return;
        const quadrasData = Array.isArray(rq.data) ? rq.data.map(normalizeQuadra) : [];
        const covasData = Array.isArray(rc.data) ? rc.data.map(normalizeSepultura) : [];
        setQuadras(quadrasData);
        setCovas(covasData);
      })
      .catch(() => { if (mounted) { setQuadras([]); setCovas([]); } });

    api.get("/falecidos")
      .then((res) => {
        if (!mounted) return;
        setFalecidos(Array.isArray(res.data) ? res.data.map(normalizeFalecido) : []);
      })
      .catch(() => { if (mounted) setFalecidos([]); });

    return () => { mounted = false; };
  }, []);

  return { cidades, setCidades, quadras, setQuadras, covas, setCovas, falecidos, setFalecidos };
}
