// src/api/api.js
import axios from "axios";

/**
 * Base URL:
 * - VITE_API_URL (defina no .env do frontend)
 * - fallback para localhost (pra não quebrar dev se esquecer)
 */
const BASE_URL =
  (import.meta?.env?.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
  "http://localhost:8000";

/** Storage keys (centraliza pra parar de caçar string pelo projeto) */
const STORAGE = {
  ok: "auth_ok",
  token: "auth_token",
  nome: "auth_nome",
};

/** Logout centralizado */
function clearSession() {
  localStorage.removeItem(STORAGE.ok);
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.nome);
}

/** Evita mandar "Bearer null/undefined/''" */
function getToken() {
  const t = localStorage.getItem(STORAGE.token);
  if (!t) return null;
  const token = String(t).trim();
  return token ? token : null;
}

/** Instância Axios */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/** Request interceptor (seta Authorization quando existir token) */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // garante objeto headers
    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // remove caso alguma request antiga tenha setado
      if ("Authorization" in config.headers) delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/** Response interceptor (401 = derruba sessão e volta pro login) */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      clearSession();

      const isLoginRoute =
        window.location.pathname === "/login" ||
        window.location.pathname.startsWith("/login/");

      if (!isLoginRoute) window.location.replace("/login");
    }

    return Promise.reject(err);
  }
);