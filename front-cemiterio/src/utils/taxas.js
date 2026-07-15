import { DEFAULT_TAXAS } from "../pages/Cadastros/constants";

export const formatCurrencyBRL = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const normalizeValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

export const getTaxaId = (taxa = {}) => normalizeValue(taxa?.id ?? taxa?._id ?? taxa?.taxa_id ?? taxa?.codigo ?? "");

export const getTaxaCodigo = (taxa = {}) => normalizeValue(taxa?.codigo ?? taxa?.code ?? taxa?.value ?? "");

export const getTaxaDescricao = (taxa = {}) =>
    normalizeValue(taxa?.descricao ?? taxa?.description ?? taxa?.label ?? taxa?.codigo ?? "");

export const getTaxaValor = (taxa = {}) => {
    const value = taxa?.valor ?? taxa?.taxa_valor ?? taxa?.amount ?? 0;
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

export const getTaxaTipo = (taxa = {}) => normalizeValue(taxa?.tipo ?? taxa?.type ?? "sepultamento") || "sepultamento";

export const isTaxaActive = (taxa = {}) =>
    taxa?.active !== false &&
    taxa?.ativo !== false &&
    normalizeValue(taxa?.status || "active").toLowerCase() !== "inactive" &&
    normalizeValue(taxa?.status || "active").toLowerCase() !== "inativo";

export const isTaxaIsencao = (taxa = {}) => Boolean(taxa?.isencao) || getTaxaValor(taxa) === 0;

export const getTaxaVigenciaInicio = (taxa = {}) => normalizeValue(taxa?.vigencia_inicio ?? taxa?.data_inicio ?? "");

export const getTaxaVigenciaFim = (taxa = {}) =>
    normalizeValue(taxa?.vigencia_fim ?? taxa?.data_fim ?? taxa?.validade ?? "");

export const getTaxaCodigoFromRecord = (record = {}) =>
    normalizeValue(record?.taxa ?? record?.taxa_codigo ?? record?.codigo_taxa ?? record?.codigo ?? "");

export const getTaxaLabelFromRecord = (record = {}) =>
    normalizeValue(record?.taxa_label ?? record?.taxa_descricao ?? record?.descricao_taxa ?? record?.label ?? "");

export const getTaxaValorFromRecord = (record = {}) => {
    const value = record?.taxa_valor ?? record?.valor_taxa ?? record?.valor ?? 0;
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

export const classifyTaxaRecord = (record = {}, normalize = (value) => normalizeValue(value).toLowerCase()) => {
    const code = normalize(getTaxaCodigoFromRecord(record));
    const label = normalize(getTaxaLabelFromRecord(record));
    const type = normalize(record?.tipo ?? record?.taxa_tipo ?? "");

    if (code.includes("indig") || label.includes("indig") || type.includes("indig")) return "indigente";
    if (
        code.includes("crianca") ||
        label.includes("crianca") ||
        label.includes("criança") ||
        type.includes("crianca") ||
        type.includes("criança")
    )
        return "crianca";
    if (code.includes("adult") || label.includes("adult") || type.includes("adult")) return "adulto";
    return "outros";
};

export const formatTaxaLabel = (taxa) => {
    if (!taxa) return "";
    const descricao = getTaxaDescricao(taxa);
    return isTaxaIsencao(taxa) ? descricao : `${descricao} - ${formatCurrencyBRL(getTaxaValor(taxa))}`;
};

export const normalizeTaxa = (taxa) => ({
    ...taxa,
    id: getTaxaId(taxa),
    codigo: getTaxaCodigo(taxa),
    descricao: getTaxaDescricao(taxa),
    valor: getTaxaValor(taxa),
    tipo: getTaxaTipo(taxa),
    active: isTaxaActive(taxa),
    isencao: isTaxaIsencao(taxa),
    vigencia_inicio: getTaxaVigenciaInicio(taxa),
    vigencia_fim: getTaxaVigenciaFim(taxa),
});

export const getFallbackTaxas = () => DEFAULT_TAXAS.map(normalizeTaxa);

export const buildTaxaOptions = (taxas = []) => {
    const source = Array.isArray(taxas) && taxas.length ? taxas : getFallbackTaxas();
    return source
        .map(normalizeTaxa)
        .filter((taxa) => isTaxaActive(taxa) && getTaxaTipo(taxa) === "sepultamento")
        .map((taxa) => ({
            ...taxa,
            value: getTaxaCodigo(taxa),
            label: formatTaxaLabel(taxa),
        }));
};

export const findTaxaByCodigo = (taxas = [], codigo) => {
    const key = String(codigo || "").trim();
    return buildTaxaOptions(taxas).find((taxa) => getTaxaCodigo(taxa) === key) || null;
};
