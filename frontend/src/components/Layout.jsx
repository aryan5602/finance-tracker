import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-brand">Finance Tracker</div>
        <div className="sidebar-nav">
          <NavLink to="/dashboard">
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/transactions">
            <span>Transactions</span>
          </NavLink>
          <NavLink to="/categories">
            <span>Categories</span>
          </NavLink>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            Logged in as<strong>{user?.name}</strong>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
