import React, { useState } from 'react';
import api from '../../utils/api';

const CreateBoardModal = ({ colors, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', background: colors[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Board title is required');
    setLoading(true);
    try {
      const res = await api.post('/boards', form);
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Board</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Board Title *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Product Roadmap"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              placeholder="What is this board for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={500}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, background: color })}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: color,
                    border: form.background === color ? '3px solid white' : '2px solid transparent',
                    outline: form.background === color ? `2px solid ${color}` : 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
