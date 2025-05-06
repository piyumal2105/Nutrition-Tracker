import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("api.js: Adding Authorization header with token");
    } else {
      console.log("api.js: No token found");
    }
    return config;
  },
  (error) => {
    console.error("api.js: Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "api.js: Response error:",
      error.response?.status,
      error.message
    );
    if (error.response && error.response.status === 401) {
      console.log("api.js: 401 Unauthorized, clearing token");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login?error=Session%20expired";
    }
    return Promise.reject(error);
  }
);

export default api;
