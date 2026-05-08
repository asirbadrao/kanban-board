import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Layout/Navbar';
import CreateBoardModal from '../components/Board/CreateBoardModal';
import './DashboardPage.css';

const BOARD_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#a855f7', '#ec4899', '#14b8a6',
];

const DashboardPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardCreated = (board) => {
    setBoards([board, ...boards]);
    setShowCreate(false);
    navigate(`/board/${board._id}`);
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2>My Boards</h2>
            <p className="dashboard-sub">
              {boards.length} board{boards.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <span>+</span> New Board
          </button>
        </div>

        {loading ? (
          <div className="boards-loading">
            {[1,2,3].map(i => <div key={i} className="board-skeleton" />)}
          </div>
        ) : boards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <h3>No boards yet</h3>
            <p>Create your first board to start organizing your work</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              Create Board
            </button>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <div
                key={board._id}
                className="board-card"
                onClick={() => navigate(`/board/${board._id}`)}
                style={{ '--board-color': board.background || '#6366f1' }}
              >
                <div className="board-card-bg" />
                <div className="board-card-body">
                  <h3 className="board-card-title">{board.title}</h3>
                  {board.description && (
                    <p className="board-card-desc">{board.description}</p>
                  )}
                </div>
                <div className="board-card-footer">
                  <div className="board-members">
                    {board.members.slice(0, 4).map((m, i) => (
                      <img
                        key={m.user?._id || i}
                        src={m.user?.avatar}
                        alt={m.user?.name}
                        className="avatar member-avatar"
                        width={26}
                        height={26}
                        style={{ zIndex: 4 - i }}
                        title={m.user?.name}
                      />
                    ))}
                    {board.members.length > 4 && (
                      <span className="member-more">+{board.members.length - 4}</span>
                    )}
                  </div>
                  <span className="board-card-role">
                    {board.owner?._id === board.owner?._id ? 'Owner' : 'Member'}
                  </span>
                </div>
              </div>
            ))}

            <button
              className="board-card board-card-new"
              onClick={() => setShowCreate(true)}
            >
              <span className="new-board-plus">+</span>
              <span>Create new board</span>
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateBoardModal
          colors={BOARD_COLORS}
          onClose={() => setShowCreate(false)}
          onCreated={handleBoardCreated}
        />
      )}
    </div>
  );
};

export default DashboardPage;
