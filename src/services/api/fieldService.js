import fieldData from "@/services/mockData/fields.json";

let fields = [...fieldData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fieldService = {
  async getAll() {
    await delay(300);
    return [...fields];
  },

  async getByFarmId(farmId) {
    await delay(250);
    return fields.filter(f => f.farmId === parseInt(farmId));
  },

  async getById(id) {
    await delay(200);
    const field = fields.find(f => f.Id === parseInt(id));
    if (!field) {
      throw new Error("Field not found");
    }
    return { ...field };
  },

  async create(fieldData) {
    await delay(400);
    const newField = {
      ...fieldData,
      Id: Math.max(...fields.map(f => f.Id), 0) + 1,
      farmId: parseInt(fieldData.farmId),
      createdAt: new Date().toISOString(),
    };
    fields.push(newField);
    return { ...newField };
  },

  async update(id, fieldData) {
    await delay(350);
    const index = fields.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Field not found");
    }
    
    fields[index] = {
      ...fields[index],
      ...fieldData,
      Id: parseInt(id),
      farmId: parseInt(fieldData.farmId),
      updatedAt: new Date().toISOString(),
    };
    
    return { ...fields[index] };
  },

  async delete(id) {
    await delay(300);
    const index = fields.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Field not found");
    }
    
    fields.splice(index, 1);
    return true;
  },
};