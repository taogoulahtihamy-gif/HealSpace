const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000/api";
const DEFAULT_LOCAL_SOCKET_URL = "http://localhost:5000";

export const apiConfig = {
  baseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_LOCAL_API_BASE_URL,

  socketUrl:
    import.meta.env.VITE_SOCKET_URL ||
    DEFAULT_LOCAL_SOCKET_URL,

  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  mode: import.meta.env.MODE,
};

export function assertApiConfig() {
  if (!apiConfig.baseUrl) {
    throw new Error("VITE_API_BASE_URL is missing.");
  }

  if (!apiConfig.socketUrl) {
    throw new Error("VITE_SOCKET_URL is missing.");
  }
}
