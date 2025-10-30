import axios from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "../state/authStore";

const API_BASE =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  (Constants.manifest?.extra as any)?.apiBaseUrl ||
  "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  const accessToken = useAuthStore.getState().accessToken;
  console.log('[API] Making request to:', config.url);
  console.log('[API] Has access token:', !!accessToken);
  if (accessToken) {
    config.headers = config.headers || {};
    (config.headers as any)["Authorization"] = `Bearer ${accessToken}`;
  } else {
    console.warn('[API] No access token available for request');
  }
  return config;
});

let refreshing = false;
async function tryRefreshToken(failedConfig: any) {
  if (refreshing) throw new Error("Already refreshing");
  refreshing = true;
  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) throw new Error("No refresh token");

    const res = await axios.post(`${API_BASE}/auth/token/refresh/`, {
        refresh: refreshToken,
    });

    const newAccess = res.data.access;
    useAuthStore.getState().setTokens(newAccess, refreshToken);

    // retry original request
    failedConfig.headers["Authorization"] = `Bearer ${newAccess}`;
    return api.request(failedConfig);
  } catch (err) {
    // logout on refresh fail
    useAuthStore.getState().logout();
    throw err;
  } finally {
    refreshing = false;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.error('[API] Request failed:', err.config?.url, 'Status:', err.response?.status);

    if (err.response?.status === 401 && !err.config._retry) {
      console.log('[API] Got 401, attempting token refresh...');
      err.config._retry = true; // Prevent infinite retry loops
      try {
        return await tryRefreshToken(err.config);
      } catch (e) {
        console.error('[API] Token refresh failed, logging out');
        throw e;
      }
    }
    throw err;
  }
);
