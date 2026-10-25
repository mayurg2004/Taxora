// ============================================================================
// DASHBOARD CONTROLLER
// Calculates real-time academic metrics, deadline tracking, and coursework progress
// ============================================================================

import { Assignment } from '../models/Assignment.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard metrics, completion percentage, upcoming deadlines, and recent activity
 * @access  Protected
 */
export async function getDashboardStats(req, res, next) {
  try {
    const now = new Date();

    // 1. Total assignments count
    const userFilter = { user: req.user._id };
    const total = await Assignment.countDocuments(userFilter);

    // 2. Pending assignments count
    const pending = await Assignment.countDocuments({ ...userFilter, status: 'Pending' });

    // 3. In Progress assignments count
    const inProgress = await Assignment.countDocuments({ ...userFilter, status: 'In Progress' });

    // 4. Completed assignments count
    const completed = await Assignment.countDocuments({ ...userFilter, status: 'Completed' });

    // 5. Overdue assignments count:
    // Defined as due date passed (< now) AND status is NOT 'Completed'
    const overdue = await Assignment.countDocuments({
      ...userFilter,
      status: { $ne: 'Completed' },
      dueDate: { $lt: now },
    });

    // 6. Completion percentage calculation:
    // completed / total * 100 (safely handle division by zero)
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 7. Upcoming deadlines:
    // Surface the nearest open work, including overdue items, at the top.
    const upcomingDeadlines = await Assignment.find({
      ...userFilter,
      status: { $in: ['Pending', 'In Progress'] },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    // 8. Recent assignments:
    // Latest 5 assignments added to the system
    const recentAssignments = await Assignment.find(userFilter)
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completionPercentage,
      upcomingDeadlines,
      recentAssignments,
    });
  } catch (err) {
    next(err);
  }
}
