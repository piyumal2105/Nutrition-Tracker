import { useState, useEffect } from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import api from "../../utils/api";

const WeeklyProgress = ({ userId, startDate }) => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("calories");
  const [viewMode, setViewMode] = useState("chart");

  // Fetch weekly progress
  useEffect(() => {
    const fetchProgress = async () => {
      // Validate userId and startDate
      if (!userId || !startDate) {
        setError("User ID or start date is missing.");
        setIsLoading(false);
        return;
      }

      // Validate startDate format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate)) {
        setError("Invalid start date format. Use YYYY-MM-DD.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(
          `/nutrition/progress/weekly/${userId}?startDate=${startDate}`
        );
        setProgress(response.data);
        setError(null);
      } catch (err) {
        console.error(
          "Failed to fetch weekly progress:",
          err.response?.data,
          err.response?.status
        );
        setError(
          err.response?.data?.message ||
            "Failed to load weekly progress data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [startDate, userId]);

  // Format dates more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to calculate average values
  const calculateAverage = (values) => {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / values.length);
  };

  // Helper to find max value and its date
  const findMaxEntry = (dataObj) => {
    if (!dataObj || Object.keys(dataObj).length === 0)
      return { date: "-", value: 0 };

    let maxDate = Object.keys(dataObj)[0];
    let maxValue = dataObj[maxDate];

    Object.entries(dataObj).forEach(([date, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxDate = date;
      }
    });

    return { date: formatDate(maxDate), value: maxValue };
  };

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function (tooltipItems) {
            return formatDate(tooltipItems[0].label);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Generate chart data with better styling
  const generateChartData = () => {
    if (!progress) return null;

    const labels = Object.keys(
      activeTab === "calories" ? progress.dailyCalories : progress.dailyWater
    ).map((date) => date);

    const data = Object.values(
      activeTab === "calories" ? progress.dailyCalories : progress.dailyWater
    );

    // Get goal line (assuming same goal for each day)
    const goalValue =
      activeTab === "calories"
        ? progress.calorieGoal || 2000 // Fallback to default if null
        : progress.waterGoal || 8; // Fallback to default if null
    const goalData = new Array(labels.length).fill(goalValue);

    return {
      labels: labels.map(formatDate),
      datasets: [
        {
          label: activeTab === "calories" ? "Calories" : "Water (Glasses)",
          data: data,
          backgroundColor:
            activeTab === "calories"
              ? "rgba(59, 130, 246, 0.7)"
              : "rgba(14, 165, 233, 0.7)",
          borderColor:
            activeTab === "calories" ? "rgb(37, 99, 235)" : "rgb(2, 132, 199)",
          borderWidth: 2,
          borderRadius: 4,
          barThickness: 16,
        },
        {
          label: "Goal",
          data: goalData,
          type: "line",
          borderColor: "rgba(239, 68, 68, 0.7)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointStyle: false,
          fill: false,
        },
      ],
    };
  };

  // If still loading, show skeleton
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Weekly Progress
        </h2>
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          <p>⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no data yet
  if (!progress) return null;

  // Get chart data
  const chartData = generateChartData();

  // Calculate stats
  const calorieAvg = calculateAverage(Object.values(progress.dailyCalories));
  const waterAvg = calculateAverage(Object.values(progress.dailyWater));
  const maxCalorieDay = findMaxEntry(progress.dailyCalories);
  const maxWaterDay = findMaxEntry(progress.dailyWater);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          Weekly Progress
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === "chart"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setViewMode("chart")}
            >
              Chart
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "calories"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("calories")}
            >
              Calories
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
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
      </div>

      {/* Summary message */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">{progress.summary}</p>
      </div>

      {/* Chart view */}
      {viewMode === "chart" && (
        <div className="h-80 mb-8">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Day
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  {activeTab === "calories" ? "Calories" : "Water (Glasses)"}
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Goal
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  % of Goal
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                activeTab === "calories"
                  ? progress.dailyCalories
                  : progress.dailyWater
              ).map(([date, value]) => {
                const goal =
                  activeTab === "calories"
                    ? progress.calorieGoal || 2000
                    : progress.waterGoal || 8;
                const percentage = goal ? Math.round((value / goal) * 100) : 0;

                return (
                  <tr key={date} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatDate(date)}
                    </td>
                    <td className="px-6 py-4 text-right">{value}</td>
                    <td className="px-6 py-4 text-right">{goal}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-medium ${
                          percentage > 100
                            ? "text-red-500"
                            : percentage >= 90
                            ? "text-green-500"
                            : "text-blue-500"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">
            AVG CALORIES / DAY
          </p>
          <p className="text-2xl font-bold text-gray-800">{calorieAvg}</p>
          <p className="text-xs text-gray-500">
            {calorieAvg >= (progress.calorieGoal || 2000)
              ? "On track"
              : "Below goal"}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">PEAK CALORIE DAY</p>
          <p className="text-2xl font-bold text-gray-800">
            {maxCalorieDay.value}
          </p>
          <p className="text-xs text-gray-500">{maxCalorieDay.date}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">AVG WATER / DAY</p>
          <p className="text-2xl font-bold text-gray-800">{waterAvg}</p>
          <p className="text-xs text-gray-500">
            {waterAvg >= (progress.waterGoal || 8)
              ? "Well hydrated"
              : "Below target"}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">PEAK WATER DAY</p>
          <p className="text-2xl font-bold text-gray-800">
            {maxWaterDay.value}
          </p>
          <p className="text-xs text-gray-500">{maxWaterDay.date}</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgress;
