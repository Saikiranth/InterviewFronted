
import axios from "axios";

const api = axios.create({
  baseURL: "https://interview-readiness-backend-hcw2.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default api;

