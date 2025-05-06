import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading...</p>
      </div>
    );
  }

  if (!user || !user.id) {
    console.log("ProtectedRoute: User not authenticated or missing id", {
      user,
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
