import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { isAssignmentOverdue, getRelativeDeadline, formatDate } from '../utils/dateUtils';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating dashboard statistics..." />;
  }

  if (error || !stats) {
    return <ErrorMessage message={error || 'Unable to retrieve statistics.'} onRetry={fetchStats} />;
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* A. Welcome Section */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', color: '#c7d2fe' }}>
            <Sparkles size={12} />
            <span>Your personal task planner</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Welcome back, {user?.name || 'there'}! 👋
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#c7d2fe', maxWidth: '580px', lineHeight: 1.5 }}>
            Today is <strong>{currentDateFormatted}</strong>. You have <strong>{stats.pending + stats.inProgress} tasks left</strong>, including <strong>{stats.overdue} overdue</strong> that need attention.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/assignments"
            className="btn"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* B. Summary Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Key Metrics
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time database statistics</span>
        </div>

        <div className="stats-grid">
          <StatCard
            label="All tasks"
            value={stats.total}
            subtitle="Everything on your list"
            icon={<CheckSquare size={22} />}
            variant="primary"
          />
          <StatCard
            label="Tasks left"
            value={stats.pending + stats.inProgress}
            subtitle={`${stats.pending} not started · ${stats.inProgress} in progress`}
            icon={<Clock size={22} />}
            variant="warning"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            subtitle="Done and checked off"
            icon={<CheckCircle2 size={22} />}
            variant="success"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            subtitle={stats.overdue > 0 ? 'Requires immediate action' : 'Great! Nothing overdue'}
            icon={<AlertTriangle size={22} />}
            variant={stats.overdue > 0 ? 'danger' : 'primary'}
          />
        </div>
      </div>

      {/* E. Progress Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Your progress
            </h3>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {stats.completed} of {stats.total} tasks completed
            </span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600)' }}>
            {stats.completionPercentage}%
          </span>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Grid: Upcoming Deadlines (C) & Recent Assignments (D) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* C. Upcoming Deadlines */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Coming up</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overdue tasks first, then what is due soon</span>
            </div>
            <Link to="/assignments" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-600)', fontSize: '0.8rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {stats.upcomingDeadlines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No upcoming tasks. Enjoy the breathing room.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.upcomingDeadlines.map((item) => {
                const overdue = isAssignmentOverdue(item.dueDate, item.status);
                const relative = getRelativeDeadline(item.dueDate, item.status);
                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: overdue ? '#fff5f5' : '#fafafa',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Link
                        to={`/assignments/${item._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'var(--text-main)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span className="badge badge-subject" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                          {item.subject}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: overdue ? '#dc2626' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          {formatDate(item.dueDate)} ({relative.text})
                        </span>
                      </div>
                    </div>
                    {overdue && <StatusBadge status={item.status} isOverdue />}
                    <PriorityBadge priority={item.priority} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* D. Recent Assignments */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Activity</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recently added to your list</span>
            </div>
            <Link to="/assignments" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-600)', fontSize: '0.8rem' }}>
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {stats.recentAssignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No tasks yet. Add your first to-do to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentAssignments.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link
                      to={`/assignments/${item._id}`}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span className="badge badge-subject" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                        {item.subject}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Due {formatDate(item.dueDate)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} isOverdue={isAssignmentOverdue(item.dueDate, item.status)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
