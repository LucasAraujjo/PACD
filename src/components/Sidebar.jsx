import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">PACD</h2>
          <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.username || 'Usuário'}</p>
            <p className="sidebar-user-role">Administrador</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => handleNavigate('/minhas-atividades')}
            className={`sidebar-nav-item ${isActive('/minhas-atividades') ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">📋</span>
            <span>Minhas Atividades</span>
          </button>
          <button
            onClick={() => handleNavigate('/nova-atividade')}
            className={`sidebar-nav-item ${isActive('/nova-atividade') ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">📝</span>
            <span>Nova Atividade</span>
          </button>
          <button className="sidebar-nav-item disabled" disabled>
            <span className="sidebar-nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="sidebar-nav-item disabled" disabled>
            <span className="sidebar-nav-icon">📈</span>
            <span>Relatórios</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-nav-icon">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
