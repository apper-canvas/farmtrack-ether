import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { formatDate } from "@/utils/dateUtils";

const WeatherCard = ({ weather, variant = "current", className = "" }) => {
  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return "Sun";
      case "cloudy":
      case "overcast":
        return "Cloud";
      case "rainy":
      case "rain":
        return "CloudRain";
      case "stormy":
      case "thunderstorm":
        return "CloudLightning";
      case "snowy":
      case "snow":
        return "CloudSnow";
      case "foggy":
      case "fog":
        return "CloudDrizzle";
      default:
        return "Cloud";
    }
  };

  const getWeatherColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return "text-yellow-600 bg-yellow-100";
      case "cloudy":
      case "overcast":
        return "text-gray-600 bg-gray-100";
      case "rainy":
      case "rain":
        return "text-blue-600 bg-blue-100";
      case "stormy":
      case "thunderstorm":
        return "text-purple-600 bg-purple-100";
      case "snowy":
      case "snow":
        return "text-blue-200 bg-blue-50";
      case "foggy":
      case "fog":
        return "text-gray-500 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (variant === "forecast") {
    return (
      <div className={`bg-white rounded-xl shadow-card border border-gray-100 p-4 ${className}`}>
        <div className="text-center space-y-3">
          <div className="text-sm font-medium text-gray-600">
            {formatDate(weather.date, "EEE, MMM d")}
          </div>
          
          <div className={`p-3 rounded-xl mx-auto w-fit ${getWeatherColor(weather.condition)}`}>
            <ApperIcon 
              name={getWeatherIcon(weather.condition)} 
              className="h-8 w-8" 
            />
          </div>
          
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {weather.high}°/{weather.low}°
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {weather.condition}
            </div>
          </div>
          
          {weather.precipitation && (
            <div className="flex items-center justify-center text-xs text-blue-600 space-x-1">
              <ApperIcon name="Droplets" className="h-3 w-3" />
              <span>{weather.precipitation}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Current Weather
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        
        <div className={`p-4 rounded-xl ${getWeatherColor(weather.condition)}`}>
          <ApperIcon 
            name={getWeatherIcon(weather.condition)} 
            className="h-8 w-8" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {weather.temperature}°F
          </div>
          <p className="text-gray-600 capitalize font-medium">
            {weather.condition}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <ApperIcon name="Droplets" className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-500">Humidity</div>
            <div className="font-semibold text-gray-900">{weather.humidity}%</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <ApperIcon name="Wind" className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-500">Wind</div>
            <div className="font-semibold text-gray-900">{weather.windSpeed} mph</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-purple-600 mb-1">
              <ApperIcon name="Eye" className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-500">Visibility</div>
            <div className="font-semibold text-gray-900">{weather.visibility} mi</div>
          </div>
        </div>
      </div>

      {weather.agriculturalAdvice && (
        <div className="mt-6 p-4 bg-sage-50 rounded-lg border border-sage-200">
          <div className="flex items-start space-x-2">
            <ApperIcon name="Lightbulb" className="h-5 w-5 text-sage-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sage-800 mb-1">
                Agricultural Advice
              </h4>
              <p className="text-sm text-sage-700">
                {weather.agriculturalAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;