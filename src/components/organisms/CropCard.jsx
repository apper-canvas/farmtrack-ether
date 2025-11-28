import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/molecules/ProgressBar";
import { formatDate, getDaysUntilHarvest, getCropGrowthStage } from "@/utils/dateUtils";

const CropCard = ({ crop, field, onEdit, onView, className = "" }) => {
  const growthData = getCropGrowthStage(crop.plantingDate, crop.expectedHarvestDate);
  const daysUntilHarvest = getDaysUntilHarvest(crop.plantingDate, crop.expectedHarvestDate);

  const handleClick = () => {
    if (onView) {
      onView(crop);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(crop);
    }
  };

  const getStatusBadge = () => {
    switch (growthData.stage) {
      case "planted":
        return <Badge variant="planted">Planted</Badge>;
      case "growing":
        return <Badge variant="growing">Growing</Badge>;
      case "ready":
        return <Badge variant="ready">Ready</Badge>;
      default:
        return <Badge variant="harvested">Harvested</Badge>;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 cursor-pointer card-hover transition-all duration-200 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900">
              {crop.name}
            </h3>
            {getStatusBadge()}
          </div>
          
          {crop.variety && (
            <p className="text-sm text-gray-600 mb-2 font-medium">
              {crop.variety}
            </p>
          )}
          
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
            {field?.name || "Unknown Field"}
          </div>
        </div>
        
        <button
          onClick={handleEditClick}
          className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
        >
          <ApperIcon name="Edit2" className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Growth Progress</span>
            <span className="text-sm text-gray-500">{growthData.progress}%</span>
          </div>
          <ProgressBar
            value={growthData.progress}
            variant="growth"
            size="default"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Planted</p>
            <p className="font-medium text-gray-900">
              {formatDate(crop.plantingDate, "MMM d")}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">
              {daysUntilHarvest > 0 ? "Harvest in" : "Harvest"}
            </p>
            <p className="font-medium text-gray-900">
              {daysUntilHarvest > 0 
                ? `${daysUntilHarvest} days`
                : formatDate(crop.expectedHarvestDate, "MMM d")
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCard;