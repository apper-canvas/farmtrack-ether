import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FarmCard from "@/components/organisms/FarmCard";
import CropCard from "@/components/organisms/CropCard";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { farmService } from "@/services/api/farmService";
import { fieldService } from "@/services/api/fieldService";
import { cropService } from "@/services/api/cropService";
import { toast } from "react-toastify";

const Farms = () => {
  const [data, setData] = useState({
    farms: [],
    fields: [],
    crops: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [editingFarm, setEditingFarm] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);

  // Form states
  const [farmForm, setFarmForm] = useState({
    name: "",
    location: "",
    totalArea: "",
    soilType: "",
  });
  
  const [cropForm, setCropForm] = useState({
    name: "",
    variety: "",
    fieldId: "",
    plantingDate: "",
    expectedHarvestDate: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [farms, fields, crops] = await Promise.all([
        farmService.getAll(),
        fieldService.getAll(),
        cropService.getAll(),
      ]);

      setData({ farms, fields, crops });
    } catch (err) {
      console.error("Failed to load farms data:", err);
      setError("Failed to load farms data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFarm) {
        const updatedFarm = await farmService.update(editingFarm.Id, {
          ...farmForm,
          totalArea: parseFloat(farmForm.totalArea),
        });
        
        setData(prev => ({
          ...prev,
          farms: prev.farms.map(f => f.Id === editingFarm.Id ? updatedFarm : f)
        }));
        
        toast.success("Farm updated successfully!");
      } else {
        const newFarm = await farmService.create({
          ...farmForm,
          totalArea: parseFloat(farmForm.totalArea),
        });
        
        setData(prev => ({
          ...prev,
          farms: [...prev.farms, newFarm]
        }));
        
        toast.success("Farm created successfully!");
      }
      
      resetFarmForm();
      setShowFarmModal(false);
    } catch (err) {
      console.error("Failed to save farm:", err);
      toast.error("Failed to save farm. Please try again.");
    }
  };

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const cropData = {
        ...cropForm,
        status: "planted",
      };
      
      if (editingCrop) {
        const updatedCrop = await cropService.update(editingCrop.Id, cropData);
        
        setData(prev => ({
          ...prev,
          crops: prev.crops.map(c => c.Id === editingCrop.Id ? updatedCrop : c)
        }));
        
        toast.success("Crop updated successfully!");
      } else {
        const newCrop = await cropService.create(cropData);
        
        setData(prev => ({
          ...prev,
          crops: [...prev.crops, newCrop]
        }));
        
        toast.success("Crop added successfully!");
      }
      
      resetCropForm();
      setShowCropModal(false);
    } catch (err) {
      console.error("Failed to save crop:", err);
      toast.error("Failed to save crop. Please try again.");
    }
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setFarmForm({
      name: farm.name,
      location: farm.location,
      totalArea: farm.totalArea.toString(),
      soilType: farm.soilType,
    });
    setShowFarmModal(true);
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      name: crop.name,
      variety: crop.variety || "",
      fieldId: crop.fieldId.toString(),
      plantingDate: crop.plantingDate.split("T")[0],
      expectedHarvestDate: crop.expectedHarvestDate.split("T")[0],
      notes: crop.notes || "",
    });
    setShowCropModal(true);
  };

  const resetFarmForm = () => {
    setFarmForm({
      name: "",
      location: "",
      totalArea: "",
      soilType: "",
    });
    setEditingFarm(null);
  };

  const resetCropForm = () => {
    setCropForm({
      name: "",
      variety: "",
      fieldId: "",
      plantingDate: "",
      expectedHarvestDate: "",
      notes: "",
    });
    setEditingCrop(null);
  };

  const getFieldsForFarm = (farmId) => {
    return data.fields.filter(field => field.farmId === farmId);
  };

  const getCropsForFarm = (farmId) => {
    const farmFields = getFieldsForFarm(farmId);
    return data.crops.filter(crop => 
      farmFields.some(field => field.Id === crop.fieldId)
    );
  };

  const soilTypeOptions = [
    { value: "Clay", label: "Clay" },
    { value: "Clay Loam", label: "Clay Loam" },
    { value: "Sandy Loam", label: "Sandy Loam" },
    { value: "Silt Loam", label: "Silt Loam" },
    { value: "Loam", label: "Loam" },
    { value: "Sandy", label: "Sandy" },
    { value: "Silt", label: "Silt" },
  ];

  const cropOptions = [
    { value: "Wheat", label: "Wheat" },
    { value: "Corn", label: "Corn" },
    { value: "Soybeans", label: "Soybeans" },
    { value: "Cotton", label: "Cotton" },
    { value: "Alfalfa", label: "Alfalfa" },
    { value: "Tomatoes", label: "Tomatoes" },
    { value: "Bell Peppers", label: "Bell Peppers" },
    { value: "Almonds", label: "Almonds" },
    { value: "Rice", label: "Rice" },
    { value: "Barley", label: "Barley" },
  ];

  if (loading) {
    return <Loading message="Loading your farms..." variant="list" />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                My Farms
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your farm properties and crops
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  resetCropForm();
                  setShowCropModal(true);
                }}
                variant="outline"
                size="sm"
                disabled={data.fields.length === 0}
              >
                <ApperIcon name="Wheat" className="h-4 w-4 mr-2" />
                Add Crop
              </Button>
              
              <Button
                onClick={() => {
                  resetFarmForm();
                  setShowFarmModal(true);
                }}
                variant="primary"
                size="sm"
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Farm
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {data.farms.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Empty
              title="No farms yet"
              description="Start by adding your first farm to begin tracking your agricultural operations."
              icon="MapPin"
              actionText="Add Your First Farm"
              onAction={() => {
                resetFarmForm();
                setShowFarmModal(true);
              }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {data.farms.map(farm => {
              const farmFields = getFieldsForFarm(farm.Id);
              const farmCrops = getCropsForFarm(farm.Id);
              
              return (
                <div key={farm.Id} className="space-y-6">
                  <FarmCard
                    farm={{
                      ...farm,
                      fieldCount: farmFields.length,
                      activeCrops: farmCrops.filter(crop => crop.status !== "harvested").length,
                    }}
                    onEdit={handleEditFarm}
                    onView={setSelectedFarm}
                  />
                  
                  {farmCrops.length > 0 && (
                    <div className="ml-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Crops ({farmCrops.length})
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {farmCrops.map(crop => (
                          <CropCard
                            key={crop.Id}
                            crop={crop}
                            field={data.fields.find(f => f.Id === crop.fieldId)}
                            onEdit={handleEditCrop}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Farm Modal */}
      {showFarmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowFarmModal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingFarm ? "Edit Farm" : "Add New Farm"}
                </h3>
                <button
                  onClick={() => setShowFarmModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFarmSubmit} className="space-y-4">
                <FormField
                  label="Farm Name"
                  name="name"
                  value={farmForm.name}
                  onChange={(e) => setFarmForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter farm name"
                  required
                />

                <FormField
                  label="Location"
                  name="location"
                  value={farmForm.location}
                  onChange={(e) => setFarmForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter farm location"
                  required
                />

                <FormField
                  label="Total Area (acres)"
                  name="totalArea"
                  type="number"
                  value={farmForm.totalArea}
                  onChange={(e) => setFarmForm(prev => ({ ...prev, totalArea: e.target.value }))}
                  placeholder="Enter total area"
                  required
                  step="0.1"
                  min="0.1"
                />

                <FormField
                  label="Soil Type"
                  name="soilType"
                  type="select"
                  value={farmForm.soilType}
                  onChange={(e) => setFarmForm(prev => ({ ...prev, soilType: e.target.value }))}
                  options={soilTypeOptions}
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowFarmModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingFarm ? "Update Farm" : "Create Farm"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCropModal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCrop ? "Edit Crop" : "Add New Crop"}
                </h3>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCropSubmit} className="space-y-4">
                <FormField
                  label="Crop Type"
                  name="name"
                  type="select"
                  value={cropForm.name}
                  onChange={(e) => setCropForm(prev => ({ ...prev, name: e.target.value }))}
                  options={cropOptions}
                  required
                />

                <FormField
                  label="Variety"
                  name="variety"
                  value={cropForm.variety}
                  onChange={(e) => setCropForm(prev => ({ ...prev, variety: e.target.value }))}
                  placeholder="Enter crop variety"
                />

                <FormField
                  label="Field"
                  name="fieldId"
                  type="select"
                  value={cropForm.fieldId}
                  onChange={(e) => setCropForm(prev => ({ ...prev, fieldId: e.target.value }))}
                  options={data.fields.map(field => ({
                    value: field.Id.toString(),
                    label: `${field.name} (${data.farms.find(f => f.Id === field.farmId)?.name})`
                  }))}
                  required
                />

                <FormField
                  label="Planting Date"
                  name="plantingDate"
                  type="date"
                  value={cropForm.plantingDate}
                  onChange={(e) => setCropForm(prev => ({ ...prev, plantingDate: e.target.value }))}
                  required
                />

                <FormField
                  label="Expected Harvest Date"
                  name="expectedHarvestDate"
                  type="date"
                  value={cropForm.expectedHarvestDate}
                  onChange={(e) => setCropForm(prev => ({ ...prev, expectedHarvestDate: e.target.value }))}
                  required
                />

                <FormField
                  label="Notes"
                  name="notes"
                  type="textarea"
                  value={cropForm.notes}
                  onChange={(e) => setCropForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes"
                  rows={3}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCropModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingCrop ? "Update Crop" : "Add Crop"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          resetFarmForm();
          setShowFarmModal(true);
        }}
        icon="Plus"
      />
    </div>
  );
};

export default Farms;