import farmData from "@/services/mockData/farms.json";

let farms = [...farmData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const farmService = {
  async getAll() {
    await delay(300);
    return [...farms];
  },

  async getById(id) {
    await delay(200);
    const farm = farms.find(f => f.Id === parseInt(id));
    if (!farm) {
      throw new Error("Farm not found");
    }
    return { ...farm };
  },

  async create(farmData) {
    await delay(400);
    const newFarm = {
      ...farmData,
      Id: Math.max(...farms.map(f => f.Id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    farms.push(newFarm);
    return { ...newFarm };
  },

  async update(id, farmData) {
    await delay(350);
    const index = farms.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    farms[index] = {
      ...farms[index],
      ...farmData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString(),
    };
    
    return { ...farms[index] };
  },

  async delete(id) {
    await delay(300);
    const index = farms.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    farms.splice(index, 1);
    return true;
  },
};