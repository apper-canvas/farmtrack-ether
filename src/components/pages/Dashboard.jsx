import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import TaskCard from "@/components/organisms/TaskCard";
import WeatherCard from "@/components/organisms/WeatherCard";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { farmService } from "@/services/api/farmService";
import { cropService } from "@/services/api/cropService";
import { taskService } from "@/services/api/taskService";
import { expenseService } from "@/services/api/expenseService";
import { weatherService } from "@/services/api/weatherService";
import { toast } from "react-toastify";
import { formatCurrency, calculateTotal } from "@/utils/currencyUtils";
import { isOverdue, isDueSoon } from "@/utils/dateUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    expenses: [],
    weather: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [farms, crops, tasks, expenses, weather] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        expenseService.getAll(),
        weatherService.getCurrentWeather(),
      ]);

      setData({ farms, crops, tasks, expenses, weather });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (task) => {
    try {
      await taskService.complete(task.Id);
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.Id === task.Id 
            ? { ...t, completed: true, completedAt: new Date().toISOString() }
            : t
        )
      }));
      toast.success("Task completed successfully!");
    } catch (err) {
      console.error("Failed to complete task:", err);
      toast.error("Failed to complete task. Please try again.");
    }
  };

  const getStatsData = () => {
    const totalFarms = data.farms.length;
    const activeCrops = data.crops.filter(crop => 
      crop.status !== "harvested"
    ).length;
    
    const pendingTasks = data.tasks.filter(task => !task.completed).length;
    const overdueTasks = data.tasks.filter(task => 
      !task.completed && isOverdue(task.dueDate)
    ).length;
    
    const thisMonthExpenses = data.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const thisMonth = new Date();
      return expenseDate.getMonth() === thisMonth.getMonth() &&
             expenseDate.getFullYear() === thisMonth.getFullYear();
    });
    
    return {
      totalFarms,
      activeCrops,
      pendingTasks,
      overdueTasks,
      monthlyExpenses: calculateTotal(thisMonthExpenses),
    };
  };

  const getTodaysTasks = () => {
    return data.tasks
      .filter(task => !task.completed)
      .filter(task => isDueSoon(task.dueDate, 2) || isOverdue(task.dueDate))
      .slice(0, 5);
  };

  if (loading) {
    return <Loading message="Loading your farm dashboard..." />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadDashboardData} />;
  }

  const stats = getStatsData();
  const todaysTasks = getTodaysTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                Farm Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Your agricultural operations at a glance
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate("/tasks")}
                variant="outline"
                size="sm"
              >
                <ApperIcon name="CheckSquare" className="h-4 w-4 mr-2" />
                View All Tasks
              </Button>
              
              <Button
                onClick={() => navigate("/farms")}
                variant="primary"
                size="sm"
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Farm
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Farms"
            value={stats.totalFarms}
            icon="MapPin"
            iconColor="text-secondary-600"
            iconBackground="bg-secondary-100"
            onClick={() => navigate("/farms")}
          />
          
          <StatCard
            title="Active Crops"
            value={stats.activeCrops}
            icon="Wheat"
            iconColor="text-primary-600"
            iconBackground="bg-primary-100"
            onClick={() => navigate("/farms")}
          />
          
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            subtitle={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "All on track"}
            icon="CheckSquare"
            iconColor={stats.overdueTasks > 0 ? "text-red-600" : "text-accent-600"}
            iconBackground={stats.overdueTasks > 0 ? "bg-red-100" : "bg-accent-100"}
            onClick={() => navigate("/tasks")}
          />
          
          <StatCard
            title="This Month"
            value={formatCurrency(stats.monthlyExpenses)}
            subtitle="Total expenses"
            icon="DollarSign"
            iconColor="text-green-600"
            iconBackground="bg-green-100"
            onClick={() => navigate("/expenses")}
          />
          
          <StatCard
            title="Weather"
            value={data.weather ? `${data.weather.temperature}°F` : "--"}
            subtitle={data.weather?.condition || "Loading..."}
            icon="Cloud"
            iconColor="text-blue-600"
            iconBackground="bg-blue-100"
            onClick={() => navigate("/weather")}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Today's Priority Tasks
                </h2>
                <Button
                  onClick={() => navigate("/tasks")}
                  variant="ghost"
                  size="sm"
                >
                  View All
                  <ApperIcon name="ArrowRight" className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {todaysTasks.length > 0 ? (
                  todaysTasks.map(task => (
                    <TaskCard
                      key={task.Id}
                      task={task}
                      crop={data.crops.find(c => c.Id === task.cropId)}
                      onComplete={handleTaskComplete}
                      className="border border-gray-100"
                    />
                  ))
                ) : (
                  <Empty
                    title="No urgent tasks"
                    description="All your tasks are on schedule. Great work!"
                    icon="CheckCircle"
                    variant="compact"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Weather & Quick Actions */}
          <div className="space-y-6">
            {/* Weather Card */}
            {data.weather && (
              <WeatherCard
                weather={data.weather}
                variant="current"
              />
            )}
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/farms")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ApperIcon name="Plus" className="h-5 w-5 mr-3" />
                  Add New Farm
                </Button>
                
                <Button
                  onClick={() => navigate("/tasks")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ApperIcon name="CheckSquare" className="h-5 w-5 mr-3" />
                  Create Task
                </Button>
                
                <Button
                  onClick={() => navigate("/expenses")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ApperIcon name="DollarSign" className="h-5 w-5 mr-3" />
                  Record Expense
                </Button>
                
                <Button
                  onClick={() => navigate("/weather")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ApperIcon name="Cloud" className="h-5 w-5 mr-3" />
                  View Forecast
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Farm Overview
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-sage-50 rounded-lg">
              <ApperIcon name="MapPin" className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalFarms}</div>
              <div className="text-sm text-gray-600">Total Farms</div>
            </div>
            
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <ApperIcon name="Wheat" className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.activeCrops}</div>
              <div className="text-sm text-gray-600">Active Crops</div>
            </div>
            
            <div className="text-center p-4 bg-accent-50 rounded-lg">
              <ApperIcon name="AlertCircle" className="h-8 w-8 text-accent-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.overdueTasks}</div>
              <div className="text-sm text-gray-600">Overdue Tasks</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.monthlyExpenses)}
              </div>
              <div className="text-sm text-gray-600">Monthly Expenses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => navigate("/farms")}
        icon="Plus"
      />
    </div>
  );
};

export default Dashboard;