import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';

const EMPTY_FORM = { name: '', type: 'expense' };

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ mode: 'create' });
  }

  function openEdit(cat) {
    setForm({ name: cat.name, type: cat.type });
    setFormError('');
    setModal({ mode: 'edit', data: cat });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    try {
      if (modal.mode === 'create') {
        await createMutation.mutateAsync(form);
      } else {
        await updateMutation.mutateAsync({ id: modal.data.id, data: form });
      }
      setModal(null);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? This will fail if transactions use it.')) return;
    try { await deleteMutation.mutateAsync(id); } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  }

  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Categories</div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--income)' }}>Income ({income.length})</div>
            {income.length === 0 ? (
              <div className="empty">No income categories</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Name</th><th></th></tr>
                </thead>
                <tbody>
                  {income.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--expense)' }}>Expense ({expense.length})</div>
            {expense.length === 0 ? (
              <div className="empty">No expense categories</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Name</th><th></th></tr>
                </thead>
                <tbody>
                  {expense.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Add Category' : 'Edit Category'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" form="cat-form" type="submit">
                {modal.mode === 'create' ? 'Add' : 'Save'}
              </button>
            </>
          }
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <form id="cat-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Groceries"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
