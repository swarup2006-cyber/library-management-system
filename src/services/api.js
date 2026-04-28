import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

const isLoopbackHost = (hostname = "") => {
  const normalizedHost = hostname.toLowerCase();
  return normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost === "::1";
};

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).trim();

  if (typeof window === "undefined") {
    return configuredBaseUrl;
  }

  try {
    const apiUrl = new URL(configuredBaseUrl, window.location.origin);
    const appHost = window.location.hostname.toLowerCase();
    const apiHost = apiUrl.hostname.toLowerCase();

    // When the app is opened from another laptop on the LAN, `localhost`
    // should point at the machine serving the frontend, not the viewer's laptop.
    if (isLoopbackHost(apiHost) && !isLoopbackHost(appHost)) {
      apiUrl.hostname = appHost;
    }

    return apiUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredBaseUrl;
  }
};

export const API_BASE_URL = resolveApiBaseUrl();

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default API;
