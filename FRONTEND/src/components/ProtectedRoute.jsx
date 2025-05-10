import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user || !user.token) {
    console.log("ProtectedRoute: User not authenticated or missing token", {
      user,
    });
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: User authenticated", { user });
  return children;
};

export default ProtectedRoute;
