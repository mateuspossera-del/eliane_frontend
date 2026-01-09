// src/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 20000,
});

// ✅ garante que o header exista
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    config.headers = config.headers || {};

    // ✅ NÃO mandar Bearer "null"/"undefined"/"" (isso dá 401 e você enlouquece)
    if (token && String(token).trim()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ se o backend responder 401, derruba sessão e manda pro login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      localStorage.removeItem("auth_ok");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_nome");

      // evita loop infinito e mantém simples
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);
