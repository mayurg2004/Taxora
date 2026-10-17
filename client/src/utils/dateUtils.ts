// ============================================================================
// DATE HANDLING UTILITIES
// Consistent date formatting and deadline calculations
// ============================================================================

/**
 * Checks if a given due date is overdue.
 * An assignment is overdue only if current time is past due date and status is not Completed.
 */
export function isAssignmentOverdue(dueDateString: string, status: string): boolean {
  if (status === 'Completed') return false;
  const dueDate = new Date(dueDateString);
  return new Date() > dueDate;
}

/**
 * Formats an ISO date string into a clean, human-readable date.
 * Example: 'Oct 24, 2026'
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats an ISO date string into input date value 'YYYY-MM-DD'
 * for HTML5 `<input type="date">`.
 */
export function toInputDateFormat(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Formats relative deadline description:
 * e.g., "Due today", "Due tomorrow", "Due in 3 days", "Overdue by 2 days"
 */
export function getRelativeDeadline(dueDateString: string, status: string): { text: string; isOverdue: boolean } {
  if (status === 'Completed') {
    return { text: 'Completed', isOverdue: false };
  }

  const now = new Date();
  const due = new Date(dueDateString);
  
  // Strip time for clean day comparison
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffTime = dueDateOnly.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      text: daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`,
      isOverdue: true,
    };
  } else if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false };
  } else {
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  }
}
