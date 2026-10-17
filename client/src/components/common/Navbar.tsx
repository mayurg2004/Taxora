import React from 'react';
import { Menu, Plus, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();

  // Determine current page title from pathname
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', subtitle: 'Academic Overview & Metrics' };
    if (path === '/assignments') return { title: 'Assignments', subtitle: 'Manage & Track Coursework' };
    if (path === '/assignments/new') return { title: 'Add Assignment', subtitle: 'Record New Coursework' };
    if (path.startsWith('/assignments/') && path.endsWith('/edit')) return { title: 'Edit Assignment', subtitle: 'Update Assignment Details' };
    if (path.startsWith('/assignments/')) return { title: 'Assignment Details', subtitle: 'Full Assignment Information' };
    if (path === '/subjects') return { title: 'Subjects', subtitle: 'Manage Academic Subjects' };
    if (path === '/settings') return { title: 'Settings', subtitle: 'Account & Application Info' };
    return { title: 'Taskora', subtitle: 'Student Assignment Tracker' };
  };

  const { title, subtitle } = getPageInfo();

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <div className="page-title-header">
          <h1 className="page-title">{title}</h1>
          <span className="page-breadcrumb">{subtitle}</span>
        </div>
      </div>

      <div className="navbar-right">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            padding: '0.4rem 0.75rem',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Calendar size={14} />
          <span>{todayFormatted}</span>
        </div>

        {location.pathname !== '/assignments/new' && (
          <Link to="/assignments/new" className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>New Assignment</span>
          </Link>
        )}
      </div>
    </header>
  );
};
