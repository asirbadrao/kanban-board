import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const LABELS = ['bug', 'feature', 'improvement', 'docs', 'design', 'testing'];

const LABEL_COLORS = {
  bug: '#ef4444',
  feature: '#6366f1',
  improvement: '#10b981',
  docs: '#0ea5e9',
  design: '#a855f7',
  testing: '#f59e0b',
};

const TaskModal = ({ task, listId, boardId, members, onClose, onSaved, onDeleted }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assigneeId: task?.assignee?._id || '',
    labels: task?.labels || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleLabel = (label) => {
    setForm((f) => ({
      ...f,
      labels: f.labels.includes(label)
        ? f.labels.filter((l) => l !== label)
        : [...f.labels, label],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Task title is required');
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.patch(`/tasks/${task._id}`, {
          ...form,
          assigneeId: form.assigneeId || null,
          dueDate: form.dueDate || null,
        });
      } else {
        res = await api.post('/tasks', {
          ...form,
          listId,
          boardId,
          assigneeId: form.assigneeId || null,
          dueDate: form.dueDate || null,
        });
      }
      onSaved(res.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDeleted(task._id);
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Task' : 'Create Task'}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEdit && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              className="form-input"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={1000}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                className="form-input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Assignee</label>
            <select
              className="form-input"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>
                  {m.user?.name} ({m.user?.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Labels</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LABELS.map((label) => {
                const active = form.labels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1.5px solid ${LABEL_COLORS[label]}`,
                      background: active ? LABEL_COLORS[label] : 'transparent',
                      color: active ? 'white' : LABEL_COLORS[label],
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
