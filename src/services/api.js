import axios from "axios";

// Kept for easy backend wiring later. The current LMS UI uses a mocked local service layer.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

export default API;
