import React from "react";

const Loading = ({ message = "Loading...", variant = "default" }) => {
  if (variant === "card") {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-sage-200 rounded-lg w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-sage-100 rounded w-full"></div>
            <div className="h-4 bg-sage-100 rounded w-5/6"></div>
            <div className="h-4 bg-sage-100 rounded w-4/6"></div>
          </div>
          <div className="flex justify-between pt-4">
            <div className="h-8 bg-sage-200 rounded w-20"></div>
            <div className="h-8 bg-sage-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-card p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-sage-200 rounded w-1/2"></div>
                <div className="h-4 bg-accent-200 rounded-full w-16"></div>
              </div>
              <div className="h-4 bg-sage-100 rounded w-3/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-sage-100 rounded w-1/3"></div>
                <div className="h-6 bg-sage-200 rounded-full w-6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-primary-100">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <svg 
            className="animate-spin h-16 w-16 text-secondary-600 mx-auto" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <div className="absolute inset-0 animate-ping h-16 w-16 rounded-full bg-secondary-200 opacity-20 mx-auto"></div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-secondary-800 tracking-tight">
            FarmTrack
          </h3>
          <p className="text-secondary-600 font-medium">
            {message}
          </p>
        </div>
        
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;