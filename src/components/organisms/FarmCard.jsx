import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { formatNumber } from "@/utils/currencyUtils";

const FarmCard = ({ farm, onEdit, onView, className = "" }) => {
  const handleClick = () => {
    if (onView) {
      onView(farm);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(farm);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 cursor-pointer card-hover transition-all duration-200 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {farm.name}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
            {farm.location}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <ApperIcon name="Square" className="h-4 w-4 mr-1" />
            {formatNumber(farm.totalArea, 1)} acres
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="primary">
            {farm.soilType}
          </Badge>
          <button
            onClick={handleEditClick}
            className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit2" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sage-50 rounded-lg p-3">
          <div className="flex items-center text-sage-700 text-sm mb-1">
            <ApperIcon name="Grid3X3" className="h-4 w-4 mr-1" />
            Fields
          </div>
          <p className="text-lg font-bold text-sage-900">
            {farm.fieldCount || 0}
          </p>
        </div>
        
        <div className="bg-primary-50 rounded-lg p-3">
          <div className="flex items-center text-primary-700 text-sm mb-1">
            <ApperIcon name="Wheat" className="h-4 w-4 mr-1" />
            Active Crops
          </div>
          <p className="text-lg font-bold text-primary-900">
            {farm.activeCrops || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;