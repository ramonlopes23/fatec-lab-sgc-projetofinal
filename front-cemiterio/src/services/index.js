import realApi from "./realApi.js";
import mockApi from "./mockApi.js";

const apiMode = String(import.meta.env.VITE_API_MODE || "real").trim().toLowerCase();
const api = apiMode === "mock" ? mockApi : realApi;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export { apiMode, fileToDataUrl};
export default api;
