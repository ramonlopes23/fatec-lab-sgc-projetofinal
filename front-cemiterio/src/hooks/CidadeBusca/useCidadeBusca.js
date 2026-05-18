import { useMemo, useState } from "react";

export default function useCidadeBusca(cidades) {
  const [busca, setBusca] = useState("");

  const resultados = useMemo(() => (
    (cidades || []).filter((cidade) => (cidade.nome || "").toLowerCase().includes((busca || "").toLowerCase()))
  ), [busca, cidades]);

  return { busca, setBusca, resultados };
}
