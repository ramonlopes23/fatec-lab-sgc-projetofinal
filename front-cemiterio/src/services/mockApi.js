import seedDb from "../../db.json";

const clone = (value) => {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
};

const database = clone(seedDb);

const resolveCollectionName = (name) => name;

for (const collectionName of [
    "blocks",
    "cemeteries",
    "contratos",
    "exumacoes",
    "falecidos",
    "graves",
    "pets",
    "ossarios",
    "sepultamentos",
    "logs",
    "taxas",
    "velorios",
]) {
    if (!Array.isArray(database[collectionName])) {
        database[collectionName] = [];
    }
}

const delay = Number(import.meta.env.VITE_MOCK_API_DELAY_MS || 0);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toResponse = async (data, method, url) => {
    if (delay > 0) {
        await wait(delay);
    }

    return {
        data: clone(data),
        status: 200,
        statusText: "OK",
        headers: {},
        config: { method, url },
    };
};

const toError = (status, message, method, url) => {
    const error = new Error(message);
    error.response = {
        status,
        statusText: message,
        data: { message },
        config: { method, url },
    };
    error.config = { method, url };
    return error;
};

const normalizeUrl = (inputUrl) => {
    const parsed = new URL(inputUrl, "http://mock.local");
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments[0] === "api") {
        segments.shift();
    }

    return { segments, searchParams: parsed.searchParams };
};

const collectionOf = (name) => {
    const resolved = resolveCollectionName(name);
    if (!Array.isArray(database[resolved])) {
        database[resolved] = [];
    }

    return database[resolved];
};

const applyFilters = (items, searchParams) => {
    if (!searchParams || [...searchParams.keys()].length === 0) {
        return items;
    }

    return items.filter((item) => {
        for (const [key, value] of searchParams.entries()) {
            if (String(item?.[key]) !== String(value)) {
                return false;
            }
        }
        return true;
    });
};

const findIndexById = (collection, id) => collection.findIndex((item) => String(item.id) === String(id));

const makeId = (collection) => {
    const numericIds = collection.map((item) => Number(item.id)).filter((id) => Number.isFinite(id));

    if (numericIds.length === collection.length && collection.length > 0) {
        return String(Math.max(...numericIds) + 1);
    }

    let candidate = "";
    do {
        candidate = Math.random().toString(16).slice(2, 8);
    } while (collection.some((item) => String(item.id) === candidate));

    return candidate;
};

const upsert = (collectionName, payload, id = null) => {
    const collection = collectionOf(collectionName);
    const item = clone(payload || {});
    const targetId = id ?? item.id ?? makeId(collection);
    const index = findIndexById(collection, targetId);
    const nextItem = { ...(index >= 0 ? collection[index] : {}), ...item, id: String(targetId) };

    if (index >= 0) {
        collection[index] = nextItem;
    } else {
        collection.push(nextItem);
    }

    return nextItem;
};

const patchInactive = (collectionName, id, payload = {}) => {
    const collection = collectionOf(collectionName);
    const index = findIndexById(collection, id);

    if (index < 0) {
        throw toError(404, `${collectionName} ${id} não encontrado`, "PATCH", `/${collectionName}/${id}/inactive`);
    }

    collection[index] = {
        ...collection[index],
        ...clone(payload),
        status: "inactive",
        ativo: false,
        inactive: true,
    };

    return collection[index];
};

const request = async (method, url, payload) => {
    const { segments, searchParams } = normalizeUrl(url);

    if (!segments.length) {
        return toResponse({}, method, url);
    }

    const [collectionName, maybeId, maybeAction] = segments;
    const collection = collectionOf(collectionName);

    if (method === "get") {
        if (!maybeId) {
            return toResponse(applyFilters(collection, searchParams), method, url);
        }

        const index = findIndexById(collection, maybeId);
        if (index < 0) {
            throw toError(404, `${collectionName} ${maybeId} não encontrado`, method, url);
        }

        return toResponse(collection[index], method, url);
    }

    if (method === "post") {
        if (maybeAction === "inactive") {
            return toResponse(patchInactive(collectionName, maybeId, payload), method, url);
        }

        return toResponse(upsert(collectionName, payload, maybeId), method, url);
    }

    if (method === "put") {
        if (!maybeId) {
            return toResponse(upsert(collectionName, payload), method, url);
        }

        return toResponse(upsert(collectionName, { ...payload, id: maybeId }, maybeId), method, url);
    }

    if (method === "patch") {
        if (maybeAction === "inactive") {
            return toResponse(patchInactive(collectionName, maybeId, payload), method, url);
        }

        if (!maybeId) {
            return toResponse({}, method, url);
        }

        return toResponse(upsert(collectionName, { ...payload }, maybeId), method, url);
    }

    if (method === "delete") {
        const index = findIndexById(collection, maybeId);
        if (index < 0) {
            throw toError(404, `${collectionName} ${maybeId} não encontrado`, method, url);
        }

        const removed = collection.splice(index, 1)[0];
        return toResponse(removed, method, url);
    }

    throw toError(405, `Método ${method.toUpperCase()} não suportado`, method, url);
};

const mockApi = {
    get: (url, config = {}) => request("get", url, config?.params),
    post: (url, data, config = {}) => request("post", url, data ?? config?.data),
    put: (url, data, config = {}) => request("put", url, data ?? config?.data),
    patch: (url, data, config = {}) => request("patch", url, data ?? config?.data),
    delete: (url, config = {}) => request("delete", url, config?.data),
};

export default mockApi;
