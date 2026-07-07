import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface ExpenseType {
  _id: string;
  title: string;
  amount: number;
  category: string;
  currency: string;
  date: string;
}

const COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Rose
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F97316', // Orange
];

const Statistics: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchExpenses();
  }, []);

  const [selectedMonth, setSelectedMonth] = useState('All');

  useEffect(() => {
    if (expenses.length > 0) {
      // Find the latest transaction's month to set as default filter
      const latestExp = expenses.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      }, expenses[0]);
      
      const latestMonthStr = new Date(latestExp.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      setSelectedMonth(latestMonthStr);
    }
  }, [expenses]);

  // Get unique months from expenses to populate the filter dropdown
  const getAvailableMonths = () => {
    const months = new Set<string>();
    expenses.forEach((exp) => {
      const dateObj = new Date(exp.date);
      const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.add(monthStr);
    });
    return Array.from(months).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  // 1. Data Prep: Category Distribution (Pie Chart)
  const getCategoryData = (monthFilter: string) => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      const dateObj = new Date(exp.date);
      const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (monthFilter === 'All' || monthStr === monthFilter) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    });

    return Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      value: Math.round(categoryTotals[cat] * 100) / 100,
    }));
  };

  // 2. Data Prep: Monthly or Daily Spending (Bar Chart)
  const getMonthlyData = (monthFilter: string) => {
    if (expenses.length === 0) return [];
    
    if (monthFilter === 'All') {
      // Find oldest and newest transaction dates
      const dates = expenses.map(e => new Date(e.date).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      // Loop through every month between minDate and maxDate
      const monthlyTotals: Record<string, number> = {};
      let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      
      while (current <= end) {
        const monthStr = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyTotals[monthStr] = 0;
        current.setMonth(current.getMonth() + 1);
      }
      
      // Aggregate expenses
      expenses.forEach((exp) => {
        const dateObj = new Date(exp.date);
        const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyTotals[monthStr] !== undefined) {
          monthlyTotals[monthStr] += exp.amount;
        } else {
          monthlyTotals[monthStr] = exp.amount;
        }
      });

      return Object.keys(monthlyTotals)
        .map((m) => ({
          month: m,
          amount: Math.round(monthlyTotals[m] * 100) / 100,
          time: new Date(m).getTime(),
        }))
        .sort((a, b) => a.time - b.time);
    } else {
      // Filter expenses by the selected month
      const targetExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        const mStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return mStr === monthFilter;
      });

      if (targetExpenses.length === 0) return [];

      const representativeDate = new Date(targetExpenses[0].date);
      const year = representativeDate.getFullYear();
      const month = representativeDate.getMonth();

      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Initialize daily totals for all days of the month
      const dailyTotals: Record<string, number> = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        dailyTotals[dayStr] = 0;
      }

      // Aggregate
      targetExpenses.forEach(exp => {
        const dayStr = new Date(exp.date).getDate().toString().padStart(2, '0');
        dailyTotals[dayStr] = (dailyTotals[dayStr] || 0) + exp.amount;
      });

      return Object.keys(dailyTotals)
        .map(d => ({
          month: d, // 'month' as recharts dataKey
          amount: Math.round(dailyTotals[d] * 100) / 100,
          time: parseInt(d),
        }))
        .sort((a, b) => a.time - b.time);
    }
  };

  // 3. Data Prep: Expense Trend (Line Chart)
  const getTrendData = (monthFilter: string) => {
    const dailyTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      const dateObj = new Date(exp.date);
      const mStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (monthFilter === 'All' || mStr === monthFilter) {
        const dateStr = dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + exp.amount;
      }
    });

    return Object.keys(dailyTotals)
      .map((d) => ({
        date: d,
        amount: Math.round(dailyTotals[d] * 100) / 100,
        time: new Date(d).getTime(),
      }))
      .sort((a, b) => a.time - b.time);
  };

  const categoryData = getCategoryData(selectedMonth);
  const monthlyData = getMonthlyData(selectedMonth);
  const trendData = getTrendData(selectedMonth);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-[36px] font-extrabold text-slate-900 dark:text-white leading-tight">
            Financial Statistics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detailed trends and analysis derived from your historical records.
          </p>
        </div>
        
        {expenses.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filter Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="premium-input !h-[46px] !px-4 text-sm w-44 font-bold shadow-sm border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard cursor-pointer"
            >
              <option value="All">All Months</option>
              {getAvailableMonths().map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Crunching spending metrics...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-100 dark:border-darkBorder rounded-2xl bg-white dark:bg-darkCard">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            No transactions found. Add expenses to view visual trends and graphs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pie Chart: Category Distribution */}
          <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder p-6 shadow-premium flex flex-col justify-between">
            <div className="mb-6">
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-md bg-emerald-500 inline-block" />
                Category Distribution
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Weight of expenses for the selected period
              </p>
            </div>
            
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                    formatter={(value) => [`₹${value}`, 'Spent']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Monthly Spending */}
          <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder p-6 shadow-premium flex flex-col justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-md bg-blue-500 inline-block" />
                {selectedMonth === 'All' ? 'Monthly Spending' : `Daily Spending (${selectedMonth})`}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                {selectedMonth === 'All' ? 'Monthly aggregate expenditures compared side-by-side' : `Day-by-day spending distribution for ${selectedMonth}`}
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" className="hidden dark:block" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94A3B8' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94A3B8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`₹${value}`, 'Spent']}
                  />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart: Expense Trend */}
          <div className="lg:col-span-2 bg-white dark:bg-darkCard rounded-2xl border border-slate-100 dark:border-darkBorder p-6 shadow-premium">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-md bg-violet-500 inline-block" />
                Expense Trend
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                Daily spending spikes and baseline costs timeline
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" className="hidden dark:block" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94A3B8' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`₹${value}`, 'Spent']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#8B5CF6' }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
