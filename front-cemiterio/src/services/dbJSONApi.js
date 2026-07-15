import axios from "axios";

const dbJSONApi = axios.create({
    baseURL: import.meta.env.VITE_MOCK_API_BASE_URL || "http://localhost:3000",
    timeout: 10000,
});

export default dbJSONApi;
