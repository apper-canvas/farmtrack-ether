import expenseData from '@/services/mockData/expenses.json';

// Simulate API delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let mockTransactions = [...expenseData];
let nextId = Math.max(...mockTransactions.map(t => t.Id)) + 1;

export const financeService = {
  async getAllTransactions() {
    await delay(800);
    return [...mockTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getTransactionById(id) {
    await delay(300);
    const transaction = mockTransactions.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return { ...transaction };
  },

  async createTransaction(transactionData) {
    await delay(1000);
    
    const newTransaction = {
      Id: nextId++,
      ...transactionData,
      amount: parseFloat(transactionData.amount),
      date: transactionData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    mockTransactions.unshift(newTransaction);
    return { ...newTransaction };
  },

  async updateTransaction(id, transactionData) {
    await delay(800);
    
    const index = mockTransactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = {
      ...mockTransactions[index],
      ...transactionData,
      amount: parseFloat(transactionData.amount),
      updatedAt: new Date().toISOString()
    };

    mockTransactions[index] = updatedTransaction;
    return { ...updatedTransaction };
  },

  async deleteTransaction(id) {
    await delay(600);
    
    const index = mockTransactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Transaction not found');
    }

    mockTransactions.splice(index, 1);
    return true;
  },

  async getTransactionSummary() {
    await delay(500);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = mockTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = mockTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit: monthlyIncome - monthlyExpenses,
      totalIncome,
      totalExpenses,
      totalProfit: totalIncome - totalExpenses,
      transactionCount: mockTransactions.length,
      monthlyTransactionCount: currentMonthTransactions.length
    };
  },

  async getTransactionsByCategory(type = null) {
    await delay(400);
    
    let transactions = type ? mockTransactions.filter(t => t.type === type) : mockTransactions;
    
    const categorySummary = {};
    transactions.forEach(t => {
      if (!categorySummary[t.category]) {
        categorySummary[t.category] = {
          category: t.category,
          total: 0,
          count: 0,
          type: t.type
        };
      }
      categorySummary[t.category].total += t.amount;
      categorySummary[t.category].count += 1;
    });

    return Object.values(categorySummary).sort((a, b) => b.total - a.total);
  },

  async getMonthlyTrends(months = 6) {
    await delay(600);
    
    const trends = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = mockTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month.getMonth() && 
               tDate.getFullYear() === month.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        profit: income - expenses
      });
    }

    return trends;
  }
};