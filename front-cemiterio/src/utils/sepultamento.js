const normalizeBoolean = (value) => value === true || String(value).trim().toLowerCase() === "true";

export const isSepultamentoVigente = (sepultamento) => {
    if (!sepultamento || normalizeBoolean(sepultamento.foi_exumado)) return false;

    const status = String(sepultamento.status ?? "")
        .trim()
        .toLowerCase();

    return normalizeBoolean(sepultamento.confirmado) || status.includes("concl");
};
