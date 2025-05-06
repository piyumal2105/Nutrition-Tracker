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
import { AuthContext } from "./context/AuthContext";

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
      login({ token });
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
        <Reminders />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
