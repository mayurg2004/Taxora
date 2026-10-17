import React from 'react';
import { AssignmentStatus } from '../../types';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: AssignmentStatus | string;
  isOverdue?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOverdue }) => {
  if (isOverdue && status !== 'Completed') {
    return (
      <span className="badge badge-overdue">
        <Clock size={12} />
        Overdue
      </span>
    );
  }

  switch (status) {
    case 'Completed':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-in-progress">
          <PlayCircle size={12} />
          In Progress
        </span>
      );
    case 'Pending':
    default:
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          Pending
        </span>
      );
  }
};
