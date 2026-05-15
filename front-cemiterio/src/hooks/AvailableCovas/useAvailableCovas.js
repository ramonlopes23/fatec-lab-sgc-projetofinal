import { useCallback, useMemo } from "react";

export default function useAvailableCovas(covas, form, setForm) {
  const isCovaAvailable = useCallback((cova, tituloPosse = "") => {
    const cap = Number(cova?.capacidade ?? 0);
    if (cap <= 0) return false;

    const status = String(cova?.status ?? "").toLowerCase();
    const posse = String(tituloPosse ?? "").toLowerCase();
    if (posse === "sim") {
      return cova.concessao?.ativa === true && !status.includes("lotad") && !status.includes("indispon");
    }
    return !["lotad", "indispon", "reserv", "particular"].some((item) => status.includes(item));
  }, []);

  const computeAvailableCovas = useCallback((covasList, quadraId, tituloPosse) => {
    if (!quadraId) return [];
    const sameQuadra = covasList.filter((cova) => 
      String(cova.quadra_cova ?? cova.quadra ?? cova.quadra_sep ?? "") === String(quadraId)
    );
    const posse = String(tituloPosse ?? "").toLowerCase();
    const filtered = posse === "sim"
      ? sameQuadra.filter((cova) => !!cova.concessao?.ativa)
      : sameQuadra.filter((cova) => !String(cova.status ?? "").toLowerCase().includes("reserv"));
    return filtered.filter((cova) => isCovaAvailable(cova, tituloPosse));
  }, [isCovaAvailable]);

  const availableCovas = useMemo(() => (
    computeAvailableCovas(covas, form.quadra_sep, form.titulo_posse)
  ), [computeAvailableCovas, covas, form.quadra_sep, form.titulo_posse]);

  const tipoCovaSelecionada = useMemo(() => {
    if (!form.quadra_sep || !form.num_sepultura_sep) return "";
    const target = String(form.num_sepultura_sep);
    const byNumber = (list) => list.find((cova) => 
      String(cova.num_cova ?? cova.numero ?? cova.num_sepultura ?? "") === target
    );
    const found = byNumber(availableCovas) || covas.find((cova) => (
      String(cova.quadra_cova ?? cova.quadra ?? cova.quadra_sep ?? "") === String(form.quadra_sep)
      && String(cova.num_cova ?? cova.numero ?? cova.num_sepultura ?? "") === target
    ));
    return found?.tipo_cova ?? "";
  }, [availableCovas, covas, form.quadra_sep, form.num_sepultura_sep]);

  const handleQuadraSepChange = useCallback((val) => {
    setForm((prev) => ({ ...prev, quadra_sep: val, num_sepultura_sep: "" }));
  }, [setForm]);

  return {
    availableCovas,
    tipoCovaSelecionada,
    handleQuadraSepChange,
  };
}
