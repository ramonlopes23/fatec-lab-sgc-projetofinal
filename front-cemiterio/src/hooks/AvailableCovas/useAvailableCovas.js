import { useCallback, useMemo } from "react";
import { isTituloPosseSim } from "../../utils/contrato.js";
import { getSepulturaNumber, getSepulturaQuadraRef, getSepulturaType, isSepulturaAvailable, isSepulturaPerpetual } from "../../utils/sepultura.js";

export default function useAvailableCovas(covas, form, setForm) {
  const computeAvailableCovas = useCallback((covasList, quadraId, tituloPosse) => {
    if (!quadraId) return [];
    const sameQuadra = covasList.filter((cova) => 
      getSepulturaQuadraRef(cova) === String(quadraId)
    );
    const filtered = isTituloPosseSim(tituloPosse)
      ? sameQuadra.filter((cova) => isSepulturaPerpetual(cova))
      : sameQuadra.filter((cova) => !isSepulturaPerpetual(cova));
    return filtered.filter((cova) => isSepulturaAvailable(cova, tituloPosse));
  }, []);

  const availableCovas = useMemo(() => (
    computeAvailableCovas(covas, form.quadra_sep, form.titulo_posse)
  ), [computeAvailableCovas, covas, form.quadra_sep, form.titulo_posse]);

  const tipoCovaSelecionada = useMemo(() => {
    if (!form.quadra_sep || !form.num_sepultura_sep) return "";
    const target = String(form.num_sepultura_sep);
    const byNumber = (list) => list.find((cova) => 
      getSepulturaNumber(cova) === target
    );
    const found = byNumber(availableCovas) || covas.find((cova) => (
      getSepulturaQuadraRef(cova) === String(form.quadra_sep)
      && getSepulturaNumber(cova) === target
    ));
    if (!found) return "";
    return getSepulturaType(found);
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
