import React, { useState } from 'react';
import api from '../../utils/api';

const InviteMemberModal = ({ boardId, members, onClose, onInvited }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) return setError('Email is required');
    setLoading(true);
    try {
      const res = await api.post(`/boards/${boardId}/invite`, { email });
      setSuccess(`${email} has been invited!`);
      setEmail('');
      onInvited(res.data.board);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Invite Member</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>

        {members?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Current Members ({members.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map((m) => (
                <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={m.user?.avatar} alt={m.user?.name} className="avatar" width={32} height={32} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user?.email}</div>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: m.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                    color: m.role === 'admin' ? 'var(--primary-light)' : 'var(--text-muted)',
                  }}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteMemberModal;
