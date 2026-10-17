import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirection target after login
  const from = (location.state as any)?.from?.pathname || '/';

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrors({
        general: err.message || 'Invalid email or password. Please verify your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#ffffff',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
              marginBottom: '1rem',
            }}
          >
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Taskora
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Student Assignment Tracker — Administrator Portal
          </p>
        </div>

        {/* Error notification */}
        {errors.general && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="admin@taskora.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
            {errors.email && (
              <span className="form-error">
                <AlertCircle size={12} />
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">
                <AlertCircle size={12} />
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Taskora'}
          </button>
        </form>

        {/* Viva / Dev Helper Information Box */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '0.85rem 1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'flex-start',
          }}
        >
          <Info size={16} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Development Seed Administrator:</strong>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Email: <code>admin@taskora.local</code>
              <br />
              Password: <code>AdminTaskora123!</code>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Configured via environment variables and seeded during database init.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
