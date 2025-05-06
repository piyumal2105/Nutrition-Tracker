import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

// Complete Profile Component
const CompleteProfile = () => {
  const { user, login } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    age: "",
    weight: "",
    height: "",
    healthGoal: "",
    dietPreference: "",
  });
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle profile submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/nutrition/profile/${user.id}`, profile);
      login({ ...user, profileCompleted: true });
    } catch (err) {
      setError(err.response?.data || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Complete Your Profile
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="number"
            name="weight"
            value={profile.weight}
            onChange={handleChange}
            placeholder="Weight (kg)"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <input
            type="number"
            name="height"
            value={profile.height}
            onChange={handleChange}
            placeholder="Height (cm)"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <select
            name="healthGoal"
            value={profile.healthGoal}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Health Goal</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="mb-4">
          <select
            name="dietPreference"
            value={profile.dietPreference}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Diet Preference</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="omnivore">Omnivore</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default CompleteProfile;
