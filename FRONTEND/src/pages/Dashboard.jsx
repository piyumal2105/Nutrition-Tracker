import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import FoodLog from "../components/Nutrition/FoodLog";
import WaterLog from "../components/Nutrition/WaterLog";
import DailyProgress from "../components/Progress/DailyProgress";
import WeeklyProgress from "../components/Progress/WeeklyProgress";
import api from "../utils/api";
import {
  CalendarDays,
  User,
  LogOut,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("daily"); // "daily" or "weekly"

  // Fetch progress
  const fetchProgress = async () => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const endpoint =
        activeTab === "daily"
          ? `/nutrition/progress/daily/${user.id}?date=${date}`
          : `/nutrition/progress/weekly/${user.id}?startDate=${date}`;
      console.log(
        `Fetching progress for user ${user.id}, endpoint ${endpoint}`
      );
      const response = await api.get(endpoint);
      setProgress(response.data);
      setError("");
    } catch (err) {
      console.error(
        `Failed to fetch ${activeTab} progress:`,
        err.response?.data,
        err.response?.status
      );
      setError(
        err.response?.data?.message ||
          `Failed to load ${activeTab} progress data. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [date, user, activeTab]);

  if (!user || !user.id) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your nutrition dashboard.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => (window.location.href = "/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Format date for header display
  const formatDateForHeader = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Nutrition Dashboard
            </h1>
            <span className="hidden md:inline-block text-gray-500">|</span>
            <span className="hidden md:flex items-center text-gray-500">
              <CalendarDays size={18} className="mr-2" />
              {formatDateForHeader()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-700">
              <User size={18} className="mr-2" />
              <span className="font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut size={18} className="mr-1" />
              <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Date selector and tabs */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="date-select"
                className="font-medium text-gray-700"
              >
                Select Date:
              </label>
              <input
                id="date-select"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("daily")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "daily"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors`}
              >
                Daily View
              </button>
              <button
                onClick={() => setActiveTab("weekly")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "weekly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors`}
              >
                Weekly View
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        {loading && (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading your nutrition data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setError("");
                fetchProgress();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {activeTab === "daily"
                    ? "Today's Progress"
                    : "Weekly Overview"}
                </h2>
              </div>
              <div className="p-6">
                {activeTab === "daily" && progress && (
                  <DailyProgress progress={progress} />
                )}
                {activeTab === "weekly" && progress && (
                  <WeeklyProgress userId={user.id} startDate={date} />
                )}
              </div>
            </div>

            {/* Food and Water Tracking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Food Log */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Food Log
                  </h2>
                </div>
                <div className="p-6">
                  {progress && (
                    <FoodLog
                      foodData={progress.foodLogs}
                      date={date}
                      userId={user.id}
                    />
                  )}
                </div>
              </div>

              {/* Water Log */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Water Intake
                  </h2>
                </div>
                <div className="p-6">
                  {progress && (
                    <WaterLog
                      waterData={progress.waterLogs}
                      date={date}
                      userId={user.id}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
