import { toast } from 'react-toastify';

// Mock data for equipment
let mockEquipment = [
  {
    Id: 1,
    name: "John Deere 5075M",
    type: "Tractor",
    brand: "John Deere",
    model: "5075M",
    purchaseDate: "2022-03-15",
    status: "operational",
    lastMaintenance: "2024-11-01",
    nextMaintenance: "2025-02-01",
    cost: 85000,
    notes: "Primary field tractor, excellent condition"
  },
  {
    Id: 2,
    name: "New Holland BC5060",
    type: "Baler",
    brand: "New Holland",
    model: "BC5060",
    purchaseDate: "2021-08-22",
    status: "maintenance",
    lastMaintenance: "2024-12-15",
    nextMaintenance: "2025-01-15",
    cost: 42000,
    notes: "Small square baler, currently under maintenance"
  },
  {
    Id: 3,
    name: "Case IH Axial-Flow 250",
    type: "Combine Harvester",
    brand: "Case IH",
    model: "Axial-Flow 250",
    purchaseDate: "2020-05-10",
    status: "operational",
    lastMaintenance: "2024-10-20",
    nextMaintenance: "2025-03-20",
    cost: 125000,
    notes: "Main harvest equipment, high capacity"
  },
  {
    Id: 4,
    name: "Kubota M7060",
    type: "Utility Tractor",
    brand: "Kubota",
    model: "M7060",
    purchaseDate: "2023-01-18",
    status: "operational",
    lastMaintenance: "2024-12-10",
    nextMaintenance: "2025-04-10",
    cost: 52000,
    notes: "Versatile utility tractor for various tasks"
  },
  {
    Id: 5,
    name: "Bush Hog 2615",
    type: "Rotary Cutter",
    brand: "Bush Hog",
    model: "2615",
    purchaseDate: "2019-06-30",
    status: "retired",
    lastMaintenance: "2024-08-05",
    nextMaintenance: null,
    cost: 8500,
    notes: "Old rotary cutter, replaced by newer model"
  }
];

let nextId = 6;

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const equipmentService = {
  // Get all equipment
  async getAll() {
    await delay(300);
    return [...mockEquipment];
  },

  // Get equipment by ID
  async getById(id) {
    await delay(200);
    const equipment = mockEquipment.find(item => item.Id === parseInt(id));
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    return { ...equipment };
  },

  // Create new equipment
  async create(equipmentData) {
    await delay(400);
    
    const newEquipment = {
      ...equipmentData,
      Id: nextId++
    };
    
    mockEquipment.push(newEquipment);
    
    toast.success('Equipment added successfully');
    return { ...newEquipment };
  },

  // Update equipment
  async update(id, equipmentData) {
    await delay(400);
    
    const index = mockEquipment.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Equipment not found');
    }
    
    mockEquipment[index] = {
      ...mockEquipment[index],
      ...equipmentData,
      Id: parseInt(id)
    };
    
    toast.success('Equipment updated successfully');
    return { ...mockEquipment[index] };
  },

  // Delete equipment
  async delete(id) {
    await delay(300);
    
    const index = mockEquipment.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Equipment not found');
    }
    
    mockEquipment.splice(index, 1);
    toast.success('Equipment deleted successfully');
    return true;
  },

  // Get equipment by status
  async getByStatus(status) {
    await delay(250);
    return mockEquipment.filter(item => item.status === status).map(item => ({ ...item }));
  },

  // Get equipment due for maintenance
  async getDueForMaintenance() {
    await delay(250);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return mockEquipment
      .filter(item => item.nextMaintenance && new Date(item.nextMaintenance) <= thirtyDaysFromNow)
      .map(item => ({ ...item }));
  }
};