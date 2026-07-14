import { isTituloPosseSim } from "./contrato.js";

const normalizeValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

const normalizeUpper = (value) => normalizeValue(value).toUpperCase();
const normalizeLower = (value) => normalizeValue(value).toLowerCase();

export const getSepulturaNumber = (sepultura = {}) => normalizeValue(
    sepultura?.num_cova ??
    sepultura?.number ??
    sepultura?.numero ??
    sepultura?.num_sepultura ??
    sepultura?.num_sepultura_sep ??
    sepultura?.sepultura ??
    sepultura?.cova?.num_cova ??
    sepultura?.cova?.grave?.number ??
    sepultura?.grave?.number ??
    ""
);

export const getSepulturaQuadraRef = (sepultura = {}) => {
    const block = sepultura?.block ?? sepultura?.grave?.block ?? sepultura?.cova?.grave?.block;
    const blockId = block && typeof block === "object" ? block.id : block;

    return normalizeValue(
        sepultura?.quadra_cova ??
        sepultura?.blockId ??
        sepultura?.grave?.blockId ??
        sepultura?.cova?.grave?.blockId ??
        blockId ??
        sepultura?.quadra ??
        sepultura?.quadra_id ??
        sepultura?.quadra_sep ??
        sepultura?.cova?.quadra_cova ??
        sepultura?.sep?.quadra_sep ??
        ""
    );
};

export const getSepulturaType = (sepultura = {}) => {
    const rawType = normalizeUpper(sepultura?.graveType ?? sepultura?.tipo_cova ?? sepultura?.tipo_sep);
    if (rawType === "MAUSOLEUM" || rawType === "GAVETA") return "gaveta";
    return sepultura?.tipo_cova || "cova";
};

export const getSepulturaCapacity = (sepultura = {}) => {
    const value = sepultura?.capacidade ?? sepultura?.bodyCapacity ?? sepultura?.grave?.bodyCapacity ?? sepultura?.cova?.grave?.bodyCapacity;
    if (value === undefined || value === null || value === "") return "";
    const number = Number(value);
    return Number.isNaN(number) ? 0 : number;
};

export const isSepulturaPerpetual = (sepultura = {}) => (
    normalizeUpper(sepultura?.areaType ?? sepultura?.area_type ?? sepultura?.grave?.areaType ?? sepultura?.grave?.area_type) === "PERPETUAL" ||
    sepultura?.concessao?.ativa === true
);

export const isSepulturaBlocked = (sepultura = {}) => (
    sepultura?.blocked === true ||
    sepultura?.grave?.blocked === true ||
    sepultura?.cova?.grave?.blocked === true
);

export const normalizeSepulturaStatus = (sepultura = {}) => {
    const status = normalizeLower(sepultura?.status ?? sepultura?.grave?.status ?? sepultura?.cova?.grave?.status);
    const backendStatus = normalizeUpper(sepultura?.status ?? sepultura?.grave?.status ?? sepultura?.cova?.grave?.status);
    const capacity = getSepulturaCapacity(sepultura);

    if (isSepulturaBlocked(sepultura) || backendStatus === "MAINTENANCE" || status.includes("indispon")) return "indisponivel";
    if (capacity !== "" && Number(capacity) <= 0) return "lotada";
    if (backendStatus === "OCCUPIED" || status.includes("ocup")) return "ocupada";
    if (isSepulturaPerpetual(sepultura) || status.includes("reserv") || status.includes("particular")) return "reservada";
    if (status === "livre") return "disponivel";
    return status || "disponivel";
};

export const isSepulturaAvailable = (sepultura = {}, tituloPosse = "") => {
    const capacity = Number(getSepulturaCapacity(sepultura) || 0);
    if (capacity <= 0) return false;
    if (isSepulturaBlocked(sepultura)) return false;

    const backendStatus = normalizeUpper(sepultura?.status ?? sepultura?.grave?.status ?? sepultura?.cova?.grave?.status);
    if (backendStatus === "MAINTENANCE" || backendStatus === "OCCUPIED") return false;

    const status = normalizeSepulturaStatus(sepultura);
    const wantsParticular = isTituloPosseSim(tituloPosse);
    const isPerpetual = isSepulturaPerpetual(sepultura);

    if (wantsParticular) return isPerpetual && !["lotada", "indisponivel", "ocupada"].includes(status);
    if (isPerpetual) return false;
    return !["lotada", "indisponivel", "reservada", "ocupada"].includes(status);
};

export const normalizeSepultura = (sepultura = {}) => {
    const areaType = normalizeUpper(sepultura?.areaType ?? sepultura?.area_type);
    const normalized = {
        ...sepultura,
        id: sepultura?.id,
        quadra_cova: getSepulturaQuadraRef(sepultura),
        num_cova: getSepulturaNumber(sepultura),
        tipo_cova: getSepulturaType(sepultura),
        capacidade: getSepulturaCapacity(sepultura),
        blocked: isSepulturaBlocked(sepultura),
        areaType,
        concessao: {
            ...(sepultura?.concessao ?? {}),
            ativa: sepultura?.concessao?.ativa ?? areaType === "PERPETUAL",
        },
    };

    return {
        ...normalized,
        status: normalizeSepulturaStatus(normalized),
    };
};

export const formatSepulturaDisplay = (sepultura = {}, prefix = "Sepultura ", fallback = "") => {
    const number = getSepulturaNumber(sepultura);
    return number ? `${prefix}${number}` : fallback;
};
