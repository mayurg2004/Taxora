import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  PlusCircle, 
  BookOpen, 
  Settings, 
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogoutClick }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="brand-name">Taskora</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Assignment Tracker</div>
          </div>
          <span className="brand-tag">v1.0</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-heading">Overview</span>
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <span className="nav-heading" style={{ marginTop: '0.75rem' }}>Management</span>
          <NavLink
            to="/assignments"
            end
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={18} />
            <span>All Assignments</span>
          </NavLink>

          <NavLink
            to="/assignments/new"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            <span>Add Assignment</span>
          </NavLink>

          <NavLink
            to="/subjects"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Subjects</span>
          </NavLink>

          <span className="nav-heading" style={{ marginTop: '0.75rem' }}>System</span>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Administrator'}</div>
              <div className="user-role">{user?.email || 'admin@taskora.local'}</div>
            </div>
          </div>

          <button
            onClick={onLogoutClick}
            className="btn btn-ghost"
            style={{
              justifyContent: 'flex-start',
              color: '#94a3b8',
              fontSize: '0.8rem',
              padding: '0.5rem 0.6rem',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
