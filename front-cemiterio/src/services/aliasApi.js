import dbJSONApi from "./dbJSONApi.js";

/**
 * Wrapper around dbJSONApi that handles endpoint aliases.
 * Maps service endpoints to their db.json equivalents:
 * - /blocks → API calls to db.json "blocks" collection
 * - /graves → API calls to db.json "graves" collection
 * - /quadras → redirects to /blocks (for backward compatibility)
 * - /covas → redirects to /graves (for backward compatibility)
 */

const normalizeUrl = (url) => {
    let normalized = url;
    // Map legacy endpoint names to service endpoint names
    normalized = normalized.replace(/^\/api\/quadras/, "/blocks");
    normalized = normalized.replace(/^\/quadras/, "/blocks");
    normalized = normalized.replace(/^\/api\/covas/, "/graves");
    normalized = normalized.replace(/^\/covas/, "/graves");
    return normalized;
};

const aliasApi = {
    get: (url, config = {}) => {
        const normalized = normalizeUrl(url);
        return dbJSONApi.get(normalized, config);
    },

    post: (url, data, config = {}) => {
        const normalized = normalizeUrl(url);
        return dbJSONApi.post(normalized, data, config);
    },

    put: (url, data, config = {}) => {
        const normalized = normalizeUrl(url);
        return dbJSONApi.put(normalized, data, config);
    },

    patch: (url, data, config = {}) => {
        const normalized = normalizeUrl(url);
        return dbJSONApi.patch(normalized, data, config);
    },

    delete: (url, config = {}) => {
        const normalized = normalizeUrl(url);
        return dbJSONApi.delete(normalized, config);
    },
};

export default aliasApi;
