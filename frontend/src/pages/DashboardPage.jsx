import React, { useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useSummary, useByCategory } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#d97706', '#059669', '#0284c7', '#6d28d9', '#be185d', '#047857'];

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const [range, setRange] = useState({
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
  });

  const { data: summary, isLoading: sumLoading } = useSummary(range);
  const { data: byCat, isLoading: catLoading } = useByCategory({ ...range, type: 'expense' });

  const expenseData = (byCat || []).map((r) => ({ name: r.categoryName, value: r.total }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            Welcome back, {user?.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <input
              type="date"
              value={range.startDate}
              onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))}
              style={{ width: 'auto' }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <div className="form-group" style={{ margin: 0 }}>
            <input
              type="date"
              value={range.endDate}
              onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))}
              style={{ width: 'auto' }}
            />
          </div>
        </div>
      </div>

      {sumLoading ? (
        <div className="loading">Loading summary...</div>
      ) : (
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-title">Total Income</div>
            <div className="card-value income">{fmt(summary?.totalIncome || 0)}</div>
          </div>
          <div className="card">
            <div className="card-title">Total Expenses</div>
            <div className="card-value expense">{fmt(summary?.totalExpense || 0)}</div>
          </div>
          <div className="card">
            <div className="card-title">Net Balance</div>
            <div className={`card-value ${(summary?.netBalance || 0) >= 0 ? 'income' : 'expense'}`}>
              {fmt(summary?.netBalance || 0)}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Expenses by Category</div>
          {catLoading ? (
            <div className="loading">Loading chart...</div>
          ) : expenseData.length === 0 ? (
            <div className="empty">No expense data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Top Expenses</div>
          {catLoading ? (
            <div className="loading">Loading chart...</div>
          ) : expenseData.length === 0 ? (
            <div className="empty">No expense data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={expenseData.slice(0, 7)} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
