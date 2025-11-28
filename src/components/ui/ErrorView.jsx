import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const ErrorView = ({ 
  error = "Something went wrong", 
  onRetry, 
  showRetry = true,
  variant = "default" 
}) => {
  if (variant === "inline") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium mb-3">{error}</p>
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-primary-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full p-6 w-24 h-24 mx-auto mb-4">
              <ApperIcon name="AlertTriangle" className="h-12 w-12 text-red-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
              <ApperIcon name="X" className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {error}
            </p>
          </div>

          {showRetry && onRetry && (
            <div className="space-y-3 pt-4">
              <Button
                onClick={onRetry}
                className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800"
                size="lg"
              >
                <ApperIcon name="RefreshCw" className="h-5 w-5 mr-2" />
                Try Again
              </Button>
              
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
              >
                Or refresh the page
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              If this problem persists, please check your connection and try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;