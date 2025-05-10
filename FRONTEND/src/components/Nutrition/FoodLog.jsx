import { useState, useEffect } from "react";
import api from "../../utils/api";
import { PlusCircle, Check, AlertCircle, Trash2 } from "lucide-react";

const FoodLog = ({ userId, date, calorieGoal = 2000 }) => {
  const [foodLog, setFoodLog] = useState({
    mealType: "",
    foodName: "",
    calories: "",
    date,
  });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" or "error"
  const [isLoading, setIsLoading] = useState(false);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);

  // Fetch daily calories and recent logs on mount
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const response = await api.get(
          `/nutrition/progress/daily/${userId}?date=${date}`
        );
        if (response.data) {
          setDailyCalories(response.data.caloriesConsumed || 0);
          setRecentLogs(response.data.foodLogs || []);
        }
      } catch (err) {
        console.error("Failed to fetch nutrition data:", err);
      }
    };

    fetchNutritionData();
  }, [userId, date, message]);

  // Handle input changes
  const handleChange = (e) => {
    setFoodLog({ ...foodLog, [e.target.name]: e.target.value });
  };

  // Handle food log submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodLog.mealType || !foodLog.foodName || !foodLog.calories) {
      setMessage("Please fill in all fields");
      setStatus("error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/nutrition/food/${userId}`, foodLog);
      setMessage(response.data.message || "Food logged successfully!");
      setStatus(response.data.warning ? "warning" : "success");
      setFoodLog({ mealType: "", foodName: "", calories: "", date });
    } catch (err) {
      setMessage(err.response?.data || "Failed to log food");
      setStatus("error");
    } finally {
      setIsLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setStatus("");
      }, 3000);
    }
  };

  // Handle food log deletion
  const handleDelete = async (foodLogId) => {
    setIsLoading(true);
    try {
      const response = await api.delete(
        `/nutrition/food/${userId}/${foodLogId}`
      );
      setMessage(response.data || "Food log deleted successfully!");
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data || "Failed to delete food log");
      setStatus("error");
    } finally {
      setIsLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setStatus("");
      }, 3000);
    }
  };

  // Calculate calorie progress percentage
  const caloriePercentage = Math.min(
    100,
    Math.round((dailyCalories / calorieGoal) * 100)
  );

  // Get progress bar color based on percentage
  const getProgressColor = () => {
    if (caloriePercentage > 100) return "bg-red-500";
    if (caloriePercentage > 85) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Food Tracker</h2>

      {/* Calorie Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Daily Calories
          </span>
          <span className="text-sm font-bold">
            {dailyCalories} / {calorieGoal} kcal
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${getProgressColor()} h-3 rounded-full transition-all duration-500 ease-in-out`}
            style={{ width: `${caloriePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center ${
            status === "success"
              ? "bg-green-100 text-green-700"
              : status === "warning"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status === "success" ? (
            <Check size={18} className="mr-2" />
          ) : (
            <AlertCircle size={18} className="mr-2" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Food Log Form */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="mealType"
          >
            Meal Type
          </label>
          <select
            id="mealType"
            name="mealType"
            value={foodLog.mealType}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Select Meal</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="foodName"
          >
            Food Name
          </label>
          <input
            id="foodName"
            type="text"
            name="foodName"
            value={foodLog.foodName}
            onChange={handleChange}
            placeholder="e.g., Grilled Chicken Salad"
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="calories"
          >
            Calories
          </label>
          <input
            id="calories"
            type="number"
            name="calories"
            value={foodLog.calories}
            onChange={handleChange}
            placeholder="e.g., 350"
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-medium ${
            isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } transition-all`}
        >
          {isLoading ? (
            <span>Logging...</span>
          ) : (
            <>
              <PlusCircle size={18} className="mr-2" />
              <span>Add Food</span>
            </>
          )}
        </button>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Recent Entries
          </h3>
          <div className="divide-y divide-gray-100">
            {recentLogs.slice(0, 3).map((log, index) => (
              <div
                key={index}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{log.foodName}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {log.mealType}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-bold">{log.calories} kcal</p>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={isLoading}
                    className={`text-red-500 hover:text-red-700 transition-colors ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="Delete entry"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog;
