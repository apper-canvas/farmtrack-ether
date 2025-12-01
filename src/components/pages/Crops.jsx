import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import Textarea from '@/components/atoms/Textarea';
import CropCard from '@/components/organisms/CropCard';
import FloatingActionButton from '@/components/molecules/FloatingActionButton';
import FormField from '@/components/molecules/FormField';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import { cropService } from '@/services/api/cropService';
import { fieldService } from '@/services/api/fieldService';
import { toast } from 'react-toastify';

function Crops() {
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    fieldId: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'planted',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [cropsData, fieldsData] = await Promise.all([
        cropService.getAll(),
        fieldService.getAll()
      ]);
      setCrops(cropsData);
      setFields(fieldsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Crop name is required');
      return;
    }
    
    if (!formData.fieldId) {
      toast.error('Please select a field');
      return;
    }

    try {
      let result;
      if (editingCrop) {
        result = await cropService.update(editingCrop.Id, formData);
        setCrops(prev => prev.map(crop => crop.Id === editingCrop.Id ? result : crop));
        toast.success('Crop updated successfully');
      } else {
        result = await cropService.create(formData);
        setCrops(prev => [...prev, result]);
        toast.success('Crop created successfully');
      }
      
      resetForm();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleEdit(crop) {
    setEditingCrop(crop);
    setFormData({
      name: crop.name || '',
      variety: crop.variety || '',
      fieldId: crop.fieldId || '',
      plantingDate: crop.plantingDate || '',
      expectedHarvestDate: crop.expectedHarvestDate || '',
      status: crop.status || 'planted',
      notes: crop.notes || ''
    });
    setShowForm(true);
  }

  async function handleDelete(cropId) {
    if (!confirm('Are you sure you want to delete this crop?')) {
      return;
    }

    try {
      await cropService.delete(cropId);
      setCrops(prev => prev.filter(crop => crop.Id !== cropId));
      toast.success('Crop deleted successfully');
    } catch (err) {
      toast.error(err.message);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      variety: '',
      fieldId: '',
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'planted',
      notes: ''
    });
    setEditingCrop(null);
    setShowForm(false);
  }

  function getFieldById(fieldId) {
    return fields.find(field => field.Id === fieldId);
  }

  // Filter crops based on search and status
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.variety?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || crop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loading message="Loading crops..." />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crops Management</h1>
          <p className="text-gray-600">Manage and monitor your crop cultivation</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-secondary-600 hover:bg-secondary-700 text-white"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Crop
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search crops by name or variety..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="ready">Ready to Harvest</option>
              <option value="harvested">Harvested</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <Empty
          title="No crops found"
          description={searchTerm || statusFilter !== 'all' 
            ? "No crops match your current filters. Try adjusting your search."
            : "Start by adding your first crop to track its growth and harvest progress."
          }
          icon="Wheat"
          action={
            <Button
              onClick={() => setShowForm(true)}
              className="bg-secondary-600 hover:bg-secondary-700 text-white"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Your First Crop
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map(crop => {
            const field = getFieldById(crop.fieldId);
            return (
              <CropCard
                key={crop.Id}
                crop={crop}
                field={field}
                onEdit={() => handleEdit(crop)}
                onDelete={() => handleDelete(crop.Id)}
              />
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                </h3>
                <Button
                  onClick={resetForm}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Crop Name" required>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tomatoes, Corn, Wheat"
                    required
                  />
                </FormField>

                <FormField label="Variety">
                  <Input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                    placeholder="e.g., Cherry Tomatoes, Sweet Corn"
                  />
                </FormField>

                <FormField label="Field" required>
                  <Select
                    value={formData.fieldId}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldId: e.target.value }))}
                    required
                  >
                    <option value="">Select a field</option>
                    {fields.map(field => (
                      <option key={field.Id} value={field.Id}>
                        {field.name} ({field.size} acres)
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Planting Date">
                    <Input
                      type="date"
                      value={formData.plantingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                    />
                  </FormField>

                  <FormField label="Expected Harvest">
                    <Input
                      type="date"
                      value={formData.expectedHarvestDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedHarvestDate: e.target.value }))}
                    />
                  </FormField>
                </div>

                <FormField label="Status">
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="planted">Planted</option>
                    <option value="growing">Growing</option>
                    <option value="ready">Ready to Harvest</option>
                    <option value="harvested">Harvested</option>
                  </Select>
                </FormField>

                <FormField label="Notes">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this crop..."
                    rows={3}
                  />
                </FormField>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white"
                  >
                    {editingCrop ? 'Update Crop' : 'Add Crop'}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <FloatingActionButton
        onClick={() => setShowForm(true)}
        icon="Plus"
        label="Add Crop"
        className="md:hidden"
      />
    </div>
  );
}

export default Crops;