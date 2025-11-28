import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ExpenseCard from "@/components/organisms/ExpenseCard";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { expenseService } from "@/services/api/expenseService";
import { farmService } from "@/services/api/farmService";
import { toast } from "react-toastify";
import { formatCurrency, calculateTotal } from "@/utils/currencyUtils";
import { formatDate } from "@/utils/dateUtils";

const Expenses = () => {
  const [data, setData] = useState({
    expenses: [],
    farms: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFarm, setFilterFarm] = useState("all");

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    farmId: "",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [expenses, farms] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll(),
      ]);

      setData({ expenses, farms });
    } catch (err) {
      console.error("Failed to load expenses data:", err);
      setError("Failed to load expenses data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        ...expenseForm,
        farmId: parseInt(expenseForm.farmId),
        amount: parseFloat(expenseForm.amount),
      };
      
      if (editingExpense) {
        const updatedExpense = await expenseService.update(editingExpense.Id, expenseData);
        
        setData(prev => ({
          ...prev,
          expenses: prev.expenses.map(e => e.Id === editingExpense.Id ? updatedExpense : e)
        }));
        
        toast.success("Expense updated successfully!");
      } else {
        const newExpense = await expenseService.create(expenseData);
        
        setData(prev => ({
          ...prev,
          expenses: [...prev.expenses, newExpense]
        }));
        
        toast.success("Expense recorded successfully!");
      }
      
      resetExpenseForm();
      setShowExpenseModal(false);
    } catch (err) {
      console.error("Failed to save expense:", err);
      toast.error("Failed to save expense. Please try again.");
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      farmId: expense.farmId.toString(),
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || "",
      date: expense.date.split("T")[0],
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (expense) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    
    try {
      await expenseService.delete(expense.Id);
      
      setData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.Id !== expense.Id)
      }));
      
      toast.success("Expense deleted successfully!");
    } catch (err) {
      console.error("Failed to delete expense:", err);
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      farmId: "",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingExpense(null);
  };

  const getFilteredExpenses = () => {
    let filteredExpenses = [...data.expenses];
    
    // Category filter
    if (filterCategory !== "all") {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.category.toLowerCase() === filterCategory
      );
    }
    
    // Farm filter
    if (filterFarm !== "all") {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.farmId === parseInt(filterFarm)
      );
    }
    
    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filteredExpenses;
  };

  const getExpenseStats = () => {
    const currentDate = new Date();
    
    const thisMonth = data.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentDate.getMonth() &&
             expenseDate.getFullYear() === currentDate.getFullYear();
    });
    
    const lastMonth = data.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      return expenseDate.getMonth() === lastMonthDate.getMonth() &&
             expenseDate.getFullYear() === lastMonthDate.getFullYear();
    });
    
    const thisYear = data.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentDate.getFullYear();
    });
    
    const categorySummary = data.expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});
    
    return {
      thisMonth: calculateTotal(thisMonth),
      lastMonth: calculateTotal(lastMonth),
      thisYear: calculateTotal(thisYear),
      total: calculateTotal(data.expenses),
      categorySummary,
    };
  };

  const categoryOptions = [
    { value: "seeds", label: "Seeds" },
    { value: "fertilizer", label: "Fertilizer" },
    { value: "equipment", label: "Equipment" },
    { value: "labor", label: "Labor" },
    { value: "fuel", label: "Fuel" },
    { value: "maintenance", label: "Maintenance" },
  ];

  if (loading) {
    return <Loading message="Loading your expenses..." variant="list" />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadData} />;
  }

  const filteredExpenses = getFilteredExpenses();
  const stats = getExpenseStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                Farm Expenses
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage your farm-related expenses
              </p>
            </div>
            
            <Button
              onClick={() => {
                resetExpenseForm();
                setShowExpenseModal(true);
              }}
              variant="primary"
              size="sm"
              disabled={data.farms.length === 0}
            >
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <ApperIcon name="Calendar" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.thisMonth)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ApperIcon name="CalendarDays" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Month</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.lastMonth)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ApperIcon name="TrendingUp" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Year</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.thisYear)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <ApperIcon name="DollarSign" className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Summary */}
        {Object.keys(stats.categorySummary).length > 0 && (
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Expenses by Category
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.categorySummary).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm
              </label>
              <Select
                value={filterFarm}
                onChange={(e) => setFilterFarm(e.target.value)}
              >
                <option value="all">All Farms</option>
                {data.farms.map(farm => (
                  <option key={farm.Id} value={farm.Id.toString()}>
                    {farm.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilterCategory("all");
                  setFilterFarm("all");
                }}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Empty
              title={data.expenses.length === 0 ? "No expenses yet" : "No expenses match your filters"}
              description={data.expenses.length === 0 
                ? "Start tracking your farm expenses by recording your first transaction."
                : "Try adjusting your filters to see more expenses."
              }
              icon="DollarSign"
              actionText={data.expenses.length === 0 ? "Record Your First Expense" : "Clear Filters"}
              onAction={data.expenses.length === 0 
                ? () => {
                    resetExpenseForm();
                    setShowExpenseModal(true);
                  }
                : () => {
                    setFilterCategory("all");
                    setFilterFarm("all");
                  }
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map(expense => (
              <ExpenseCard
                key={expense.Id}
                expense={expense}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowExpenseModal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h3>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <FormField
                  label="Farm"
                  name="farmId"
                  type="select"
                  value={expenseForm.farmId}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, farmId: e.target.value }))}
                  options={data.farms.map(farm => ({
                    value: farm.Id.toString(),
                    label: farm.name
                  }))}
                  required
                />

                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  options={categoryOptions}
                  required
                />

                <FormField
                  label="Amount"
                  name="amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                  step="0.01"
                  min="0.01"
                />

                <FormField
                  label="Date"
                  name="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter expense description"
                  rows={3}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
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
                    {editingExpense ? "Update Expense" : "Record Expense"}
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
          resetExpenseForm();
          setShowExpenseModal(true);
        }}
        icon="Plus"
      />
    </div>
  );
};

export default Expenses;