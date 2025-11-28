import cropData from "@/services/mockData/crops.json";

let crops = [...cropData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cropService = {
  async getAll() {
    await delay(300);
    return [...crops];
  },

  async getByFieldId(fieldId) {
    await delay(250);
    return crops.filter(c => c.fieldId === parseInt(fieldId));
  },

  async getById(id) {
    await delay(200);
    const crop = crops.find(c => c.Id === parseInt(id));
    if (!crop) {
      throw new Error("Crop not found");
    }
    return { ...crop };
  },

  async create(cropData) {
    await delay(400);
    const newCrop = {
      ...cropData,
      Id: Math.max(...crops.map(c => c.Id), 0) + 1,
      fieldId: parseInt(cropData.fieldId),
      plantingDate: new Date(cropData.plantingDate).toISOString(),
      expectedHarvestDate: new Date(cropData.expectedHarvestDate).toISOString(),
      createdAt: new Date().toISOString(),
    };
    crops.push(newCrop);
    return { ...newCrop };
  },

  async update(id, cropData) {
    await delay(350);
    const index = crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    crops[index] = {
      ...crops[index],
      ...cropData,
      Id: parseInt(id),
      fieldId: parseInt(cropData.fieldId),
      plantingDate: new Date(cropData.plantingDate).toISOString(),
      expectedHarvestDate: new Date(cropData.expectedHarvestDate).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { ...crops[index] };
  },

  async delete(id) {
    await delay(300);
    const index = crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    crops.splice(index, 1);
    return true;
  },
};