import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const FloatingActionButton = ({ 
  onClick,
  icon = "Plus",
  className,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:from-secondary-700 hover:to-secondary-800 transition-all duration-200 transform hover:scale-110 active:scale-95",
        className
      )}
      {...props}
    >
      <ApperIcon name={icon} className="h-6 w-6" />
    </button>
  );
};

export default FloatingActionButton;