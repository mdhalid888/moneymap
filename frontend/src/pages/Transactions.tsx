import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiEdit2, FiTrash2, FiSearch, FiFilter, FiX } from 'react-icons/fi';

interface ExpenseType {
  _id: string;
  title: string;
  amount: number;
  category: string;
  currency: string;
  date: string;
}

const CATEGORIES = ['All', 'Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];
const CATEGORIES_NO_ALL = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];
const CURRENCIES = ['₹', '$', '€', '£', '¥'];

const Transactions: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit states
  const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const openEditModal = (expense: ExpenseType) => {
    setEditingExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditCurrency(expense.currency);
    setEditDate(expense.date.split('T')[0]);
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingExpense(null);
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editTitle || !editAmount) {
      setEditError('Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(editAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setEditError('Please enter a valid amount');
      return;
    }

    setEditSubmitting(true);
    try {
      await api.put(`/expenses/${editingExpense?._id}`, {
        title: editTitle,
        amount: numericAmount,
        category: editCategory,
        currency: editCurrency,
        date: new Date(editDate),
      });
      closeEditModal();
      await fetchExpenses();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Filter logic
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (val: number, symbol = '₹') => {
    return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl md:text-[36px] font-extrabold text-slate-900 dark:text-white leading-tight">
          Transactions Ledger
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, filter, search, and manage your full spending history.
        </p>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder shadow-premium">
        
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="premium-input !pl-10 !h-[46px]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiFilter className="text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="premium-input !h-[46px] w-full sm:w-48"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} Category
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Grid/Table */}
      <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder p-6 shadow-premium">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Retrieving financial ledger...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-100 dark:border-darkBorder rounded-2xl">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              No transactions match your filters. Add an expense or adjust your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-darkBorder text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Expense Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Transaction Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-darkBorder/40">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp._id}
                    className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/55 dark:hover:bg-darkInput/20 transition-all group"
                  >
                    <td className="py-4.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {exp.title}
                    </td>
                    <td className="py-4.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 dark:bg-darkBorder dark:text-slate-400">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 text-xs text-slate-400 dark:text-slate-500">
                      {new Date(exp.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-500 dark:text-slate-400 dark:hover:bg-darkInput dark:hover:text-blue-400 transition-all"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-500 dark:text-slate-400 dark:hover:bg-darkInput dark:hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditModal} />
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-darkCard border border-slate-100 dark:border-darkBorder p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-darkBorder">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Transaction</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 text-xs text-red-600 dark:text-red-400">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <div>
                <label className="premium-label">Expense Name</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="premium-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="premium-label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="premium-input"
                    required
                  />
                </div>

                <div>
                  <label className="premium-label">Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="premium-input"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="premium-label">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="premium-input"
                >
                  {CATEGORIES_NO_ALL.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="premium-label">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="premium-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={editSubmitting}
                className="w-full flex items-center justify-center h-[52px] rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {editSubmitting ? 'Updating...' : 'Update Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
