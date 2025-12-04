import React, { useEffect, useState } from "react";
import { laborService } from "@/services/api/laborService";
import { taskService } from "@/services/api/taskService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import LaborCard from "@/components/organisms/LaborCard";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import FormField from "@/components/molecules/FormField";

function Labors() {
  // State management
  const [labors, setLabors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLabor, setEditingLabor] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    hourlyRate: '',
    status: 'available',
    skills: '',
    hireDate: '',
    emergencyContact: {
      name: '',
      phone: ''
    },
    certifications: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [laborData, taskData] = await Promise.all([
        laborService.getAll(),
        taskService.getAll()
      ]);
      setLabors(laborData);
      setTasks(taskData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load labor data');
    } finally {
      setLoading(false);
    }
  }

  // Form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        certifications: formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert)
      };

      if (editingLabor) {
        await laborService.update(editingLabor.Id, submitData);
        toast.success('Worker updated successfully');
      } else {
        await laborService.create(submitData);
        toast.success('Worker added successfully');
      }

      await loadData();
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save worker');
    }
  }

// Edit labor
  function handleEdit(labor) {
    setEditingLabor(labor);
    setFormData({
      name: labor.name,
      role: labor.role,
      email: labor.email,
      phone: labor.phone,
      hourlyRate: labor.hourlyRate.toString(),
      status: labor.status,
      skills: labor.skills ? labor.skills.join(', ') : '',
      hireDate: labor.hireDate || '',
      emergencyContact: labor.emergencyContact || { name: '', phone: '' },
      certifications: labor.certifications ? labor.certifications.join(', ') : ''
    });
    setShowForm(true);
  }

  // Delete labor
  async function handleDelete(labor) {
    if (!confirm(`Are you sure you want to delete ${labor.name}?`)) return;
try {
      await laborService.delete(labor.Id);
      toast.success('Worker deleted successfully');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete worker');
    }
  }

  // Reset form
  function resetForm() {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      hourlyRate: '',
      status: 'available',
      skills: '',
      hireDate: '',
      emergencyContact: { name: '', phone: '' },
      certifications: ''
    });
    setEditingLabor(null);
    setShowForm(false);
  }

  // Filter and search labors
  function getFilteredLabors() {
    let filtered = labors;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(labor => labor.status === filter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(labor => 
        labor.name.toLowerCase().includes(query) ||
        labor.role.toLowerCase().includes(query) ||
        labor.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Get statistics
  function getLaborStats() {
    const available = labors.filter(l => l.status === 'available').length;
    const working = labors.filter(l => l.status === 'working').length;
    const totalHours = labors.reduce((sum, l) => sum + (l.totalHoursWorked || 0), 0);
    const avgHourlyRate = labors.length > 0 ? 
      labors.reduce((sum, l) => sum + l.hourlyRate, 0) / labors.length : 0;

    return { available, working, totalHours, avgHourlyRate };
  }

  const filteredLabors = getFilteredLabors();
  const stats = getLaborStats();

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-50 p-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Labor Management</h1>
            <p className="text-gray-600 mt-1">Manage your farm workforce and labor activities</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors hidden md:flex"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="UserCheck" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-xl font-bold text-gray-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Users" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Working</p>
                <p className="text-xl font-bold text-gray-900">{stats.working}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Clock" className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalHours.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="DollarSign" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Rate</p>
                <p className="text-xl font-bold text-gray-900">${stats.avgHourlyRate.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers by name, role, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="md:w-48"
          >
            <option value="all">All Workers</option>
            <option value="available">Available</option>
            <option value="working">Working</option>
            <option value="on_leave">On Leave</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </div>
      </div>

      {/* Worker List */}
      {filteredLabors.length === 0 ? (
        <Empty
          icon="Users"
          title="No workers found"
          description={
            searchQuery || filter !== 'all' 
              ? "No workers match your current filters. Try adjusting your search or filter criteria."
              : "Start building your farm workforce by adding your first worker."
          }
          action={
            searchQuery || filter !== 'all' ? (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLabors.map((labor) => (
            <LaborCard
              key={labor.Id}
              labor={labor}
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <FloatingActionButton
        onClick={() => setShowForm(true)}
        icon="Plus"
        className="md:hidden"
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingLabor ? 'Edit Worker' : 'Add New Worker'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter worker's full name"
                  required
                />

                <FormField
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                  placeholder="e.g. Farm Manager, Field Worker"
                  required
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="worker@farmtrack.com"
                  required
                />

                <FormField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  placeholder="+1 (555) 123-4567"
                  required
                />

                <FormField
                  label="Hourly Rate ($)"
                  name="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({...prev, hourlyRate: e.target.value}))}
                  placeholder="25.00"
                  required
                />

                <FormField
                  label="Status"
                  name="status"
                  type="select"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'working', label: 'Working' },
                    { value: 'on_leave', label: 'On Leave' },
                    { value: 'unavailable', label: 'Unavailable' }
                  ]}
                  required
                />
              </div>

              <FormField
                label="Skills (comma-separated)"
                name="skills"
                type="textarea"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({...prev, skills: e.target.value}))}
                placeholder="Equipment Operation, Crop Management, Team Leadership"
                rows={2}
              />

              <FormField
                label="Certifications (comma-separated)"
                name="certifications"
                type="textarea"
                value={formData.certifications}
                onChange={(e) => setFormData(prev => ({...prev, certifications: e.target.value}))}
                placeholder="Pesticide Applicator, Heavy Equipment, First Aid"
                rows={2}
              />

              <FormField
                label="Hire Date"
                name="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData(prev => ({...prev, hireDate: e.target.value}))}
              />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Contact Name"
                    name="emergencyContactName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      emergencyContact: {
                        ...prev.emergencyContact,
                        name: e.target.value
                      }
                    }))}
                    placeholder="Emergency contact name"
                  />

                  <FormField
                    label="Contact Phone"
                    name="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      emergencyContact: {
                        ...prev.emergencyContact,
                        phone: e.target.value
                      }
                    }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {editingLabor ? 'Update Worker' : 'Add Worker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Labors;