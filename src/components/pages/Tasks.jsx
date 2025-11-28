import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import TaskCard from "@/components/organisms/TaskCard";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";
import { cropService } from "@/services/api/cropService";
import { fieldService } from "@/services/api/fieldService";
import { farmService } from "@/services/api/farmService";
import { toast } from "react-toastify";
import { isOverdue, isDueSoon } from "@/utils/dateUtils";

const Tasks = () => {
  const [data, setData] = useState({
    tasks: [],
    crops: [],
    fields: [],
    farms: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    cropId: "",
    dueDate: "",
    priority: "medium",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [tasks, crops, fields, farms] = await Promise.all([
        taskService.getAll(),
        cropService.getAll(),
        fieldService.getAll(),
        farmService.getAll(),
      ]);

      setData({ tasks, crops, fields, farms });
    } catch (err) {
      console.error("Failed to load tasks data:", err);
      setError("Failed to load tasks data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...taskForm,
        cropId: parseInt(taskForm.cropId),
      };
      
      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.Id, taskData);
        
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.Id === editingTask.Id ? updatedTask : t)
        }));
        
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.create(taskData);
        
        setData(prev => ({
          ...prev,
          tasks: [...prev.tasks, newTask]
        }));
        
        toast.success("Task created successfully!");
      }
      
      resetTaskForm();
      setShowTaskModal(false);
    } catch (err) {
      console.error("Failed to save task:", err);
      toast.error("Failed to save task. Please try again.");
    }
  };

  const handleTaskComplete = async (task) => {
    try {
      const updatedTask = await taskService.complete(task.Id);
      
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.Id === task.Id ? updatedTask : t)
      }));
      
      toast.success("Task completed successfully!");
    } catch (err) {
      console.error("Failed to complete task:", err);
      toast.error("Failed to complete task. Please try again.");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      cropId: task.cropId.toString(),
      dueDate: task.dueDate.split("T")[0],
      priority: task.priority || "medium",
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (task) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    try {
      await taskService.delete(task.Id);
      
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.Id !== task.Id)
      }));
      
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      cropId: "",
      dueDate: "",
      priority: "medium",
    });
    setEditingTask(null);
  };

  const getFilteredTasks = () => {
    let filteredTasks = [...data.tasks];
    
    // Status filter
    if (filterStatus === "pending") {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filterStatus === "completed") {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filterStatus === "overdue") {
      filteredTasks = filteredTasks.filter(task => 
        !task.completed && isOverdue(task.dueDate)
      );
    } else if (filterStatus === "due-soon") {
      filteredTasks = filteredTasks.filter(task => 
        !task.completed && isDueSoon(task.dueDate)
      );
    }
    
    // Priority filter
    if (filterPriority !== "all") {
      filteredTasks = filteredTasks.filter(task => 
        (task.priority || "medium").toLowerCase() === filterPriority
      );
    }
    
    // Sort by due date (soonest first)
    filteredTasks.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    return filteredTasks;
  };

  const getTaskStats = () => {
    const pending = data.tasks.filter(task => !task.completed).length;
    const completed = data.tasks.filter(task => task.completed).length;
    const overdue = data.tasks.filter(task => 
      !task.completed && isOverdue(task.dueDate)
    ).length;
    const dueSoon = data.tasks.filter(task => 
      !task.completed && isDueSoon(task.dueDate)
    ).length;
    
    return { pending, completed, overdue, dueSoon };
  };

  const priorityOptions = [
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ];

  if (loading) {
    return <Loading message="Loading your tasks..." variant="list" />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadData} />;
  }

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                Farm Tasks
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your daily farm operations and activities
              </p>
            </div>
            
            <Button
              onClick={() => {
                resetTaskForm();
                setShowTaskModal(true);
              }}
              variant="primary"
              size="sm"
              disabled={data.crops.length === 0}
            >
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent-100 rounded-xl">
                <ApperIcon name="Clock" className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <ApperIcon name="CheckCircle" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <ApperIcon name="AlertTriangle" className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ApperIcon name="Calendar" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dueSoon}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="due-soon">Due Soon</option>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterPriority("all");
                }}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Empty
              title={data.tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
              description={data.tasks.length === 0 
                ? "Create your first task to start organizing your farm activities."
                : "Try adjusting your filters to see more tasks."
              }
              icon="CheckSquare"
              actionText={data.tasks.length === 0 ? "Create Your First Task" : "Clear Filters"}
              onAction={data.tasks.length === 0 
                ? () => {
                    resetTaskForm();
                    setShowTaskModal(true);
                  }
                : () => {
                    setFilterStatus("all");
                    setFilterPriority("all");
                  }
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.Id}
                task={task}
                crop={data.crops.find(c => c.Id === task.cropId)}
                onComplete={handleTaskComplete}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowTaskModal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <FormField
                  label="Task Title"
                  name="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  required
                />

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                />

                <FormField
                  label="Crop"
                  name="cropId"
                  type="select"
                  value={taskForm.cropId}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, cropId: e.target.value }))}
                  options={data.crops.map(crop => ({
                    value: crop.Id.toString(),
                    label: `${crop.name} (${data.fields.find(f => f.Id === crop.fieldId)?.name})`
                  }))}
                  required
                />

                <FormField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />

                <FormField
                  label="Priority"
                  name="priority"
                  type="select"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                  options={priorityOptions}
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
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
                    {editingTask ? "Update Task" : "Create Task"}
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
          resetTaskForm();
          setShowTaskModal(true);
        }}
        icon="Plus"
      />
    </div>
  );
};

export default Tasks;