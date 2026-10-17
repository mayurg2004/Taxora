import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { subjectsApi } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { BookOpen, Plus, Edit2, Trash2, AlertCircle, X } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Subject Modal state for Add/Edit
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    name: string;
    code: string;
    description: string;
    error?: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    isEditing: false,
    name: '',
    code: '',
    description: '',
    isSubmitting: false,
  });

  // Delete modal state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    assignmentCount: number;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: '',
    name: '',
    assignmentCount: 0,
    isDeleting: false,
  });

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subjectsApi.getAll();
      setSubjects(res.subjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setModalState({
      isOpen: true,
      isEditing: false,
      name: '',
      code: '',
      description: '',
      isSubmitting: false,
    });
  };

  const handleOpenEdit = (subject: Subject) => {
    setModalState({
      isOpen: true,
      isEditing: true,
      id: subject._id,
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      isSubmitting: false,
    });
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState.name.trim()) {
      setModalState((prev) => ({ ...prev, error: 'Subject name is required.' }));
      return;
    }

    setModalState((prev) => ({ ...prev, isSubmitting: true, error: undefined }));

    try {
      if (modalState.isEditing && modalState.id) {
        const res = await subjectsApi.update(modalState.id, {
          name: modalState.name.trim(),
          code: modalState.code.trim(),
          description: modalState.description.trim(),
        });
        setSubjects((prev) =>
          prev.map((s) => (s._id === modalState.id ? res.subject : s))
        );
      } else {
        const res = await subjectsApi.create({
          name: modalState.name.trim(),
          code: modalState.code.trim(),
          description: modalState.description.trim(),
        });
        setSubjects((prev) => [...prev, res.subject]);
      }
      setModalState((prev) => ({ ...prev, isOpen: false, isSubmitting: false }));
    } catch (err: any) {
      setModalState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err.message || 'Failed to save subject.',
      }));
    }
  };

  const handleOpenDelete = (subject: Subject) => {
    setDeleteDialog({
      isOpen: true,
      id: subject._id,
      name: subject.name,
      assignmentCount: subject.assignmentCount || 0,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    try {
      await subjectsApi.delete(deleteDialog.id);
      setSubjects((prev) => prev.filter((s) => s._id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: '', name: '', assignmentCount: 0, isDeleting: false });
    } catch (err: any) {
      alert(err.message || 'Could not delete subject.');
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading academic subjects..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSubjects} />;
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Academic Subjects
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Organize coursework by curriculum subject or module
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subject cards grid */}
      {subjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BookOpen size={28} />
          </div>
          <h3 className="empty-state-title">No subjects defined yet</h3>
          <p className="empty-state-desc">
            Create your university or engineering subjects to start categorizing assignments.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Create First Subject</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {sub.name}
                      </h3>
                      {sub.code && (
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {sub.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="btn btn-ghost btn-sm"
                      title="Edit Subject"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(sub)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#dc2626' }}
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {sub.description && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
                    {sub.description}
                  </p>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Assignments:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: (sub.assignmentCount || 0) > 0 ? 'var(--primary-600)' : 'var(--text-muted)',
                    background: (sub.assignmentCount || 0) > 0 ? 'var(--primary-50)' : 'var(--bg-main)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {sub.assignmentCount || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalState.isOpen && (
        <div className="modal-backdrop" onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                {modalState.isEditing ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {modalState.error && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{modalState.error}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubject}>
              <div className="form-group">
                <label className="form-label">
                  Subject Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Web Technologies"
                  value={modalState.name}
                  onChange={(e) => setModalState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Code / Short Code (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., IT-402"
                  value={modalState.code}
                  onChange={(e) => setModalState((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="Brief notes about course objectives, professor, or lab venue..."
                  rows={3}
                  value={modalState.description}
                  onChange={(e) => setModalState((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                  disabled={modalState.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalState.isSubmitting}
                >
                  {modalState.isSubmitting ? 'Saving...' : modalState.isEditing ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Subject"
        message={
          deleteDialog.assignmentCount > 0
            ? `Cannot delete "${deleteDialog.name}" because it currently has ${deleteDialog.assignmentCount} associated assignment(s). Please reassign or delete those assignments first.`
            : `Are you sure you want to delete the subject "${deleteDialog.name}"?`
        }
        confirmLabel={deleteDialog.assignmentCount > 0 ? 'Understood' : 'Delete Subject'}
        cancelLabel="Cancel"
        isDanger={deleteDialog.assignmentCount === 0}
        isLoading={deleteDialog.isDeleting}
        onConfirm={
          deleteDialog.assignmentCount > 0
            ? () => setDeleteDialog({ isOpen: false, id: '', name: '', assignmentCount: 0, isDeleting: false })
            : handleConfirmDelete
        }
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '', assignmentCount: 0, isDeleting: false })}
      />
    </div>
  );
};
