import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = ({
  value = 0,
  max = 100,
  variant = "default",
  size = "default",
  showValue = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-2",
    default: "h-3",
    lg: "h-4",
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-secondary-500 to-secondary-600",
    growth: "bg-gradient-to-r from-primary-500 to-secondary-600",
    success: "bg-gradient-to-r from-green-500 to-green-600",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
    danger: "bg-gradient-to-r from-red-500 to-red-600",
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showValue && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;