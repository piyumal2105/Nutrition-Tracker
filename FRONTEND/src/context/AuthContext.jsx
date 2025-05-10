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
          setUser({ ...decoded, token });
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          logout();
        }
      } catch (e) {
        console.error("Failed to decode token on mount:", e);
        logout();
      }
    }
  }, []);

  // Login function
  const login = (userData) => {
    const { token, id, name, email, profileCompleted, ...rest } = userData;
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const decoded = jwtDecode(token);
      const userState = {
        id: id || decoded.sub || decoded.id, // Fallback to decoded.sub or decoded.id
        name: name || decoded.name || "",
        email: email || decoded.email || "",
        profileCompleted: profileCompleted || false,
        token,
        ...rest,
        ...decoded, // Include any additional decoded fields
      };
      setUser(userState);
      console.log("AuthContext: User set after login", userState);
    } catch (e) {
      console.error("Failed to decode token in login:", e);
      const userState = {
        id,
        name,
        email,
        profileCompleted: profileCompleted || false,
        token,
        ...rest,
      };
      setUser(userState);
      console.log("AuthContext: User set without decoding", userState);
    }
    if (!profileCompleted) {
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
