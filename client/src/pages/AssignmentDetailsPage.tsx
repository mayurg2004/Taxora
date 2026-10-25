import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Assignment } from '../types';
import { assignmentsApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { isAssignmentOverdue, getRelativeDeadline, formatDate } from '../utils/dateUtils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const AssignmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssignment = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assignmentsApi.getById(id);
      setAssignment(res.assignment);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!assignment) return;
    const nextStatus = assignment.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await assignmentsApi.updateStatus(assignment._id, nextStatus);
      setAssignment(res.assignment);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!assignment) return;
    setIsDeleting(true);
    try {
      await assignmentsApi.delete(assignment._id);
      navigate('/assignments');
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching assignment details..." />;
  }

  if (error || !assignment) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <ErrorMessage message={error || 'Assignment not found.'} onRetry={fetchAssignment} />
        <button onClick={() => navigate('/assignments')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Assignments
        </button>
      </div>
    );
  }

  const overdue = isAssignmentOverdue(assignment.dueDate, assignment.status);
  const relativeDeadline = getRelativeDeadline(assignment.dueDate, assignment.status);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Navigation header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/assignments')}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft size={16} />
            <span>My tasks</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleToggleStatus}
            className={`btn btn-sm ${assignment.status === 'Completed' ? 'btn-secondary' : 'btn-primary'}`}
          >
            <CheckCircle2 size={15} />
            <span>{assignment.status === 'Completed' ? 'Reopen task' : 'Mark done'}</span>
          </button>

          <Link
            to={`/assignments/${assignment._id}/edit`}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={15} />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Overdue alert banner if overdue */}
      {overdue && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={20} />
          <div>
            <strong>This task is overdue.</strong> It was due {formatDate(assignment.dueDate)}.
          </div>
        </div>
      )}

      {/* Main Details Card */}
      <div className="card">
        {/* Badges & Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="badge badge-subject" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>
            <BookOpen size={13} style={{ marginRight: '4px' }} />
            {assignment.subject}
          </span>
          <PriorityBadge priority={assignment.priority} />
          <StatusBadge status={assignment.status} isOverdue={overdue} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.3 }}>
          {assignment.title}
        </h1>

        {/* Metadata info grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
              Due date and time
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: overdue ? '#dc2626' : 'var(--text-main)', fontSize: '0.95rem' }}>
              <Calendar size={16} />
              <span>{formatDate(assignment.dueDate)}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: overdue ? '#dc2626' : 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              {relativeDeadline.text}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
              Current Status
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {assignment.status}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
              Recorded On
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              <span>{formatDate(assignment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} />
          <span>Task notes</span>
          </h3>

          {assignment.description ? (
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {assignment.description}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
              No notes added to this task.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete task"
        message={`Are you sure you want to permanently delete "${assignment.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
