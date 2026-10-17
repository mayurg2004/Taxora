import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Assignment, Subject } from '../types';
import { assignmentsApi, subjectsApi } from '../services/api';
import { AssignmentCard } from '../components/assignments/AssignmentCard';
import { SearchBar } from '../components/assignments/SearchBar';
import { FilterPanel } from '../components/assignments/FilterPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { isAssignmentOverdue, formatDate, getRelativeDeadline } from '../utils/dateUtils';
import { Plus, LayoutGrid, List, CheckSquare, Edit2, Trash2, Eye } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View mode: 'grid' cards vs 'table' rows
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Search states
  const [search, setSearch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate_asc');

  // Delete modal confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: '',
    title: '',
    isDeleting: false,
  });

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, subRes] = await Promise.all([
        assignmentsApi.getAll(),
        subjectsApi.getAll(),
      ]);
      setAssignments(assignRes.assignments);
      setSubjects(subRes.subjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle status toggle (e.g. mark completed)
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await assignmentsApi.updateStatus(id, newStatus);
      setAssignments((prev) =>
        prev.map((a) => (a._id === id ? res.assignment : a))
      );
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      id,
      title,
      isDeleting: false,
    });
  };

  // Confirm delete assignment
  const handleConfirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    try {
      await assignmentsApi.delete(deleteDialog.id);
      setAssignments((prev) => prev.filter((a) => a._id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: '', title: '', isDeleting: false });
    } catch (err: any) {
      alert(`Could not delete assignment: ${err.message}`);
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSortBy('dueDate_asc');
  };

  const isFiltered =
    search.trim() !== '' ||
    selectedSubject !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    sortBy !== 'dueDate_asc';

  // Client-side filtering & sorting for instant responsiveness
  const filteredAssignments = useMemo(() => {
    let result = [...assignments];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.subject.toLowerCase().includes(query) ||
          (a.description && a.description.toLowerCase().includes(query))
      );
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      result = result.filter((a) => a.subject === selectedSubject);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((a) => a.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      result = result.filter((a) => a.priority === selectedPriority);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate_asc':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'dueDate_desc':
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'priority_desc': {
          const priorityWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        }
        case 'createdAt_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [assignments, search, selectedSubject, selectedStatus, selectedPriority, sortBy]);

  if (loading) {
    return <LoadingSpinner message="Loading your assignments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div>
      {/* Top action header: Search, view toggle, add button */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <SearchBar value={search} onChange={setSearch} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: 0,
                backgroundColor: viewMode === 'grid' ? '#f1f5f9' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary-600)' : 'var(--text-muted)',
                padding: '0.4rem 0.6rem',
              }}
              title="Grid Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: 0,
                backgroundColor: viewMode === 'table' ? '#f1f5f9' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary-600)' : 'var(--text-muted)',
                padding: '0.4rem 0.6rem',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <Link to="/assignments/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Assignment</span>
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        isFiltered={isFiltered}
      />

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span>
          Showing <strong>{filteredAssignments.length}</strong> of <strong>{assignments.length}</strong> assignments
        </span>
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CheckSquare size={28} />
          </div>
          <h3 className="empty-state-title">
            {assignments.length === 0 ? 'No assignments created yet' : 'No matching assignments found'}
          </h3>
          <p className="empty-state-desc">
            {assignments.length === 0
              ? 'Get started by creating your first assignment deadline for your subjects.'
              : 'Try adjusting your search criteria or clearing selected status and priority filters.'}
          </p>
          {assignments.length === 0 ? (
            <Link to="/assignments/new" className="btn btn-primary">
              <Plus size={16} />
              <span>Create Assignment</span>
            </Link>
          ) : (
            <button onClick={handleClearFilters} className="btn btn-secondary">
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              onStatusChange={handleStatusChange}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a) => {
                const overdue = isAssignmentOverdue(a.dueDate, a.status);
                const relative = getRelativeDeadline(a.dueDate, a.status);
                return (
                  <tr key={a._id}>
                    <td>
                      <Link
                        to={`/assignments/${a._id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'var(--text-main)',
                          fontWeight: 600,
                        }}
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-subject">{a.subject}</span>
                    </td>
                    <td>
                      <div style={{ color: overdue ? '#dc2626' : 'inherit', fontWeight: overdue ? 600 : 400 }}>
                        {formatDate(a.dueDate)}
                        <span style={{ fontSize: '0.75rem', display: 'block', color: overdue ? '#dc2626' : 'var(--text-muted)' }}>
                          {relative.text}
                        </span>
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={a.priority} />
                    </td>
                    <td>
                      <StatusBadge status={a.status} isOverdue={overdue} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <Link
                          to={`/assignments/${a._id}`}
                          className="btn btn-ghost btn-sm"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/assignments/${a._id}/edit`}
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenDelete(a._id, a.title)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#dc2626' }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Assignment"
        message={`Are you sure you want to permanently delete "${deleteDialog.title}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        isDanger={true}
        isLoading={deleteDialog.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', title: '', isDeleting: false })}
      />
    </div>
  );
};
