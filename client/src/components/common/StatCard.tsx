import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'warning' | 'success' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  variant = 'primary',
}) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${variant}`}>
        {icon}
      </div>
    </div>
  );
};
