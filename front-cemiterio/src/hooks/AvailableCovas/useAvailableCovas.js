import { useCallback, useMemo } from "react";

export default function useAvailableCovas(covas, form, setForm) {
  const getQuadraRef = useCallback((cova) => (
    String(cova?.quadra_cova ?? cova?.blockId ?? cova?.block ?? cova?.quadra ?? cova?.quadra_sep ?? "")
  ), []);

  const getCovaNumero = useCallback((cova) => (
    String(cova?.num_cova ?? cova?.number ?? cova?.numero ?? cova?.num_sepultura ?? "")
  ), []);

  const isCovaAvailable = useCallback((cova, tituloPosse = "") => {
    const cap = Number(cova?.capacidade ?? cova?.bodyCapacity ?? 0);
    if (cap <= 0) return false;

    const status = String(cova?.status ?? "").toLowerCase();
    const backendStatus = String(cova?.status ?? "").toUpperCase();
    const blocked = Boolean(cova?.blocked);
    const isPerpetual = String(cova?.areaType ?? cova?.area_type ?? "").toUpperCase() === "PERPETUAL"
      || cova?.concessao?.ativa === true;

    if (blocked) return false;
    if (backendStatus === "MAINTENANCE" || backendStatus === "OCCUPIED") return false;

    const posse = String(tituloPosse ?? "").toLowerCase();
    if (posse === "sim") {
      return isPerpetual && !status.includes("lotad") && !status.includes("indispon");
    }
    if (isPerpetual) return false;
    return !["lotad", "indispon", "reserv", "particular", "ocupad"].some((item) => status.includes(item));
  }, []);

  const computeAvailableCovas = useCallback((covasList, quadraId, tituloPosse) => {
    if (!quadraId) return [];
    const sameQuadra = covasList.filter((cova) => 
      getQuadraRef(cova) === String(quadraId)
    );
    const posse = String(tituloPosse ?? "").toLowerCase();
    const filtered = posse === "sim"
      ? sameQuadra.filter((cova) => (String(cova?.areaType ?? cova?.area_type ?? "").toUpperCase() === "PERPETUAL") || !!cova?.concessao?.ativa)
      : sameQuadra.filter((cova) => (String(cova?.areaType ?? cova?.area_type ?? "").toUpperCase() !== "PERPETUAL") && !String(cova.status ?? "").toLowerCase().includes("reserv"));
    return filtered.filter((cova) => isCovaAvailable(cova, tituloPosse));
  }, [getQuadraRef, isCovaAvailable]);

  const availableCovas = useMemo(() => (
    computeAvailableCovas(covas, form.quadra_sep, form.titulo_posse)
  ), [computeAvailableCovas, covas, form.quadra_sep, form.titulo_posse]);

  const tipoCovaSelecionada = useMemo(() => {
    if (!form.quadra_sep || !form.num_sepultura_sep) return "";
    const target = String(form.num_sepultura_sep);
    const byNumber = (list) => list.find((cova) => 
      getCovaNumero(cova) === target
    );
    const found = byNumber(availableCovas) || covas.find((cova) => (
      getQuadraRef(cova) === String(form.quadra_sep)
      && getCovaNumero(cova) === target
    ));
    if (!found) return "";
    return found?.tipo_cova ?? (String(found?.graveType ?? "").toUpperCase() === "MAUSOLEUM" ? "gaveta" : "cova");
  }, [availableCovas, covas, form.quadra_sep, form.num_sepultura_sep, getCovaNumero, getQuadraRef]);

  const handleQuadraSepChange = useCallback((val) => {
    setForm((prev) => ({ ...prev, quadra_sep: val, num_sepultura_sep: "" }));
  }, [setForm]);

  return {
    availableCovas,
    tipoCovaSelecionada,
    handleQuadraSepChange,
  };
}
