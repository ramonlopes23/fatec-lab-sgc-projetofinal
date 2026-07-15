import { hasTituloPosse } from "./contrato.js";
import {
    getSepulturaCapacity,
    getSepulturaNumber,
    getSepulturaQuadraRef,
    normalizeSepulturaStatus,
} from "./sepultura.js";

export const resolveBlockId = (value) => {
    if (value && typeof value === "object") {
        return value.id ?? value.blockId ?? "";
    }
    return value ?? "";
};

export const normalizeMapKey = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
};

export const resolveCovaNumber = (cova = {}, sepultamento = {}, grave = {}) =>
    normalizeMapKey(getSepulturaNumber(sepultamento) || getSepulturaNumber(cova) || getSepulturaNumber(grave));

export const resolveCovaQuadraKey = (cova = {}, sepultamento = {}, grave = {}, fallbackQuadra = "") =>
    normalizeMapKey(
        getSepulturaQuadraRef(cova) ||
            getSepulturaQuadraRef(sepultamento) ||
            getSepulturaQuadraRef(grave) ||
            resolveBlockId(grave?.blockId ?? grave?.block) ||
            fallbackQuadra
    );

export const COVA_SORT_MODES = {
    cadastro: "cadastro",
    numero: "numero",
};

export const compareCovaNumber = (a, b) =>
    normalizeMapKey(getSepulturaNumber(a) || a?.numero).localeCompare(
        normalizeMapKey(getSepulturaNumber(b) || b?.numero),
        "pt-BR",
        {
            numeric: true,
            sensitivity: "base",
        }
    );

export const sortCovasByNumber = (covas = []) => [...covas].sort(compareCovaNumber);

export const normalizeCovaStatus = (s) => {
    const status = normalizeSepulturaStatus({ status: s });
    return status === "disponivel" ? "livre" : status;
};

export const getSepultadosCount = (sepultamentosAll = [], quadraOrId) => {
    const quadraNum =
        quadraOrId && typeof quadraOrId === "object" ? (quadraOrId.num_quadra ?? quadraOrId.id) : quadraOrId;
    if (quadraNum === null || quadraNum === undefined || quadraNum === "") return 0;
    const qStr = String(quadraNum);

    const ids = new Set();
    (sepultamentosAll || []).forEach((s) => {
        if (s.foi_exumado) return;
        const confirmed = s.confirmado === true || String(s.confirmado).toLowerCase() === "true";
        const concluded = String(s.status ?? "")
            .toLowerCase()
            .includes("concl");
        if (!confirmed && !concluded) return;
        const sQ = s.quadra_sep ?? s.quadra ?? "";
        if (String(sQ) === qStr) {
            const id = s.id ?? s._id ?? null;
            if (id != null) ids.add(String(id));
            else ids.add(`${qStr}-${getSepulturaNumber(s)}-${s.dh_sep ?? s.data_obito_sep ?? ""}`);
        }
    });
    return ids.size;
};

export const getSepultadosCountBySep = (cova, quadraId, sepultamentosAll = []) => {
    if (!cova) return 0;
    const quadraKey = String(quadraId ?? getSepulturaQuadraRef(cova) ?? "");
    const numero = String(getSepulturaNumber(cova));
    if (!quadraKey || !numero) return 0;

    const ids = new Set();
    (sepultamentosAll || []).forEach((s) => {
        if (s.foi_exumado) return;
        const confirmed = s.confirmado === true || String(s.confirmado).toLowerCase() === "true";
        const concluded = String(s.status ?? "")
            .toLowerCase()
            .includes("concl");
        if (!confirmed && !concluded) return;
        const sQuadra = String(getSepulturaQuadraRef(s));
        const sNum = String(getSepulturaNumber(s));
        if (sQuadra === quadraKey && sNum === numero) {
            const id = s.id ?? s._id ?? null;
            if (id != null) ids.add(String(id));
            else ids.add(`${sQuadra}-${sNum}-${s.dh_sep ?? ""}`);
        }
    });
    if (cova.sep) {
        const sepId = cova.sep.id ?? null;
        if (sepId != null) ids.add(String(sepId));
    }
    return ids.size;
};

export const getPetsCountBySep = (cova, quadraId, petsAll = []) => {
    if (!cova) return 0;

    const quadraKey = String(quadraId ?? getSepulturaQuadraRef(cova) ?? "");
    const numero = String(getSepulturaNumber(cova));
    if (!quadraKey || !numero) return 0;

    const ids = new Set();
    (petsAll || []).forEach((p) => {
        if (p.foi_exumado) return;
        const pQuadra = String(getSepulturaQuadraRef(p));
        const pNum = String(getSepulturaNumber(p));
        if (pQuadra === quadraKey && pNum === numero) {
            const id = p.id ?? p._id ?? null;
            if (id != null) ids.add(String(id));
            else ids.add(`${pQuadra}-${pNum}-${p.dh_sep_pet ?? p.data_obito_pet ?? ""}`);
        }
    });
    return ids.size;
};

export const getCovaDisplayMeta = (cova, quadraSelecionada = {}, sepultamentosAll = [], petsAll = []) => {
    const grave = cova?.cova?.grave ?? cova?.grave ?? {};
    const backendStatus = String(grave?.status ?? "").toUpperCase();
    const rawAreaType = grave?.areaType ?? grave?.area_type ?? cova?.areaType ?? cova?.area_type ?? "";
    const isPerpetual = String(rawAreaType).toUpperCase() === "PERPETUAL";
    const isBlocked = !!grave?.blocked;

    const sepCount = getSepultadosCountBySep(
        cova,
        quadraSelecionada.id ?? quadraSelecionada.num_quadra,
        sepultamentosAll
    );
    const petCount = getPetsCountBySep(cova, quadraSelecionada.id ?? quadraSelecionada.num_quadra, petsAll);
    const capacidadeTotal = Number(getSepulturaCapacity(cova));
    const occupiedCount =
        sepCount > 0 ? sepCount : backendStatus === "OCCUPIED" && capacidadeTotal > 0 ? capacidadeTotal : 0;

    let displayStatus = "disponivel";
    if (isBlocked || backendStatus === "MAINTENANCE") displayStatus = "indisponivel";
    else if (backendStatus === "OCCUPIED") displayStatus = isPerpetual ? "particular_ocupada" : "ocupada";
    else if (isPerpetual) displayStatus = "reservada";

    return {
        displayStatus,
        sepCount,
        petCount,
        capacidadeTotal,
        occupiedCount,
    };
};

export const getVisibleBlocks = (blocks = [], selectedCemeteryId) => {
    const selectedId = selectedCemeteryId == null ? "" : String(selectedCemeteryId).trim();
    if (!selectedId) return [];

    return (blocks || []).filter((block) => String(block.cemeteryId) === selectedId);
};

export const buildQuadrasFromData = (visibleBlocks = [], covasData = [], sepultamentosAll = []) => {
    const visibleSepData = (sepultamentosAll || []).filter((s) => !s.foi_exumado);
    const quadraMap = new Map();
    const blockIdByNumber = new Map();

    (visibleBlocks || []).forEach((block) => {
        const blockId = String(block.id ?? "").trim();
        if (!blockId) return;

        const blockNumber = String(block.number ?? "").trim();
        if (blockNumber) blockIdByNumber.set(blockNumber, blockId);

        quadraMap.set(blockId, {
            id: block.id,
            num_quadra: String(block.number),
            nome: `Quadra ${block.number}`,
            descricao: block.description || "",
            cemeteryId: block.cemeteryId,
            max_covas: 0,
            covas: [],
        });
    });

    const resolveVisibleQuadraKey = (value) => {
        const raw = String(resolveBlockId(value) ?? "").trim();
        if (!raw) return "";
        if (quadraMap.has(raw)) return raw;
        return blockIdByNumber.get(raw) || "";
    };

    (covasData || []).forEach((cova) => {
        const qKey = resolveVisibleQuadraKey(getSepulturaQuadraRef(cova));
        if (!qKey) return;

        const quadraObj = quadraMap.get(qKey);
        const numero = getSepulturaNumber(cova);
        const capacity = getSepulturaCapacity(cova);
        const cap = capacity === "" || capacity === null ? null : Number(capacity);
        const normalizedStatus =
            cap !== null && !Number.isNaN(cap) && cap <= 0 ? "lotada" : normalizeCovaStatus(cova.status);

        quadraObj.covas.push({
            id: cova.id ?? `${qKey}-${numero}`,
            numero,
            status: normalizedStatus,
            capacidade: cap,
            cova,
        });
    });

    visibleSepData.forEach((sep) => {
        const confirmed = sep.confirmado === true || String(sep.confirmado).toLowerCase() === "true";
        const sepIsConcluded =
            confirmed ||
            String(sep.status ?? "")
                .toLowerCase()
                .includes("concl");
        if (!sepIsConcluded) return;

        const qKey = resolveVisibleQuadraKey(getSepulturaQuadraRef(sep));
        if (!qKey) return;

        const quadraObj = quadraMap.get(qKey);
        const numero = getSepulturaNumber(sep);
        const titulo_posse = hasTituloPosse(sep);

        const existing = quadraObj.covas.find((c) => String(c.numero) === String(numero));

        if (existing) {
            if (sepIsConcluded) {
                existing.status = "ocupada";
                existing.sep = sep;
            } else if (titulo_posse && existing.status !== "ocupada") {
                existing.status = "reservada";
                existing.sep = existing.sep || sep;
            } else {
                existing.sep = existing.sep || sep;
            }
        } else {
            quadraObj.covas.push({
                id: sep.id ?? `${qKey}-${numero}`,
                numero,
                status: titulo_posse ? "reservada" : "ocupada",
                sep,
            });
        }
    });

    return Array.from(quadraMap.values()).sort((a, b) => Number(a.num_quadra) - Number(b.num_quadra));
};

export const getSepCountsByQuadra = (sepultamentosAll = [], covasData = []) => {
    const covaIdToQuadra = Object.fromEntries((covasData || []).map((c) => [String(c.id), getSepulturaQuadraRef(c)]));

    const tmp = {};
    const visibleSepData = (sepultamentosAll || []).filter((sep) => !sep.foi_exumado);
    visibleSepData.forEach((sep) => {
        const confirmed = sep.confirmado === true || String(sep.confirmado).toLowerCase() === "true";
        const concluded = String(sep.status ?? "")
            .toLowerCase()
            .includes("concl");
        if (!confirmed && !concluded) return;
        const sepId = sep.id ?? sep._id ?? null;
        const quadraKey = String(
            getSepulturaQuadraRef(sep) ||
                covaIdToQuadra[String(sep.graveId ?? sep.grave_id ?? sep.covaId ?? sep.cova ?? "")] ||
                "0"
        );
        if (!tmp[quadraKey]) tmp[quadraKey] = new Set();
        if (sepId != null) tmp[quadraKey].add(String(sepId));
        else tmp[quadraKey].add(`${quadraKey}-${getSepulturaNumber(sep)}-${sep.dh_sep ?? sep.data_obito_sep ?? ""}`);
    });
    const countsObj = {};
    Object.keys(tmp).forEach((k) => {
        countsObj[k] = tmp[k].size;
    });
    return countsObj;
};
