import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "Nothing here yet", 
  description = "Get started by adding your first item.",
  icon = "Package",
  actionText = "Add Item",
  onAction,
  variant = "default" 
}) => {
  if (variant === "compact") {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-gradient-to-br from-sage-100 to-sage-200 rounded-full p-4 w-16 h-16 mx-auto mb-4">
          <ApperIcon name={icon} className="h-8 w-8 text-sage-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>
        {onAction && (
          <Button onClick={onAction} size="sm">
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            {actionText}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="relative">
          <div className="bg-gradient-to-br from-sage-100 to-primary-200 rounded-full p-8 w-32 h-32 mx-auto">
            <ApperIcon name={icon} className="h-16 w-16 text-secondary-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-accent-400 rounded-full p-3">
            <ApperIcon name="Plus" className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {onAction && (
          <div className="pt-4">
            <Button
              onClick={onAction}
              size="lg"
              className="bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 transform hover:scale-105 transition-all duration-200"
            >
              <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
              {actionText}
            </Button>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Your agricultural data will appear here once you start adding information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Empty;