import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: "/api",
  timeout:10000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if(token){
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
});

api.interceptors.response.use(
  (response) => response,
  (error) =>{
    const status = error?.response?.status;
    if(status === 401){
      useAuthStore.getState().logout();
      if(window.location.pathname !== "/login"){
        window.location.href = "/login"
      }
    }
    return Promise.reject(error);
  }
)

export default api;