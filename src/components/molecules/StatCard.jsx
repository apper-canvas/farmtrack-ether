import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = "text-secondary-600",
  iconBackground = "bg-secondary-100",
  trend,
  trendIcon,
  className,
  onClick,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-card p-6 border border-gray-100 transition-all duration-200",
        isClickable && "cursor-pointer card-hover",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 font-medium">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center space-x-1">
              {trendIcon && (
                <ApperIcon name={trendIcon} className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm font-medium text-green-600">
                {trend}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            "rounded-xl p-3 transition-colors duration-200",
            iconBackground,
            isClickable && "group-hover:scale-110"
          )}>
            <ApperIcon name={icon} className={cn("h-6 w-6", iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;