import taskData from "@/services/mockData/tasks.json";

let tasks = [...taskData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getByCropId(cropId) {
    await delay(250);
    return tasks.filter(t => t.cropId === parseInt(cropId));
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error("Task not found");
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id), 0) + 1,
      cropId: parseInt(taskData.cropId),
      dueDate: new Date(taskData.dueDate).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await delay(350);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    tasks[index] = {
      ...tasks[index],
      ...taskData,
      Id: parseInt(id),
      cropId: parseInt(taskData.cropId),
      dueDate: new Date(taskData.dueDate).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { ...tasks[index] };
  },

  async complete(id) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    tasks[index] = {
      ...tasks[index],
      completed: true,
      completedAt: new Date().toISOString(),
    };
    
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task not found");
    }
    
    tasks.splice(index, 1);
    return true;
  },
};