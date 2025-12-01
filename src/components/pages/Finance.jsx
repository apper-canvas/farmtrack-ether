import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import { financeService } from '@/services/api/financeService';
import { toast } from 'react-toastify';
import { formatDate, formatDateTime, getCurrentMonth, getLastNMonths } from '@/utils/dateUtils';
import { calculateTotal, calculateMonthlyTotal } from '@/utils/currencyUtils';

function Finance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('current');
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories = [
    'Seeds & Plants',
    'Fertilizers',
    'Equipment',
    'Labor',
    'Utilities',
    'Transport',
    'Insurance',
    'Maintenance',
    'Other'
  ];

  const incomeCategories = [
    'Crop Sales',
    'Livestock Sales',
    'Equipment Rental',
    'Consulting',
    'Subsidies',
    'Other'
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await financeService.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingTransaction) {
        await financeService.updateTransaction(editingTransaction.Id, transactionData);
        toast.success('Transaction updated successfully');
      } else {
        await financeService.createTransaction(transactionData);
        toast.success('Transaction added successfully');
      }

      await loadTransactions();
      resetForm();
    } catch (err) {
      toast.error(editingTransaction ? 'Failed to update transaction' : 'Failed to add transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date
    });
    setShowForm(true);
  };

  const handleDelete = async (transaction) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await financeService.deleteTransaction(transaction.Id);
      toast.success('Transaction deleted successfully');
      await loadTransactions();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    // Filter by month
    if (selectedMonth === 'current') {
      const { month, year } = getCurrentMonth();
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getFinancialSummary = () => {
    const { month, year } = getCurrentMonth();
    const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const monthlyIncome = calculateMonthlyTotal(transactions, 'income');
    const monthlyExpenses = calculateMonthlyTotal(transactions, 'expense');
    const monthlyProfit = monthlyIncome - monthlyExpenses;

    const totalIncome = calculateTotal(transactions.filter(t => t.type === 'income'));
    const totalExpenses = calculateTotal(transactions.filter(t => t.type === 'expense'));

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit,
      totalIncome,
      totalExpenses,
      totalProfit: totalIncome - totalExpenses
    };
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadTransactions} />;

  const filteredTransactions = getFilteredTransactions();
  const summary = getFinancialSummary();
  const currentMonth = getCurrentMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="md:hidden"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Finance</h1>
              <p className="text-gray-600">Track your farm's income and expenses</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${summary.monthlyExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ApperIcon name="TrendingDown" className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Profit</p>
                <p className={`text-2xl font-bold ${summary.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary.monthlyProfit.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.monthlyProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <ApperIcon name="DollarSign" className={`w-6 h-6 ${summary.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary.totalProfit.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <ApperIcon name="Wallet" className={`w-6 h-6 ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Transactions
              </label>
              <Input
                type="text"
                placeholder="Search by description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full"
              >
                <option value="current">Current Month</option>
                <option value="all">All Time</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </h2>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  size="sm"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
<FormField
                  label="Transaction Type"
                  type="select"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, category: '' }))}
                  options={[
                    { value: 'expense', label: 'Expense' },
                    { value: 'income', label: 'Income' }
                  ]}
                  required
                />

                <FormField
                  label="Amount ($)"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />

                <FormField
                  label="Description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter transaction description"
                  required
                />

                <FormField
                  label="Category"
                  type="select"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </FormField>

                <FormField
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                  >
                    {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
              {filter !== 'all' && (
                <span className="ml-2 text-sm text-gray-500">
                  ({filter === 'income' ? 'Income' : 'Expenses'} only)
                </span>
              )}
            </h2>
            {filteredTransactions.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                {selectedMonth === 'current' && ` for ${currentMonth.name} ${currentMonth.year}`}
              </p>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTransactions.length === 0 ? (
              <Empty
                title="No transactions found"
                description={
                  filter !== 'all' || searchQuery
                    ? "No transactions match your current filters."
                    : "Start tracking your farm finances by adding your first transaction."
                }
                action={
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                }
              />
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.Id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <ApperIcon 
                            name={transaction.type === 'income' ? 'TrendingUp' : 'TrendingDown'} 
                            className={`w-5 h-5 ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                          <p className="text-sm text-gray-600">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="ml-13 flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(transaction)}
                          variant="outline"
                          size="sm"
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(transaction)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Finance;