import { api } from "./index";

type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

// api.ts
let isRefreshing = false;
let queue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  queue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  queue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // если не 401 — просто ошибка
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // чтобы не зациклиться
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // если уже идёт refresh — ставим в очередь
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: () => resolve(api(originalRequest)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // вызываем refresh
      await api.post("/auth/refresh");

      processQueue(null);

      return api(originalRequest);
    } catch (err) {
      processQueue(err);
      window.dispatchEvent(new Event("auth:logout"));
      // если refresh не удался → logout логика
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
