import React from 'react';
import { Link } from 'react-router-dom';
import { Assignment } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { isAssignmentOverdue, getRelativeDeadline, formatDate } from '../../utils/dateUtils';
import { Calendar, CheckCircle2, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onStatusChange,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const overdue = isAssignmentOverdue(assignment.dueDate, assignment.status);
  const relativeDeadline = getRelativeDeadline(assignment.dueDate, assignment.status);

  const handleToggleComplete = () => {
    const nextStatus = assignment.status === 'Completed' ? 'Pending' : 'Completed';
    onStatusChange(assignment._id, nextStatus);
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderLeft: overdue
          ? '4px solid #ef4444'
          : assignment.status === 'Completed'
          ? '4px solid #10b981'
          : '4px solid #6366f1',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span className="badge badge-subject">{assignment.subject}</span>
            <PriorityBadge priority={assignment.priority} />
            <StatusBadge status={assignment.status} isOverdue={overdue} />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
              title="Actions"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 20,
                    minWidth: '140px',
                    padding: '0.35rem 0',
                  }}
                >
                  <Link
                    to={`/assignments/${assignment._id}`}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye size={14} />
                    <span>View task</span>
                  </Link>

                  <Link
                    to={`/assignments/${assignment._id}/edit`}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit2 size={14} />
                    <span>Edit task</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(assignment._id, assignment.title);
                    }}
                    className="btn btn-ghost"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      color: '#dc2626',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <Link
          to={`/assignments/${assignment._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
              lineHeight: 1.3,
            }}
          >
            {assignment.title}
          </h3>
        </Link>

        {assignment.description && (
          <p
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.45,
            }}
          >
            {assignment.description}
          </p>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: overdue ? '#dc2626' : 'var(--text-muted)' }}>
          <Calendar size={13} />
          <span>{formatDate(assignment.dueDate)}</span>
          <span style={{ fontSize: '0.725rem', fontWeight: overdue ? 600 : 400 }}>
            ({relativeDeadline.text})
          </span>
        </div>

        <button
          onClick={handleToggleComplete}
          className={`btn btn-sm ${assignment.status === 'Completed' ? 'btn-secondary' : 'btn-ghost'}`}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            color: assignment.status === 'Completed' ? '#047857' : 'var(--text-muted)',
          }}
          title={assignment.status === 'Completed' ? 'Reopen task' : 'Mark task done'}
        >
          <CheckCircle2 size={14} color={assignment.status === 'Completed' ? '#10b981' : 'currentColor'} />
          <span>{assignment.status === 'Completed' ? 'Done' : 'Mark done'}</span>
        </button>
      </div>
    </div>
  );
};
