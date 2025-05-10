import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { User, Trash2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchProfile = async () => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/user/profile/${user.id}`);
      setProfile(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch profile:", err.response?.data);
      setError(
        err.response?.data?.message || "Failed to load profile data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await api.delete(`/user/${user.id}`);
      logout();
      navigate("/login?message=Account%20deleted%20successfully");
    } catch (err) {
      console.error("Failed to delete account:", err.response?.data);
      setError(
        err.response?.data?.message || "Failed to delete account. Please try again."
      );
      setShowDeleteConfirm(false);
    }
  };

  if (!user || !user.id) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-700">
              <User size={18} className="mr-2" />
              <span className="font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v-7a2 2 0 00-2-2H5"
                />
              </svg>
              <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading profile data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setError("");
                fetchProfile();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && profile && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profile.profileImage ? (
                  <img
                    className="h-32 w-32 rounded-full object-cover"
                    src={profile.profileImage}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={48} className="text-gray-500" />
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{profile.name}</h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{profile.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Source</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.registrationSource || "Standard"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Age</dt>
                    <dd className="text-sm text-gray-900">{profile.age || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.weight ? `${profile.weight} kg` : "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Height</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.height ? `${profile.height} cm` : "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Health Goal</dt>
                    <dd className="text-sm text-gray-900">{profile.healthGoal || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Diet Preference</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.dietPreference || "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Daily Calorie Goal</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.dailyCalorieGoal ? `${profile.dailyCalorieGoal} kcal` : "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Daily Water Goal</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.dailyWaterGoal ? `${profile.dailyWaterGoal} glasses` : "Not set"}
                    </dd>
                  </div>
                </dl>

                {/* Delete Account Button */}
                <div className="mt-8">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Confirm Account Deletion
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete your account? This action cannot be undone, and all your data will be permanently removed.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
