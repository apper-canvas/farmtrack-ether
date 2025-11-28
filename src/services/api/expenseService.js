import expenseData from "@/services/mockData/expenses.json";

let expenses = [...expenseData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const expenseService = {
  async getAll() {
    await delay(300);
    return [...expenses];
  },

  async getByFarmId(farmId) {
    await delay(250);
    return expenses.filter(e => e.farmId === parseInt(farmId));
  },

  async getById(id) {
    await delay(200);
    const expense = expenses.find(e => e.Id === parseInt(id));
    if (!expense) {
      throw new Error("Expense not found");
    }
    return { ...expense };
  },

  async create(expenseData) {
    await delay(400);
    const newExpense = {
      ...expenseData,
      Id: Math.max(...expenses.map(e => e.Id), 0) + 1,
      farmId: parseInt(expenseData.farmId),
      amount: parseFloat(expenseData.amount),
      date: new Date(expenseData.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    return { ...newExpense };
  },

  async update(id, expenseData) {
    await delay(350);
    const index = expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Expense not found");
    }
    
    expenses[index] = {
      ...expenses[index],
      ...expenseData,
      Id: parseInt(id),
      farmId: parseInt(expenseData.farmId),
      amount: parseFloat(expenseData.amount),
      date: new Date(expenseData.date).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return { ...expenses[index] };
  },

  async delete(id) {
    await delay(300);
    const index = expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Expense not found");
    }
    
    expenses.splice(index, 1);
    return true;
  },
};