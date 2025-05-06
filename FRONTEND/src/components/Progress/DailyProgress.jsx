import { useState } from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";

const DailyProgress = ({ progress }) => {
  const [activeTab, setActiveTab] = useState("calories");

  // Calculate percentages for better visualization
  const caloriePercentage = Math.round(
    (progress.caloriesConsumed / progress.calorieGoal) * 100
  );
  const waterPercentage = Math.round(
    (progress.waterConsumed / progress.waterGoal) * 100
  );

  // Custom options for chart to make it more modern
  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Enhanced chart data with better colors
  const calorieData = {
    labels: ["Consumed", "Remaining"],
    datasets: [
      {
        data: [
          progress.caloriesConsumed,
          Math.max(0, progress.calorieGoal - progress.caloriesConsumed),
        ],
        backgroundColor: [
          caloriePercentage > 100 ? "#EF4444" : "#3B82F6",
          "#E5E7EB",
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const waterData = {
    labels: ["Consumed", "Remaining"],
    datasets: [
      {
        data: [
          progress.waterConsumed,
          Math.max(0, progress.waterGoal - progress.waterConsumed),
        ],
        backgroundColor: ["#0EA5E9", "#E5E7EB"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage > 100) return "text-red-500";
    if (percentage > 90) return "text-yellow-500";
    return "text-blue-500";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daily Progress</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "calories"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("calories")}
          >
            Calories
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "water"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("water")}
          >
            Water
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tab Content */}
        <div className={activeTab === "calories" ? "block" : "hidden"}>
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              <Chart
                type="doughnut"
                data={calorieData}
                options={chartOptions}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-gray-800">
                  {caloriePercentage}%
                </p>
                <p className="text-sm text-gray-500">of daily goal</p>
              </div>
            </div>

            <div className="mt-8 w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Progress</span>
                <span
                  className={`font-bold ${getStatusColor(caloriePercentage)}`}
                >
                  {progress.caloriesConsumed} / {progress.calorieGoal} kcal
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    caloriePercentage > 100 ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, caloriePercentage)}%` }}
                ></div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  {progress.calorieStatus}
                </p>
              </div>

              {caloriePercentage > 100 && (
                <div className="mt-4 bg-red-50 p-4 rounded-lg flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-sm text-red-700">
                    You've exceeded your daily calorie goal by{" "}
                    {progress.caloriesConsumed - progress.calorieGoal} calories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={activeTab === "water" ? "block" : "hidden"}>
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              <Chart type="doughnut" data={waterData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-gray-800">
                  {waterPercentage}%
                </p>
                <p className="text-sm text-gray-500">of daily goal</p>
              </div>
            </div>

            <div className="mt-8 w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Progress</span>
                <span className="font-bold text-blue-500">
                  {progress.waterConsumed} / {progress.waterGoal} glasses
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, waterPercentage)}%` }}
                ></div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{progress.waterStatus}</p>
              </div>

              {/* Water visualization using emojis */}
              <div className="mt-4 flex justify-center space-x-1">
                {Array.from({ length: progress.waterGoal }).map((_, index) => (
                  <span
                    key={index}
                    className={`text-2xl ${
                      index < progress.waterConsumed ? "" : "opacity-30"
                    }`}
                  >
                    💧
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card - Always visible */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">CALORIES</p>
              <p className="text-2xl font-bold text-gray-800">
                {progress.caloriesConsumed}
              </p>
              <p className="text-xs text-gray-500">consumed</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-green-600 font-medium">REMAINING</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.max(0, progress.calorieGoal - progress.caloriesConsumed)}
              </p>
              <p className="text-xs text-gray-500">calories left</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">WATER</p>
              <p className="text-2xl font-bold text-gray-800">
                {progress.waterConsumed}
              </p>
              <p className="text-xs text-gray-500">glasses</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-green-600 font-medium">REMAINING</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.max(0, progress.waterGoal - progress.waterConsumed)}
              </p>
              <p className="text-xs text-gray-500">glasses left</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProgress;
