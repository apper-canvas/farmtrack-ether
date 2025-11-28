import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-accent-100 to-accent-200 rounded-full p-8 w-32 h-32 mx-auto mb-4">
              <ApperIcon name="MapPin" className="h-16 w-16 text-accent-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-accent-500 rounded-full p-3">
              <ApperIcon name="Search" className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-6xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl font-bold text-gray-900">
              Field Not Found
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Looks like you've wandered off the beaten path. The page you're looking for doesn't exist in our farm system.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800"
              size="lg"
            >
              <ApperIcon name="Home" className="h-5 w-5 mr-2" />
              Return to Dashboard
            </Button>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate("/farms")}
                variant="outline"
                className="flex-1"
              >
                <ApperIcon name="MapPin" className="h-4 w-4 mr-2" />
                View Farms
              </Button>
              
              <Button
                onClick={() => navigate("/tasks")}
                variant="outline"
                className="flex-1"
              >
                <ApperIcon name="CheckSquare" className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <button
                onClick={() => navigate("/weather")}
                className="flex items-center space-x-1 hover:text-secondary-600 transition-colors"
              >
                <ApperIcon name="Cloud" className="h-4 w-4" />
                <span>Weather</span>
              </button>
              
              <button
                onClick={() => navigate("/expenses")}
                className="flex items-center space-x-1 hover:text-secondary-600 transition-colors"
              >
                <ApperIcon name="DollarSign" className="h-4 w-4" />
                <span>Expenses</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;