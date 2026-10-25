import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { User, Shield, Info, LogOut, CheckCircle, Database, Server, Laptop } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Profile Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h2 className="card-title">Your profile</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account information</span>
            </div>
          </div>
          <span className="badge badge-completed" style={{ fontSize: '0.75rem' }}>
            <Shield size={12} />
            Active Session
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Full Name
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              {user?.name || 'Administrator'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Email Address
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
              {user?.email || 'admin@taskora.local'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Access Role
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-600)', marginTop: '2px' }}>
              Personal account
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="btn btn-danger"
          >
            <LogOut size={16} />
            <span>Sign Out of Taskora</span>
          </button>
        </div>
      </div>

      {/* Application & Stack Information */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Info size={20} />
            </div>
            <div>
              <h2 className="card-title">System & Stack Information</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MERN Architecture Details</span>
            </div>
          </div>
          <span className="badge badge-priority-medium">v1.0 Production Ready</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <Laptop size={18} style={{ color: 'var(--primary-600)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Frontend Framework</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>React 18 + TypeScript + Vite + Vanilla CSS Design System</div>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Port 5173</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <Server size={18} style={{ color: '#0284c7' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Backend REST API</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Node.js + Express.js + JWT Authentication + bcryptjs</div>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Port 5000</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <Database size={18} style={{ color: '#059669' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Database Layer</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MongoDB with Mongoose ODM schemas & validation</div>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MongoDB</span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>Your task list is private to your account and protected by sign-in.</span>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of your Taskora session? Any unsaved changes will be lost."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
};
