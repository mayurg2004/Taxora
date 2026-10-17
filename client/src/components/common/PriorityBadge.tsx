import React from 'react';
import { PriorityLevel } from '../../types';
import { ArrowDown, Minus, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'High':
      return (
        <span className="badge badge-priority-high">
          <ArrowUp size={12} />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="badge badge-priority-medium">
          <Minus size={12} />
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="badge badge-priority-low">
          <ArrowDown size={12} />
          Low
        </span>
      );
  }
};
