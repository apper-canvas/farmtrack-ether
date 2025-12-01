import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { formatCurrency } from '@/utils/currencyUtils';

function LaborCard({ labor, tasks = [], onEdit, onDelete, onViewDetails }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(labor);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(labor);
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    if (onViewDetails) {
      onViewDetails(labor);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Available' },
      working: { color: 'bg-blue-100 text-blue-800', text: 'Working' },
      on_leave: { color: 'bg-gray-100 text-gray-800', text: 'On Leave' },
      unavailable: { color: 'bg-red-100 text-red-800', text: 'Unavailable' }
    };
    
    const config = statusConfig[labor.status] || statusConfig.available;
    return (
      <Badge className={`${config.color} px-2 py-1 text-xs font-medium`}>
        {config.text}
      </Badge>
    );
  };

  const getCurrentTasks = () => {
    if (!labor.currentTasks || labor.currentTasks.length === 0) return [];
    return tasks.filter(task => labor.currentTasks.includes(task.Id));
  };

  const currentTasks = getCurrentTasks();

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden card-hover">
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="User" className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{labor.name}</h3>
              <p className="text-sm text-gray-600">{labor.role}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">
                  {formatCurrency(labor.hourlyRate)}/hr
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit worker"
            >
              <ApperIcon name="Edit" className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete worker"
            >
              <ApperIcon name="Trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contact</p>
            <p className="text-sm text-gray-900 mt-1">{labor.phone}</p>
            <p className="text-sm text-gray-600">{labor.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Hours Worked</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {labor.totalHoursWorked?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">Total hours</p>
          </div>
        </div>

        {/* Skills */}
        {labor.skills && labor.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {labor.skills.slice(0, 3).map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1"
                >
                  {skill}
                </Badge>
              ))}
              {labor.skills.length > 3 && (
                <Badge className="bg-gray-100 text-gray-500 text-xs px-2 py-1">
                  +{labor.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Current Tasks */}
        {currentTasks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
              Current Tasks ({currentTasks.length})
            </p>
            <div className="space-y-2">
              {currentTasks.slice(0, 2).map((task, index) => (
                <div key={task.Id} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-700 truncate">{task.title}</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5">
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {currentTasks.length > 2 && (
                <p className="text-xs text-gray-500">+{currentTasks.length - 2} more tasks</p>
              )}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <div className="flex items-center justify-center space-x-1">
            <span>View Details</span>
            <ApperIcon 
              name={showDetails ? "ChevronUp" : "ChevronDown"} 
              className="w-4 h-4" 
            />
          </div>
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-6 pb-6 border-t border-gray-50">
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Hire Date</p>
              <p className="text-gray-600">
                {labor.hireDate ? new Date(labor.hireDate).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Emergency Contact</p>
              <p className="text-gray-600">
                {labor.emergencyContact ? 
                  `${labor.emergencyContact.name} - ${labor.emergencyContact.phone}` : 
                  'Not provided'
                }
              </p>
            </div>
            {labor.certifications && labor.certifications.length > 0 && (
              <div className="md:col-span-2">
                <p className="font-medium text-gray-700 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {labor.certifications.map((cert, index) => (
                    <Badge
                      key={index}
                      className="bg-green-100 text-green-700 text-xs px-2 py-1"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LaborCard;