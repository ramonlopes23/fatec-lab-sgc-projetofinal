import { DEFAULT_TAXAS } from "../pages/Cadastros/constants";

export const formatCurrencyBRL = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const formatTaxaLabel = (taxa) => {
    if (!taxa) return "";
    const descricao = String(taxa.descricao || taxa.label || taxa.codigo || "").trim();
    const isencao = Boolean(taxa.isencao) || Number(taxa.valor || 0) === 0;
    return isencao ? descricao : `${descricao} - ${formatCurrencyBRL(taxa.valor)}`;
};

export const normalizeTaxa = (taxa) => ({
    id: taxa?.id ?? taxa?.codigo ?? "",
    codigo: String(taxa?.codigo ?? taxa?.value ?? "").trim(),
    descricao: String(taxa?.descricao ?? taxa?.label ?? "").trim(),
    valor: Number(taxa?.valor ?? taxa?.taxa_valor ?? 0),
    tipo: String(taxa?.tipo ?? "sepultamento").trim() || "sepultamento",
    active: taxa?.active !== false && taxa?.ativo !== false && String(taxa?.status || "active").toLowerCase() !== "inactive",
    isencao: Boolean(taxa?.isencao) || Number(taxa?.valor ?? taxa?.taxa_valor ?? 0) === 0,
    vigencia_inicio: taxa?.vigencia_inicio ?? "",
    vigencia_fim: taxa?.vigencia_fim ?? "",
});

export const getFallbackTaxas = () => DEFAULT_TAXAS.map(normalizeTaxa);

export const buildTaxaOptions = (taxas = []) => {
    const source = Array.isArray(taxas) && taxas.length ? taxas : getFallbackTaxas();
    return source
        .map(normalizeTaxa)
        .filter((taxa) => taxa.active && taxa.tipo === "sepultamento")
        .map((taxa) => ({
            ...taxa,
            value: taxa.codigo,
            label: formatTaxaLabel(taxa),
        }));
};

export const findTaxaByCodigo = (taxas = [], codigo) => {
    const key = String(codigo || "").trim();
    return buildTaxaOptions(taxas).find((taxa) => taxa.codigo === key) || null;
};
