import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import Label from '@/components/atoms/Label';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import EquipmentCard from '@/components/organisms/EquipmentCard';
import FloatingActionButton from '@/components/molecules/FloatingActionButton';
import { equipmentService } from '@/services/api/equipmentService';

export default function Equipements() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    purchaseDate: '',
    status: 'operational',
    lastMaintenance: '',
    nextMaintenance: '',
    cost: '',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const equipmentTypes = [
    'Tractor',
    'Combine Harvester',
    'Baler',
    'Utility Tractor',
    'Rotary Cutter',
    'Planter',
    'Cultivator',
    'Disc Harrow',
    'Sprayer',
    'Mower'
  ];

  const statusOptions = [
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchQuery, statusFilter, typeFilter]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getAll();
      setEquipment(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredEquipment(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      brand: '',
      model: '',
      purchaseDate: '',
      status: 'operational',
      lastMaintenance: '',
      nextMaintenance: '',
      cost: '',
      notes: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (equipmentItem) => {
    setEditingEquipment(equipmentItem);
    setFormData({
      name: equipmentItem.name || '',
      type: equipmentItem.type || '',
      brand: equipmentItem.brand || '',
      model: equipmentItem.model || '',
      purchaseDate: equipmentItem.purchaseDate || '',
      status: equipmentItem.status || 'operational',
      lastMaintenance: equipmentItem.lastMaintenance || '',
      nextMaintenance: equipmentItem.nextMaintenance || '',
      cost: equipmentItem.cost?.toString() || '',
      notes: equipmentItem.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (equipmentItem) => {
    if (confirm(`Are you sure you want to delete ${equipmentItem.name}?`)) {
      try {
        await equipmentService.delete(equipmentItem.Id);
        await loadEquipment();
      } catch (err) {
        toast.error('Failed to delete equipment');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      
      const submitData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        nextMaintenance: formData.nextMaintenance || null
      };

      if (editingEquipment) {
        await equipmentService.update(editingEquipment.Id, submitData);
        setShowEditModal(false);
        setEditingEquipment(null);
      } else {
        await equipmentService.create(submitData);
        setShowCreateModal(false);
      }
      
      resetForm();
      await loadEquipment();
    } catch (err) {
      toast.error(editingEquipment ? 'Failed to update equipment' : 'Failed to create equipment');
    } finally {
      setFormLoading(false);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingEquipment(null);
    resetForm();
  };

  if (loading) {
    return <Loading message="Loading equipment..." />;
  }

  if (error) {
    return (
      <ErrorView 
        error={error}
        onRetry={loadEquipment}
        showRetry={true}
        title="Failed to load equipment"
        description="There was an error loading the equipment list"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-600 mt-1">Manage your farm equipment and machinery</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700">
          <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
          <Select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {equipmentTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <Empty
          icon="Wrench"
          title="No equipment found"
          description={equipment.length === 0 
            ? "Get started by adding your first piece of equipment"
            : "No equipment matches your current filters"
          }
          action={equipment.length === 0 ? (
            <Button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700">
              <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
              Add Equipment
            </Button>
          ) : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipmentItem) => (
            <EquipmentCard
              key={equipmentItem.Id}
              equipment={equipmentItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button for mobile */}
      <FloatingActionButton onClick={handleCreate} />

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <div>
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., John Deere 5075M"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="">Select type</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g., John Deere"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., 5075M"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this equipment..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModals}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {formLoading ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      {editingEquipment ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingEquipment ? 'Update Equipment' : 'Create Equipment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}