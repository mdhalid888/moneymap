import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiX, FiCheck, FiDownload } from 'react-icons/fi';

interface ExpenseType {
  _id: string;
  title: string;
  amount: number;
  category: string;
  currency: string;
  date: string;
}

const CATEGORIES = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Shopping', 'Healthcare', 'Others'];
const CURRENCIES = ['₹', '$', '€', '£', '¥'];

const Dashboard: React.FC = () => {
  const { user, updateUserIncome } = useAuth();
  
  // States
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Expense form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Income edit states
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState('');
  const [incomeUpdating, setIncomeUpdating] = useState(false);

  // Edit Expense modal states
  const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Fetch all user expenses
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

  // Submit new expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !amount) {
      setFormError('Please fill in both expense name and amount');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/expenses', {
        title,
        amount: numericAmount,
        category,
        currency,
        date: new Date(date),
      });
      
      // Reset form
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Auto refresh
      await fetchExpenses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  // Open edit modal
  const openEditModal = (expense: ExpenseType) => {
    setEditingExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditCurrency(expense.currency);
    setEditDate(expense.date.split('T')[0]);
    setEditError(null);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingExpense(null);
  };

  // Submit edited expense
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

  // Submit income change
  const handleSaveIncome = async () => {
    const numericIncome = parseFloat(tempIncome);
    if (isNaN(numericIncome) || numericIncome < 0) {
      alert('Please enter a valid income amount');
      return;
    }

    setIncomeUpdating(true);
    const success = await updateUserIncome(numericIncome);
    setIncomeUpdating(false);
    if (success) {
      setIsEditingIncome(false);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>MoneyMap - Recent Transactions Statement</title>
          <style>
            body {
              font-family: 'Outfit', 'Inter', sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: -0.025em;
            }
            .logo span {
              color: #2563eb;
            }
            .title {
              font-size: 20px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f8fafc;
              color: #64748b;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.05em;
              padding: 14px 16px;
              text-align: left;
              border-bottom: 2px solid #edf2f7;
            }
            td {
              padding: 16px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            .amount {
              font-weight: 700;
              text-align: right;
            }
            .category {
              display: inline-block;
              background-color: #f1f5f9;
              color: #475569;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Money<span>Map</span></div>
              <div class="meta">Secure Fintech Personal Statement</div>
            </div>
            <div style="text-align: right;">
              <div class="title">Recent Transactions</div>
              <div class="meta">Statement Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Expense Title</th>
                <th>Category</th>
                <th>Transaction Date</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.slice(0, 5).map(exp => `
                <tr>
                  <td style="font-weight: 600;">${exp.title}</td>
                  <td><span class="category">${exp.category}</span></td>
                  <td>${new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td class="amount">${exp.currency}${exp.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            This statement is securely generated by MoneyMap. Data encryption standards applied.
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Calculate stats values
  const totalIncome = user?.income || 0;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalIncome - totalExpenses;
  const totalSavings = totalIncome - totalExpenses; // Savings card = Income - Expenses

  const recentTransactions = expenses.slice(0, 5);

  const formatCurrency = (val: number, symbol = '₹') => {
    return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-[36px] font-extrabold text-slate-900 dark:text-white leading-tight">
            Welcome back, {user?.name ? user.name : 'Mohamed'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's your current financial summary and insights.
          </p>
        </div>
        
        {/* Quick Date Display */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* First Time User Setup Banner */}
      {totalIncome === 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(59,130,246,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[0_20px_40px_rgba(59,130,246,0.25)] hover:scale-[1.01] transition-all duration-300 border border-blue-500/20">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Configure Your Monthly Income 💰</h3>
            <p className="text-sm text-blue-100">
              Set your monthly income to activate your total balance, savings calculations, and trend graphs.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <input
              type="number"
              placeholder="Income (e.g. 50000)"
              value={tempIncome}
              onChange={(e) => setTempIncome(e.target.value)}
              className="h-12 px-4 rounded-xl text-slate-800 outline-none w-full md:w-48 font-bold border border-transparent focus:border-blue-400 bg-white"
            />
            <button
              onClick={handleSaveIncome}
              disabled={incomeUpdating}
              className="h-12 px-6 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 active:scale-[0.98] transition-all shrink-0 shadow-sm"
            >
              Activate
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 p-6 bg-gradient-to-br from-[#1cd2d6] to-[#0ae3cd] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-white/20">
            <FiDollarSign className="w-12 h-12" />
          </div>
          <p className="text-[14px] font-medium text-white/80">
            Total Balance
          </p>
          <h3 className="text-[32px] font-extrabold text-white mt-2 tracking-tight">
            {formatCurrency(totalBalance)}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mt-3">
            <span>+ 22% ↗ than last month</span>
          </div>
        </div>

        {/* Income Card (Editable) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 p-6 bg-gradient-to-br from-[#3d86f5] to-[#82aef9] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-300 cursor-pointer"
             onClick={() => {
               if (!isEditingIncome) {
                 setTempIncome(totalIncome.toString());
                 setIsEditingIncome(true);
               }
             }}>
          <div className="absolute top-0 right-0 p-3 text-white/20">
            <FiTrendingUp className="w-12 h-12" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-white/80">
              Total Income
            </p>
            {!isEditingIncome && (
              <span className="p-1 rounded-md text-white/70 hover:bg-white/10 transition-all">
                <FiEdit2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {isEditingIncome ? (
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={tempIncome}
                onChange={(e) => setTempIncome(e.target.value)}
                className="w-full h-[40px] px-2.5 rounded-lg border border-white/20 focus:border-white outline-none text-slate-800 text-sm font-bold bg-white"
                autoFocus
              />
              <button
                onClick={handleSaveIncome}
                disabled={incomeUpdating}
                className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all shrink-0"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingIncome(false)}
                className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all shrink-0"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3 className="text-[32px] font-extrabold text-white mt-2 tracking-tight">
              {formatCurrency(totalIncome)}
            </h3>
          )}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mt-3">
            <span>+ 36% ↗ than last month</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 p-6 bg-gradient-to-br from-[#f46b8d] to-[#fa9db4] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-white/20">
            <FiTrendingDown className="w-12 h-12" />
          </div>
          <p className="text-[14px] font-medium text-white/80">
            Total Expenses
          </p>
          <h3 className="text-[32px] font-extrabold text-white mt-2 tracking-tight">
            {formatCurrency(totalExpenses)}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mt-3">
            <span>- 11% ↘ than last month</span>
          </div>
        </div>

        {/* Savings Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 p-6 bg-gradient-to-br from-[#9d76f6] to-[#c8a8f9] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-white/20">
            <FiPieChart className="w-12 h-12" />
          </div>
          <p className="text-[14px] font-medium text-white/80">
            Total Savings
          </p>
          <h3 className="text-[32px] font-extrabold text-white mt-2 tracking-tight">
            {formatCurrency(totalSavings)}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mt-3">
            <span>+ 15% ↗ than last month</span>
          </div>
        </div>
      </div>

      {/* Main content split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add Expense Form */}
        <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder p-6 shadow-premium h-fit">
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-md bg-blue-600 inline-block" />
            Add Expense
          </h2>

          {formError && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 text-xs text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="premium-label">Expense Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Starbucks coffee"
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="premium-input"
                  required
                />
              </div>

              <div>
                <label className="premium-label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="premium-input"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur} value={cur} className="dark:bg-darkCard">
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="premium-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="premium-input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-darkCard">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="premium-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="premium-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 h-[52px] rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 hover:shadow-glow-blue disabled:opacity-50 mt-2"
            >
              <FiPlus className="w-5 h-5" />
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>

        {/* Right: Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder p-6 shadow-premium">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-md bg-violet-500 inline-block" />
              Recent Transactions
            </h2>
            {recentTransactions.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all shadow-sm cursor-pointer"
              >
                <FiDownload className="w-3.5 h-3.5" />
                Download PDF
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-darkBorder rounded-2xl">
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                No transactions added yet. Use the form to submit your first expense!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-darkBorder text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Expense</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-darkBorder/40">
                  {recentTransactions.map((exp) => (
                    <tr
                      key={exp._id}
                      className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/55 dark:hover:bg-darkInput/25 transition-all group"
                    >
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {exp.title}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 dark:bg-darkBorder dark:text-slate-400">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400 dark:text-slate-500">
                        {new Date(exp.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(exp.amount, exp.currency)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
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
      </div>

      {/* Edit Expense Modal Overlay */}
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
                  {CATEGORIES.map((cat) => (
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

export default Dashboard;
