import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { formatRelativeTime, isOverdue, isDueSoon } from "@/utils/dateUtils";

const TaskCard = ({ task, crop, onComplete, onEdit, className = "" }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (task.completed || !onComplete) return;

    setIsCompleting(true);
    try {
      await onComplete(task);
    } catch (error) {
      console.error("Failed to complete task:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  const getPriorityBadge = () => {
    switch (task.priority?.toLowerCase()) {
      case "high":
        return <Badge variant="high">High</Badge>;
      case "medium":
        return <Badge variant="medium">Medium</Badge>;
      case "low":
        return <Badge variant="low">Low</Badge>;
      default:
        return <Badge variant="medium">Medium</Badge>;
    }
  };

  const getDueStatus = () => {
    if (task.completed) return "completed";
    if (isOverdue(task.dueDate)) return "overdue";
    if (isDueSoon(task.dueDate)) return "due-soon";
    return "normal";
  };

  const dueStatus = getDueStatus();

  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 transition-all duration-200 ${
        task.completed ? "opacity-75" : "card-hover cursor-pointer"
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleComplete}
            disabled={task.completed || isCompleting}
            className={`mt-1 p-1 rounded-full transition-all duration-200 ${
              task.completed
                ? "bg-green-100 text-green-600"
                : "border-2 border-gray-300 hover:border-secondary-500 hover:bg-secondary-50"
            }`}
          >
            {isCompleting ? (
              <ApperIcon name="Loader2" className="h-4 w-4 animate-spin text-secondary-600" />
            ) : task.completed ? (
              <ApperIcon name="Check" className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-1 ${
              task.completed ? "text-gray-500 line-through" : "text-gray-900"
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-gray-600 text-sm mb-2">
                {task.description}
              </p>
            )}
            
            {crop && (
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <ApperIcon name="Wheat" className="h-4 w-4 mr-1" />
                {crop.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getPriorityBadge()}
          {!task.completed && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
            >
              <ApperIcon name="Edit2" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
          <span className={`${
            dueStatus === "overdue" ? "text-red-600 font-medium" :
            dueStatus === "due-soon" ? "text-accent-600 font-medium" :
            ""
          }`}>
            {formatRelativeTime(task.dueDate)}
          </span>
        </div>

        {task.completed && task.completedAt && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <ApperIcon name="CheckCircle" className="h-4 w-4 mr-1" />
            Completed
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;