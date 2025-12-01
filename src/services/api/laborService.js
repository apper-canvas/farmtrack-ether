import laborData from '@/services/mockData/labors.json';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let labors = [...laborData];
let nextId = Math.max(...labors.map(l => l.Id)) + 1;

export const laborService = {
  async getAll() {
    await delay(300);
    return labors.map(labor => ({ ...labor }));
  },

  async getById(id) {
    await delay(200);
    const labor = labors.find(l => l.Id === parseInt(id));
    return labor ? { ...labor } : null;
  },

  async create(laborData) {
    await delay(400);
    const newLabor = {
      ...laborData,
      Id: nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    labors.push(newLabor);
    return { ...newLabor };
  },

  async update(id, laborData) {
    await delay(400);
    const index = labors.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Labor record not found');
    }
    
    const updatedLabor = {
      ...labors[index],
      ...laborData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    labors[index] = updatedLabor;
    return { ...updatedLabor };
  },

  async delete(id) {
    await delay(300);
    const index = labors.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Labor record not found');
    }
    
    labors.splice(index, 1);
    return true;
  },

  async getByRole(role) {
    await delay(250);
    return labors
      .filter(labor => labor.role.toLowerCase().includes(role.toLowerCase()))
      .map(labor => ({ ...labor }));
  },

  async getAvailableWorkers() {
    await delay(200);
    return labors
      .filter(labor => labor.status === 'available')
      .map(labor => ({ ...labor }));
  }
};