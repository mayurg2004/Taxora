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
  }) + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Formats an ISO date string into input date value 'YYYY-MM-DD'
 * for HTML5 `<input type="date">`.
 */
export function toInputDateFormat(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
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
  
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

  if (diffTime < 0) {
    const hoursAgo = Math.max(1, Math.floor(Math.abs(diffTime) / (1000 * 60 * 60)));
    return {
      text: hoursAgo < 24 ? `Overdue by ${hoursAgo}h` : `Overdue by ${diffDays}d`,
      isOverdue: true,
    };
  } else if (diffDays === 1 && due.toDateString() === now.toDateString()) {
    const minutes = Math.max(1, Math.floor(diffTime / 60000));
    return { text: minutes < 60 ? `Due in ${minutes}m` : `Due in ${Math.floor(minutes / 60)}h`, isOverdue: false };
  } else if (due.toDateString() === now.toDateString()) {
    return { text: 'Due today', isOverdue: false };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false };
  } else {
    return { text: `Due in ${diffDays}d`, isOverdue: false };
  }
}
