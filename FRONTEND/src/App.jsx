import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import CompleteProfile from "./components/Profile/CompleteProfile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Reminders from "./components/Reminders.jsx";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import api from "./utils/api";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Callback Component to handle OAuth redirect
const AuthCallback = () => {
  const { login } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    console.log(
      "AuthCallback: Token from search params:",
      token ? "present" : "missing"
    );
    if (token) {
      // Fetch user data using the token
      api
        .get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("AuthCallback: Response from /auth/me", response.data);
          const userData = {
            token,
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            profileCompleted: response.data.profileCompleted || false,
          };
          login(userData);
        })
        .catch((err) => {
          console.error(
            "AuthCallback: Failed to fetch user data:",
            err.response?.data
          );
          window.location.href = "/login?error=Authentication%20failed";
        });
    } else {
      console.error("AuthCallback: No token provided");
      window.location.href = "/login?error=No%20token%20provided";
    }
  }, [searchParams, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
};

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Reminders />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-success" element={<AuthCallback />} />
            <Route
              path="/profile/complete"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
