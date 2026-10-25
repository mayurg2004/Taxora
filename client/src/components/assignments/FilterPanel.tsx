import React from 'react';
import { Subject } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (sub: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  subjects,
  selectedSubject,
  onSubjectChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  onClearFilters,
  isFiltered,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
        <Filter size={15} />
        <span>FILTERS:</span>
      </div>

      {/* Subject Filter */}
      <select
        className="form-control"
        value={selectedSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
        style={{ width: 'auto', minWidth: '140px', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
      >
        <option value="all">All categories</option>
        {subjects.map((sub) => (
          <option key={sub._id} value={sub.name}>
            {sub.name}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        className="form-control"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ width: 'auto', minWidth: '130px', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
      >
        <option value="all">All task states</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Priority Filter */}
      <select
        className="form-control"
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        style={{ width: 'auto', minWidth: '130px', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
      >
        <option value="all">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      {/* Sort Option */}
      <select
        className="form-control"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={{ width: 'auto', minWidth: '150px', fontSize: '0.85rem', padding: '0.45rem 0.75rem', marginLeft: 'auto' }}
      >
        <option value="dueDate_asc">Sort: Due Date (Earliest)</option>
        <option value="dueDate_desc">Sort: Due Date (Latest)</option>
        <option value="title_asc">Sort: Title (A - Z)</option>
        <option value="title_desc">Sort: Title (Z - A)</option>
        <option value="priority_desc">Sort: Priority (High to Low)</option>
        <option value="createdAt_desc">Sort: Newest First</option>
      </select>

      {/* Reset / Clear Button */}
      {isFiltered && (
        <button
          onClick={onClearFilters}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
          title="Reset all filters"
        >
          <RotateCcw size={13} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};
