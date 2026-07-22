const normalizeQuadraValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

const normalizeQuadraDisplayValue = (value) =>
    normalizeQuadraValue(value)
        .replace(/^quadra\s+/i, "")
        .trim();

const getQuadraDisplayCandidates = (value) => {
    if (!value || typeof value !== "object") return [];

    return [value.num_quadra, value.number, value.numero, value.nome].map(normalizeQuadraDisplayValue).filter(Boolean);
};

const getQuadraLookupCandidates = (value) => {
    if (!value || typeof value !== "object") return [];

    return [value.id, value.num_quadra, value.number, value.numero, value.nome]
        .map(normalizeQuadraValue)
        .filter(Boolean);
};

export const getQuadraNumber = (quadra) => {
    if (!quadra || typeof quadra !== "object") return "";
    return getQuadraDisplayCandidates(quadra)[0] || "";
};

export const getQuadraCemiterioRef = (quadra = {}) => {
    const cemetery = quadra?.cemetery ?? quadra?.cemiterio;
    const nestedId = cemetery && typeof cemetery === "object" ? (cemetery.id ?? cemetery._id) : cemetery;

    return normalizeQuadraValue(quadra?.cemeteryId ?? quadra?.cemiterioId ?? quadra?.cemiterio_id ?? nestedId ?? "");
};

export const normalizeQuadra = (quadra) => {
    const numero = getQuadraNumber(quadra);

    return {
        ...quadra,
        id: quadra?.id,
        num_quadra: numero,
        numero,
        nome: quadra?.nome || (numero ? `Quadra ${numero}` : ""),
    };
};

export const findQuadraByReference = (value, quadras = []) => {
    if (value === undefined || value === null || value === "") return "";

    if (typeof value === "object") {
        const directNumber = getQuadraNumber(value);
        if (directNumber) return value;

        const [firstLookup = ""] = getQuadraLookupCandidates(value);
        return findQuadraByReference(firstLookup, quadras);
    }

    const raw = normalizeQuadraValue(value);
    if (!raw) return null;

    const list = Array.isArray(quadras) ? quadras : [];
    return list.find((quadra) => getQuadraLookupCandidates(quadra).includes(raw)) || null;
};

export const resolveQuadraDisplay = (value, quadras = [], fallback = "") => {
    if (value === undefined || value === null || value === "") return "";

    if (typeof value === "object") {
        const directNumber = getQuadraNumber(value);
        if (directNumber) return directNumber;

        const foundByObject = findQuadraByReference(value, quadras);
        return foundByObject && foundByObject !== value ? getQuadraNumber(foundByObject) : fallback;
    }

    const raw = normalizeQuadraValue(value);
    if (!raw) return "";

    const found = findQuadraByReference(raw, quadras);
    if (found) {
        return getQuadraNumber(found) || fallback;
    }

    return fallback;
};

export const formatQuadraDisplay = (value, quadras = [], prefix = "Quadra ", fallback = "") => {
    const resolved = resolveQuadraDisplay(value, quadras, fallback);
    return resolved ? `${prefix}${resolved}` : "";
};
