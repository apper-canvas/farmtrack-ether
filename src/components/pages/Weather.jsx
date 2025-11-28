import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import WeatherCard from "@/components/organisms/WeatherCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import { weatherService } from "@/services/api/weatherService";

const Weather = () => {
  const [data, setData] = useState({
    current: null,
    forecast: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [current, forecast, alerts] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getForecast(),
        weatherService.getWeatherAlerts(),
      ]);

      setData({ current, forecast, alerts });
    } catch (err) {
      console.error("Failed to load weather data:", err);
      setError("Failed to load weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAgriculturalRecommendations = () => {
    if (!data.current) return [];
    
    const recommendations = [];
    const temp = data.current.temperature;
    const condition = data.current.condition?.toLowerCase();
    const humidity = data.current.humidity;
    const wind = data.current.windSpeed;
    
    // Temperature-based recommendations
    if (temp < 32) {
      recommendations.push({
        icon: "Thermometer",
        title: "Frost Protection",
        message: "Protect sensitive crops from frost damage. Consider covering or heating.",
        priority: "high"
      });
    } else if (temp > 90) {
      recommendations.push({
        icon: "Sun",
        title: "Heat Stress",
        message: "Ensure adequate irrigation. Avoid heavy field work during peak heat.",
        priority: "medium"
      });
    }
    
    // Weather condition recommendations
    if (condition?.includes("rain") || condition?.includes("storm")) {
      recommendations.push({
        icon: "CloudRain",
        title: "Wet Conditions",
        message: "Avoid field operations. Good time for indoor planning and equipment maintenance.",
        priority: "medium"
      });
    } else if (condition?.includes("sunny") || condition?.includes("clear")) {
      if (wind < 10) {
        recommendations.push({
          icon: "Sprout",
          title: "Ideal Field Conditions",
          message: "Perfect weather for planting, harvesting, and field applications.",
          priority: "low"
        });
      }
    }
    
    // Wind-based recommendations
    if (wind > 15) {
      recommendations.push({
        icon: "Wind",
        title: "High Winds",
        message: "Avoid spray applications. Secure loose materials and equipment.",
        priority: "medium"
      });
    }
    
    // Humidity-based recommendations
    if (humidity > 80) {
      recommendations.push({
        icon: "Droplets",
        title: "High Humidity",
        message: "Monitor crops for disease pressure. Ensure good air circulation.",
        priority: "low"
      });
    }
    
    return recommendations;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  if (loading) {
    return <Loading message="Loading weather information..." />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadWeatherData} />;
  }

  const recommendations = getAgriculturalRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                Weather Forecast
              </h1>
              <p className="text-gray-600 mt-1">
                Current conditions and agricultural insights
              </p>
            </div>
            
            <Button
              onClick={loadWeatherData}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Weather Alerts */}
        {data.alerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Weather Alerts</h2>
            {data.alerts.map(alert => (
              <div key={alert.Id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <ApperIcon name="AlertTriangle" className="h-6 w-6 text-red-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 mb-1">{alert.title}</h4>
                    <p className="text-red-700 text-sm mb-2">{alert.description}</p>
                    <span className="text-xs text-red-600 font-medium">
                      Valid until: {new Date(alert.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Weather & 5-Day Forecast */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Weather */}
          <div className="lg:col-span-1">
            {data.current && (
              <WeatherCard
                weather={data.current}
                variant="current"
              />
            )}
          </div>

          {/* 5-Day Forecast */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                5-Day Forecast
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {data.forecast.map(day => (
                  <WeatherCard
                    key={day.Id}
                    weather={day}
                    variant="forecast"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <ApperIcon name="Lightbulb" className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Agricultural Recommendations
                </h3>
                <p className="text-gray-600">
                  Weather-based farming insights and advice
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <ApperIcon name={rec.icon} className="h-6 w-6 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">{rec.title}</h4>
                      <p className="text-sm">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Insights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center">
            <div className="p-4 bg-blue-100 rounded-xl mx-auto w-fit mb-4">
              <ApperIcon name="Thermometer" className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Temperature</h4>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {data.current?.temperature}°F
            </p>
            <p className="text-sm text-gray-600">
              {data.current?.temperature > 80 ? "Warm conditions" : 
               data.current?.temperature < 40 ? "Cool conditions" : "Moderate temperature"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center">
            <div className="p-4 bg-cyan-100 rounded-xl mx-auto w-fit mb-4">
              <ApperIcon name="Droplets" className="h-8 w-8 text-cyan-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Humidity</h4>
            <p className="text-3xl font-bold text-cyan-600 mb-2">
              {data.current?.humidity}%
            </p>
            <p className="text-sm text-gray-600">
              {data.current?.humidity > 70 ? "High humidity" : 
               data.current?.humidity < 30 ? "Low humidity" : "Moderate humidity"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center">
            <div className="p-4 bg-green-100 rounded-xl mx-auto w-fit mb-4">
              <ApperIcon name="Wind" className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Wind Speed</h4>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {data.current?.windSpeed} mph
            </p>
            <p className="text-sm text-gray-600">
              {data.current?.windSpeed > 15 ? "Windy conditions" : 
               data.current?.windSpeed < 5 ? "Calm conditions" : "Light breeze"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 text-center">
            <div className="p-4 bg-purple-100 rounded-xl mx-auto w-fit mb-4">
              <ApperIcon name="Eye" className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Visibility</h4>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {data.current?.visibility} mi
            </p>
            <p className="text-sm text-gray-600">
              {data.current?.visibility > 8 ? "Excellent visibility" : 
               data.current?.visibility < 3 ? "Poor visibility" : "Good visibility"}
            </p>
          </div>
        </div>

        {/* Detailed Forecast Table */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Detailed Forecast
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Condition</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">High/Low</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Precipitation</th>
                </tr>
              </thead>
              <tbody>
                {data.forecast.map(day => (
                  <tr key={day.Id} className="border-b border-gray-100 hover:bg-sage-50 transition-colors">
                    <td className="py-3 px-4">
                      {new Date(day.date).toLocaleDateString("en-US", { 
                        weekday: "short", 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-gray-900 font-medium">
                        {day.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900">
                        {day.high}°
                      </span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-gray-600">
                        {day.low}°
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Droplets" className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-900 font-medium">
                          {day.precipitation}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;