import { useEffect, useState } from "react";
import api from "../../services/index.js";
import { normalizeQuadra } from "../../utils/quadra.js";

const normalizeCova = (cova) => {
  const areaType = String(cova?.areaType ?? cova?.area_type ?? "").toUpperCase();
  const graveType = String(cova?.graveType ?? cova?.tipo_cova ?? "").toUpperCase();
  const backendStatus = String(cova?.status ?? "").toUpperCase();
  const blocked = Boolean(cova?.blocked);
  const status = blocked
    ? "indisponivel"
    : backendStatus === "MAINTENANCE"
      ? "indisponivel"
      : backendStatus === "OCCUPIED"
        ? "ocupada"
        : areaType === "PERPETUAL"
          ? "reservada"
          : "disponivel";

  return {
    ...cova,
    id: cova?.id,
    quadra_cova: String(cova?.quadra_cova ?? cova?.blockId ?? cova?.block ?? cova?.quadra ?? cova?.quadra_sep ?? ""),
    num_cova: cova?.num_cova ?? cova?.number ?? cova?.numero ?? cova?.num_sepultura ?? "",
    tipo_cova:
      cova?.tipo_cova ??
      (graveType === "MAUSOLEUM" ? "gaveta" : "cova"),
    capacidade: cova?.capacidade ?? cova?.bodyCapacity ?? 0,
    status,
    blocked,
    areaType,
    concessao: {
      ...(cova?.concessao ?? {}),
      ativa: cova?.concessao?.ativa ?? areaType === "PERPETUAL",
    },
  };
};

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
        const covasData = Array.isArray(rc.data) ? rc.data.map(normalizeCova) : [];
        setQuadras(quadrasData);
        setCovas(covasData);
      })
      .catch(() => { if (mounted) { setQuadras([]); setCovas([]); } });

    api.get("/falecidos")
      .then((res) => { if (mounted) setFalecidos(res.data || []); })
      .catch(() => { if (mounted) setFalecidos([]); });

    return () => { mounted = false; };
  }, []);

  return { cidades, setCidades, quadras, setQuadras, covas, setCovas, falecidos, setFalecidos };
}
