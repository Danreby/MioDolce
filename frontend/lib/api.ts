import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Inicializa o cookie CSRF do Sanctum.
 * Chame antes de qualquer request de mutação (POST, PUT, DELETE).
 */
export async function initCsrf() {
  await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
}

export default api;
