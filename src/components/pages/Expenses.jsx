import React, { useEffect, useState } from "react";
import { expenseService } from "@/services/api/expenseService";
import { farmService } from "@/services/api/farmService";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ExpenseCard from "@/components/organisms/ExpenseCard";
import Farms from "@/components/pages/Farms";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import FormField from "@/components/molecules/FormField";
import { calculateTotal, formatCurrency } from "@/utils/currencyUtils";
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
  const [chartType, setChartType] = useState("bar");
  const [chartPeriod, setChartPeriod] = useState("monthly");
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

  const getChartData = () => {
    const stats = getExpenseStats();
    const currentDate = new Date();
    
    if (chartPeriod === "monthly") {
      // Monthly data for current year
      const monthlyData = {};
      
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentDate.getFullYear(), i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        monthlyData[monthName] = {};
        
        categoryOptions.forEach(cat => {
          monthlyData[monthName][cat.value] = 0;
        });
      }
      
      data.expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getFullYear() === currentDate.getFullYear()) {
          const monthName = expenseDate.toLocaleString('default', { month: 'short' });
          if (monthlyData[monthName] && monthlyData[monthName].hasOwnProperty(expense.category)) {
            monthlyData[monthName][expense.category] += expense.amount;
          }
        }
      });
      
      const months = Object.keys(monthlyData);
      const series = categoryOptions.map(cat => ({
        name: cat.label,
        data: months.map(month => monthlyData[month][cat.value])
      }));
      
      return {
        series: chartType === "pie" ? Object.values(stats.categorySummary) : series,
        options: {
          chart: {
            type: chartType === "pie" ? "pie" : "bar",
            height: 350,
            fontFamily: 'Inter, sans-serif',
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            },
            toolbar: {
              show: false
            }
          },
          colors: ['#8BC34A', '#4CAF50', '#FFA726', '#FF9800', '#42A5F5', '#E53935', '#9C27B0'],
          plotOptions: chartType === "bar" ? {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              endingShape: 'rounded',
              borderRadius: 4,
            }
          } : {
            pie: {
              donut: {
                size: '45%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Total',
                    formatter: function (w) {
                      return formatCurrency(stats.total);
                    }
                  }
                }
              }
            }
          },
          dataLabels: {
            enabled: chartType === "pie",
            formatter: function(val) {
              return val.toFixed(1) + "%";
            }
          },
          stroke: {
            show: true,
            width: chartType === "pie" ? 0 : 2,
            colors: ['transparent']
          },
          xaxis: chartType === "bar" ? {
            categories: months,
            labels: {
              style: {
                colors: '#666',
                fontSize: '12px'
              }
            }
          } : undefined,
          yaxis: chartType === "bar" ? {
            labels: {
              formatter: function (val) {
                return formatCurrency(val);
              },
              style: {
                colors: '#666',
                fontSize: '12px'
              }
            }
          } : undefined,
          labels: chartType === "pie" ? categoryOptions.map(cat => cat.label) : undefined,
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            markers: {
              width: 8,
              height: 8,
              radius: 4
            }
          },
          tooltip: {
            theme: 'light',
            y: {
              formatter: function (val) {
                return formatCurrency(val);
              }
            }
          },
          grid: chartType === "bar" ? {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: {
              lines: {
                show: false
              }
            }
          } : undefined,
          responsive: [{
            breakpoint: 768,
            options: {
              chart: {
                height: 300
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
      };
    } else {
      // Yearly data for last 5 years
      const yearlyData = {};
      const startYear = currentDate.getFullYear() - 4;
      
      for (let i = 0; i < 5; i++) {
        const year = startYear + i;
        yearlyData[year] = {};
        
        categoryOptions.forEach(cat => {
          yearlyData[year][cat.value] = 0;
        });
      }
      
      data.expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const year = expenseDate.getFullYear();
        if (yearlyData[year] && yearlyData[year].hasOwnProperty(expense.category)) {
          yearlyData[year][expense.category] += expense.amount;
        }
      });
      
      const years = Object.keys(yearlyData).map(String);
      const series = categoryOptions.map(cat => ({
        name: cat.label,
        data: years.map(year => yearlyData[year][cat.value])
      }));
      
      return {
        series: chartType === "pie" ? Object.values(stats.categorySummary) : series,
        options: {
          chart: {
            type: chartType === "pie" ? "pie" : "bar",
            height: 350,
            fontFamily: 'Inter, sans-serif',
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            },
            toolbar: {
              show: false
            }
          },
          colors: ['#8BC34A', '#4CAF50', '#FFA726', '#FF9800', '#42A5F5', '#E53935', '#9C27B0'],
          plotOptions: chartType === "bar" ? {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              endingShape: 'rounded',
              borderRadius: 4,
            }
          } : {
            pie: {
              donut: {
                size: '45%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Total',
                    formatter: function (w) {
                      return formatCurrency(stats.total);
                    }
                  }
                }
              }
            }
          },
          dataLabels: {
            enabled: chartType === "pie",
            formatter: function(val) {
              return val.toFixed(1) + "%";
            }
          },
          stroke: {
            show: true,
            width: chartType === "pie" ? 0 : 2,
            colors: ['transparent']
          },
          xaxis: chartType === "bar" ? {
            categories: years,
            labels: {
              style: {
                colors: '#666',
                fontSize: '12px'
              }
            }
          } : undefined,
          yaxis: chartType === "bar" ? {
            labels: {
              formatter: function (val) {
                return formatCurrency(val);
              },
              style: {
                colors: '#666',
                fontSize: '12px'
              }
            }
          } : undefined,
          labels: chartType === "pie" ? categoryOptions.map(cat => cat.label) : undefined,
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            markers: {
              width: 8,
              height: 8,
              radius: 4
            }
          },
          tooltip: {
            theme: 'light',
            y: {
              formatter: function (val) {
                return formatCurrency(val);
              }
            }
          },
          grid: chartType === "bar" ? {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: {
              lines: {
                show: false
              }
            }
          } : undefined,
          responsive: [{
            breakpoint: 768,
            options: {
              chart: {
                height: 300
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        }
      };
    }
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
        {/* Chart Visualization Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ApperIcon name="BarChart3" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Expense Analytics</h2>
                  <p className="text-white/80 text-sm">Visualize spending by category</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Chart Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Chart Type:</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setChartType("bar")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      chartType === "bar"
                        ? "bg-primary-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ApperIcon name="BarChart3" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartType("pie")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      chartType === "pie"
                        ? "bg-primary-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ApperIcon name="PieChart" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Period:</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setChartPeriod("monthly")}
                    className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      chartPeriod === "monthly"
                        ? "bg-primary-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartPeriod("yearly")}
                    className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      chartPeriod === "yearly"
                        ? "bg-primary-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-gray-50/50 rounded-xl p-4 min-h-[400px] flex items-center justify-center">
              {data.expenses.length > 0 ? (
                <div className="w-full">
                  <Chart
                    options={getChartData().options}
                    series={getChartData().series}
                    type={chartType === "pie" ? "donut" : "bar"}
                    height={350}
                    width="100%"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <ApperIcon name="BarChart3" className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
<p className="text-gray-600 text-sm mb-4">Add some expenses to see your spending analytics</p>
                  <Button
                    onClick={() => {
                      resetExpenseForm();
                      setShowExpenseModal(true);
                    }}
                    className="inline-flex items-center space-x-2"
                  >
                    <ApperIcon name="Plus" className="w-4 h-4" />
                    <span>Add Expense</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Chart Summary Stats */}
            {data.expenses.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-700">
                    {formatCurrency(getExpenseStats().thisMonth)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">This Month</div>
                </div>
                <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-secondary-700">
                    {formatCurrency(getExpenseStats().lastMonth)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Last Month</div>
                </div>
                <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent-700">
                    {formatCurrency(getExpenseStats().thisYear)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">This Year</div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-primary-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {Object.keys(getExpenseStats().categorySummary).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Categories</div>
                </div>
              </div>
            )}
          </div>
        </div>
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