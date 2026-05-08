import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-text">Kanban</span>
        </Link>

        {user && (
          <div className="navbar-right">
            <div className="user-info">
              <img src={user.avatar} alt={user.name} className="avatar" width={32} height={32} />
              <span className="user-name">{user.name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
