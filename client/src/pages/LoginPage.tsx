import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isRegistering && !name.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setIsLoading(true);
    try {
      if (isRegistering) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unable to continue. Check your details and try again.');
    } finally { setIsLoading(false); }
  };

  return <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
    <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2.5rem 2rem', borderRadius: 16, boxShadow: '0 20px 40px -15px rgba(0,0,0,.4)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><CheckSquare size={28} /></div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Taskora</h1>
        <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>A calmer way to plan your day</p>
      </div>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '.25rem' }}>{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: '1.25rem' }}>{isRegistering ? 'Your tasks stay private to your account.' : 'Sign in to see what needs your attention.'}</p>
      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}><AlertCircle size={17} /><span>{error}</span></div>}
      <form onSubmit={handleSubmit}>
        {isRegistering && <div className="form-group"><label className="form-label" htmlFor="name">Your name</label><div style={{ position: 'relative' }}><User size={16} style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input id="name" autoComplete="name" className="form-control" placeholder="Alex Morgan" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '2.5rem' }} required /></div></div>}
        <div className="form-group"><label className="form-label" htmlFor="email">Email</label><div style={{ position: 'relative' }}><Mail size={16} style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input id="email" type="email" autoComplete="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '2.5rem' }} required /></div></div>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}><label className="form-label" htmlFor="password">Password</label><div style={{ position: 'relative' }}><Lock size={16} style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegistering ? 'new-password' : 'current-password'} className="form-control" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', border: 0, background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '.75rem', fontSize: '.95rem' }} disabled={isLoading}>{isLoading ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>{isRegistering ? 'Already have an account?' : 'New to Taskora?'}{' '}<button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} style={{ border: 0, padding: 0, background: 'none', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}>{isRegistering ? 'Sign in' : 'Create an account'}</button></p>
    </div>
  </div>;
};
