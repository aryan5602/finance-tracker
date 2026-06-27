import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const EMPTY_FORM = { categoryId: '', amount: '', type: 'expense', description: '', transactionDate: new Date().toISOString().split('T')[0] };

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', type: '', startDate: '', endDate: '' });
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data?: tx }
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading, isError } = useTransactions(params);
  const { data: categories = [] } = useCategories();

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const transactions = data?.data || [];
  const pagination = data?.pagination || {};

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ mode: 'create' });
  }

  function openEdit(tx) {
    setForm({
      categoryId: tx.categoryId,
      amount: tx.amount,
      type: tx.type,
      description: tx.description || '',
      transactionDate: tx.transactionDate?.split('T')[0] || tx.transactionDate,
    });
    setFormError('');
    setModal({ mode: 'edit', data: tx });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const payload = {
      categoryId: parseInt(form.categoryId),
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description || null,
      transactionDate: form.transactionDate,
    };
    try {
      if (modal.mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({ id: modal.data.id, data: payload });
      }
      setModal(null);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    try { await deleteMutation.mutateAsync(id); } catch {}
  }

  const filteredCategories = form.type ? categories.filter((c) => c.type === form.type) : categories;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Transactions</div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Transaction</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select value={filters.category} onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">From</label>
            <input type="date" value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }} />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input type="date" value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ category: '', type: '', startDate: '', endDate: '' }); setPage(1); }}>
            Clear
          </button>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : isError ? (
          <div className="alert alert-error">Failed to load transactions</div>
        ) : transactions.length === 0 ? (
          <div className="empty">No transactions found</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                    <td>{tx.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{tx.category?.name}</td>
                    <td><span className={`badge badge-${tx.type}`}>{tx.type}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(tx)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tx.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <span>{pagination.total} total</span>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</button>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" form="txn-form" type="submit">
                {modal.mode === 'create' ? 'Add' : 'Save'}
              </button>
            </>
          }
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <form id="txn-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })} required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select category</option>
                {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly rent" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
