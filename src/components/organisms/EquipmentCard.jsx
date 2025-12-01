import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/utils/cn';

export default function EquipmentCard({ equipment, onEdit, onDelete, className }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'retired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'tractor':
        return 'Truck';
      case 'combine harvester':
        return 'Combine';
      case 'baler':
        return 'Package';
      case 'utility tractor':
        return 'Settings';
      case 'rotary cutter':
        return 'Scissors';
      default:
        return 'Wrench';
    }
  };

  const isMaintenanceDue = () => {
    if (!equipment.nextMaintenance) return false;
    const nextDate = new Date(equipment.nextMaintenance);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return nextDate <= thirtyDaysFromNow;
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 p-6 shadow-card card-hover animate-scale-in",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <ApperIcon 
              name={getTypeIcon(equipment.type)} 
              className="w-6 h-6 text-primary-600" 
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {equipment.name}
            </h3>
            <p className="text-sm text-gray-500">
              {equipment.brand} {equipment.model}
            </p>
          </div>
        </div>
        <Badge className={cn("text-xs font-medium border", getStatusColor(equipment.status))}>
          {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium text-gray-900">{equipment.type}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Purchase Date:</span>
          <span className="font-medium text-gray-900">
            {formatDate(equipment.purchaseDate)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Value:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(equipment.cost)}
          </span>
        </div>

        {equipment.nextMaintenance && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Next Maintenance:</span>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "font-medium",
                isMaintenanceDue() ? "text-red-600" : "text-gray-900"
              )}>
                {formatDate(equipment.nextMaintenance)}
              </span>
              {isMaintenanceDue() && (
                <ApperIcon name="AlertTriangle" className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        )}
      </div>

      {equipment.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 line-clamp-2">
            {equipment.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(equipment)}
          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        >
          <ApperIcon name="Edit2" className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(equipment)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}