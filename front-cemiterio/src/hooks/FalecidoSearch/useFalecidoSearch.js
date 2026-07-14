import { useCallback, useEffect, useState } from "react";
import { getFalecidoName } from "../../utils/falecido";
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
        .filter((falecido) => getFalecidoName(falecido).toLowerCase().includes(term))
        .slice(0, 10),
    );
  }, [falecidos, processType, searchFal, setForm]);

  return {
    searchFal,
    setSearchFal,
    filteredFalecidos,
  };
}
