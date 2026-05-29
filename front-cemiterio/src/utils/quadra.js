const getQuadraCandidates = (value) => {
    if (!value || typeof value !== "object") return [];

    return [
        value.num_quadra,
        value.number,
        value.numero,
        value.nome,
        value.id,
    ]
        .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
        .map((item) => String(item).trim());
};

export const resolveQuadraDisplay = (value, quadras = []) => {
    if (value === undefined || value === null || value === "") return "";

    if (typeof value === "object") {
        const [firstCandidate = ""] = getQuadraCandidates(value);
        return resolveQuadraDisplay(firstCandidate, quadras);
    }

    const raw = String(value).trim();
    if (!raw) return "";

    const list = Array.isArray(quadras) ? quadras : [];
    const found = list.find((quadra) => {
        const identifiers = [quadra?.id, quadra?.num_quadra, quadra?.number, quadra?.numero, quadra?.nome]
            .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
            .map((item) => String(item).trim());

        return identifiers.includes(raw);
    });

    if (found) {
        return String(found.num_quadra ?? found.number ?? found.numero ?? found.nome ?? found.id ?? raw).trim();
    }

    return raw;
};

export const formatQuadraDisplay = (value, quadras = [], prefix = "Quadra ") => {
    const resolved = resolveQuadraDisplay(value, quadras);
    return resolved ? `${prefix}${resolved}` : "";
};