import realApi from "./realApi.js";
import mockApi from "./mockApi.js";
import aliasApi from "./aliasApi.js";

const apiMode = String(import.meta.env.VITE_API_MODE || "dbjsonapi")
    .trim()
    .toLowerCase();
const api = apiMode === "mock" ? mockApi : apiMode === "dbjsonapi" ? aliasApi : realApi;

const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export { apiMode, fileToDataUrl };
export default api;
