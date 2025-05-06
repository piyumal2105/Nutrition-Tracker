import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";

// Create Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    setUser(userData);
    if (!userData.profileCompleted) {
      navigate("/profile/complete");
    } else {
      navigate("/dashboard");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
