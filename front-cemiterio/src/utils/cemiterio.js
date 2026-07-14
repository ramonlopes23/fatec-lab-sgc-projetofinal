const normalizeValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

export const getCemiterioId = (cemiterio = {}) => normalizeValue(
    cemiterio?.id ?? cemiterio?._id ?? cemiterio?.cemiterio_id ?? cemiterio?.cemeteryId ?? ""
);

export const getCemiterioName = (cemiterio = {}) => normalizeValue(
    cemiterio?.name ??
    cemiterio?.nome ??
    cemiterio?.nome_cemiterio ??
    cemiterio?.cemiterio_nome ??
    cemiterio?.cemiterio ??
    cemiterio?.label ??
    ""
);

export const getCemiterioFoundation = (cemiterio = {}) => normalizeValue(
    cemiterio?.foundation ??
    cemiterio?.fundacao ??
    cemiterio?.data_fundacao ??
    cemiterio?.dt_fundacao ??
    ""
);

export const isCemiterioActive = (cemiterio = {}) => (
    cemiterio?.active !== false &&
    cemiterio?.ativo !== false &&
    normalizeValue(cemiterio?.status).toLowerCase() !== "inactive" &&
    normalizeValue(cemiterio?.status).toLowerCase() !== "inativo"
);

export const normalizeCemiterio = (cemiterio = {}) => {
    const source = cemiterio || {};

    return {
        ...source,
        id: getCemiterioId(source),
        name: getCemiterioName(source),
        foundation: getCemiterioFoundation(source),
        active: isCemiterioActive(source),
    };
};

export const findCemiterioByReference = (value, cemiterios = []) => {
    const raw = normalizeValue(value);
    if (!raw) return null;

    return (Array.isArray(cemiterios) ? cemiterios : []).find((cemiterio) => {
        const normalized = normalizeCemiterio(cemiterio);
        return [normalized.id, normalized.name]
            .filter(Boolean)
            .some((candidate) => normalizeValue(candidate) === raw);
    }) || null;
};

export const resolveCemiterioName = (value, cemiterios = [], fallback = "") => {
    if (!value) return "";

    if (typeof value === "object") {
        return getCemiterioName(value) || fallback;
    }

    const found = findCemiterioByReference(value, cemiterios);
    return found ? getCemiterioName(found) : fallback;
};
