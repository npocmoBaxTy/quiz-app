// api.ts
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import axios from "axios";

// Адрес API задаётся на этапе сборки: Vite подставляет значение VITE_API_URL
// внутрь бандла, поэтому переменную нужно передать билду, а не рантайму.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
  withCredentials: true,
});

// api импортируется откуда нужно

interface CustomConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// error может быть либо объектом ошибки (при провале), либо null (при успехе)
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomConfig;

    if (!originalRequest) return Promise.reject(error);

    // ❗ не трогаем сам запрос refresh, чтобы не было цикла
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Если кто-то УЖЕ обновляет токен, просто ждем в очереди
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh");
        processQueue(null); // Передаем null, так как ошибки нет

        return api(originalRequest);
      } catch (refreshError) {
        // В блоке catch переменная обычно имеет тип unknown, приводим к AxiosError
        const axiosError = refreshError as AxiosError;

        processQueue(axiosError);

        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(axiosError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
