import { useCallback, useState } from "react";

export default function useViacepLookup() {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const normalizeCep = useCallback((value) => {
    return String(value || "").replace(/\D/g, "").slice(0, 8);
  }, []);

  const fetchViaCep = useCallback(async (cepDigits) => {
    if (!cepDigits || cepDigits.length !== 8) return null;
    try {
      setLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await res.json();
      if (!data || data.erro) return null;

      const formatted = `${data.logradouro || ""}${data.logradouro ? " - " : ""}${data.bairro || ""}${data.bairro && data.localidade ? " - " : ""}${data.localidade || ""}${data.uf ? ` - ${data.uf}` : ""}`.trim();
      return { raw: data, formatted };
    } catch (err) {
      console.error("Erro fetch ViaCEP", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCepChange = useCallback(
    async (event) => {
      const digits = normalizeCep(event.target.value);
      setCep(digits);
      setNotFound(false);

      if (digits.length === 8) {
        const found = await fetchViaCep(digits);
        if (found) {
          setEndereco(found.formatted);
          setNotFound(false);
        } else {
          setEndereco("");
          setNotFound(true);
        }
      }
    },
    [normalizeCep, fetchViaCep]
  );

  const handleCepBlur = useCallback(async () => {
    const digits = normalizeCep(cep);
    if (!digits || digits.length !== 8) {
      setNotFound(false);
      return;
    }
    const found = await fetchViaCep(digits);
    if (found) {
      setEndereco(found.formatted);
      setNotFound(false);
    } else {
      setEndereco("");
      setNotFound(true);
    }
  }, [cep, normalizeCep, fetchViaCep]);

  return {
    cep,
    setCep,
    endereco,
    setEndereco,
    loading,
    notFound,
    handleCepChange,
    handleCepBlur,
  };
}
