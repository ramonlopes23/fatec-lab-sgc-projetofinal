import { useCallback, useEffect, useState } from "react";
import { isEmpty } from "../../utils/validation";
import { PROCESS_TYPES, normalizeProcessType } from "../../pages/Cadastros/constants";

export default function useFalecidoSearch(falecidos, processType, saved, setForm) {
  const [searchFal, setSearchFal] = useState(() => 
    normalizeProcessType(saved?.processType) === processType ? saved?.searchFal || "" : ""
  );
  const [filteredFalecidos, setFilteredFalecidos] = useState([]);

  useEffect(() => {
    if (!searchFal) {
      setFilteredFalecidos([]);
      if (processType === PROCESS_TYPES.sepultamento) {
        setForm((prev) => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
      }
      return;
    }

    const term = String(searchFal).toLowerCase();
    setFilteredFalecidos(
      (falecidos || [])
        .filter((falecido) => ((falecido.nome_fal || falecido.nome) || "").toLowerCase().includes(term))
        .slice(0, 10),
    );
  }, [falecidos, processType, searchFal, setForm]);

  return {
    searchFal,
    setSearchFal,
    filteredFalecidos,
  };
}
