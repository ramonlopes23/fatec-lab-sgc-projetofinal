import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const  realApi = axios.create({
  baseURL: "/api",
  timeout:10000,
});

realApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if(token){
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
});

realApi.interceptors.response.use(
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

export default realApi;