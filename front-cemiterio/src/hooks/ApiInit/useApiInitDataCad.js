import { useEffect, useState } from "react";
import api from "../../services/index.js";

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
        setQuadras(Array.isArray(rq.data) ? rq.data : []);
        setCovas(Array.isArray(rc.data) ? rc.data : []);
      })
      .catch(() => { if (mounted) { setQuadras([]); setCovas([]); } });

    api.get("/falecidos")
      .then((res) => { if (mounted) setFalecidos(res.data || []); })
      .catch(() => { if (mounted) setFalecidos([]); });

    return () => { mounted = false; };
  }, []);

  return { cidades, setCidades, quadras, setQuadras, covas, setCovas, falecidos, setFalecidos };
}
