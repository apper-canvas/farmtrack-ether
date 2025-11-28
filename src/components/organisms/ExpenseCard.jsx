import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currencyUtils";

const ExpenseCard = ({ expense, onEdit, onDelete, className = "" }) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(expense);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(expense);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "seeds":
        return "Sprout";
      case "fertilizer":
        return "Droplets";
      case "equipment":
        return "Wrench";
      case "labor":
        return "Users";
      case "fuel":
        return "Fuel";
      case "maintenance":
        return "Settings";
      default:
        return "DollarSign";
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "seeds":
        return "text-green-600 bg-green-100";
      case "fertilizer":
        return "text-blue-600 bg-blue-100";
      case "equipment":
        return "text-purple-600 bg-purple-100";
      case "labor":
        return "text-orange-600 bg-orange-100";
      case "fuel":
        return "text-red-600 bg-red-100";
      case "maintenance":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-secondary-600 bg-secondary-100";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 card-hover transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-3 rounded-xl ${getCategoryColor(expense.category)}`}>
            <ApperIcon 
              name={getCategoryIcon(expense.category)} 
              className="h-5 w-5" 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-gray-900">
                {formatCurrency(expense.amount)}
              </h3>
              <Badge variant="secondary">
                {expense.category}
              </Badge>
            </div>
            
            {expense.description && (
              <p className="text-gray-600 text-sm mb-2">
                {expense.description}
              </p>
            )}
            
            <div className="flex items-center text-gray-500 text-sm">
              <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
              {formatDate(expense.date)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit2" className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;