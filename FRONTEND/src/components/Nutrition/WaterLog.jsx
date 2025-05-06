import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Droplet, Plus, Minus, Check, AlertCircle } from "lucide-react";

const WaterLog = ({ userId, date, waterGoal = 8 }) => {
  const [glasses, setGlasses] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyWater, setDailyWater] = useState(0);
  const [waterHistory, setWaterHistory] = useState([]);

  // Fetch water intake data on mount
  useEffect(() => {
    const fetchWaterData = async () => {
      try {
        const response = await api.get(
          `/nutrition/progress/daily/${userId}?date=${date}`
        );
        if (response.data) {
          setDailyWater(response.data.waterConsumed || 0);
          setWaterHistory(response.data.waterLogs || []);
        }
      } catch (err) {
        console.error("Failed to fetch water data:", err);
      }
    };

    fetchWaterData();
  }, [userId, date, message]);

  // Adjust glasses quantity
  const decrementGlasses = () => {
    setGlasses((prev) => Math.max(1, prev - 1));
  };

  const incrementGlasses = () => {
    setGlasses((prev) => prev + 1);
  };

  // Handle water log submission
  const handleLogWater = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/nutrition/water/${userId}`, {
        glasses,
        date,
      });
      setMessage(response.data.message || "Water logged successfully!");
      setStatus("success");
      setGlasses(1);
    } catch (err) {
      setMessage(err.response?.data || "Failed to log water");
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

  // Calculate water progress percentage
  const waterPercentage = Math.min(
    100,
    Math.round((dailyWater / waterGoal) * 100)
  );

  // Get water drops based on current intake
  const getWaterDrops = () => {
    const drops = [];
    const filledDrops = Math.min(8, dailyWater);

    for (let i = 0; i < 8; i++) {
      drops.push(
        <Droplet
          key={i}
          size={i < filledDrops ? 24 : 20}
          className={`transition-all duration-300 ${
            i < filledDrops ? "text-blue-500 fill-blue-500" : "text-blue-200"
          }`}
        />
      );
    }
    return drops;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Water Tracker</h2>

      {/* Water Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Daily Water Intake
          </span>
          <span className="text-sm font-bold">
            {dailyWater} / {waterGoal} glasses
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${waterPercentage}%` }}
          ></div>
        </div>

        {/* Water Drop Visualization */}
        <div className="flex justify-center space-x-2 mb-6">
          {getWaterDrops()}
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center ${
            status === "success"
              ? "bg-green-100 text-green-700"
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

      {/* Water Log Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How many glasses did you drink?
        </label>
        <div className="flex items-center justify-center">
          <button
            onClick={decrementGlasses}
            className="p-2 bg-gray-100 rounded-l-lg border border-gray-300 hover:bg-gray-200 transition-all"
          >
            <Minus size={20} />
          </button>
          <div className="px-8 py-2 border-t border-b border-gray-300 text-xl font-bold">
            {glasses}
          </div>
          <button
            onClick={incrementGlasses}
            className="p-2 bg-gray-100 rounded-r-lg border border-gray-300 hover:bg-gray-200 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleLogWater}
        disabled={isLoading}
        className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-medium ${
          isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        } transition-all`}
      >
        {isLoading ? (
          <span>Logging...</span>
        ) : (
          <>
            <Droplet size={18} className="mr-2" />
            <span>
              Log {glasses} Glass{glasses > 1 ? "es" : ""}
            </span>
          </>
        )}
      </button>

      {/* Water Intake Timeline */}
      {waterHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Today's Hydration
          </h3>
          <div className="space-y-3">
            {waterHistory.map((log, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-16 text-gray-500">
                  {log.date} {/* Display date directly, or format if needed */}
                </div>
                <div className="flex-1 flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  <div className="font-medium">
                    {log.glasses} glass{log.glasses > 1 ? "es" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Water Intake Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">💧 Hydration Tip</p>
        <p>
          Drinking water improves energy levels, brain function, and helps
          maintain healthy skin.
        </p>
      </div>
    </div>
  );
};

export default WaterLog;
