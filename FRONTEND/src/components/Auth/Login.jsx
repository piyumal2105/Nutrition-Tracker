import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login: Response from /auth/login", response.data);
      login(response.data);
    } catch (err) {
      console.error("Login: Error from /auth/login", err.response?.data);
      setError(err.response?.data || "Login failed");
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    // Redirect to backend's Google OAuth endpoint
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 p-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.37-.98 2.53-2.07 3.3v2.74h3.34c1.95-1.8 3.07-4.45 3.07-7.8z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.34-2.74c-1.01.68-2.3 1.08-3.94 1.08-3.03 0-5.6-2.05-6.52-4.81H2.07v3.03C3.88 20.65 7.75 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.48 14.36c-.23-.68-.36-1.41-.36-2.16s.13-1.48.36-2.16V7.01H2.07c-.7 2.14-1.07 4.42-1.07 6.75s.37 4.61 1.07 6.75h3.41v-3.03z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.16-3.16C17.46 2.01 14.97 1 12 1 7.75 1 3.88 3.35 2.07 7.01h3.41v3.03c.92-2.76 3.49-4.66 6.52-4.66z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </button>
        </div>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
