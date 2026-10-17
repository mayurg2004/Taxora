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
    const total = await Assignment.countDocuments();

    // 2. Pending assignments count
    const pending = await Assignment.countDocuments({ status: 'Pending' });

    // 3. In Progress assignments count
    const inProgress = await Assignment.countDocuments({ status: 'In Progress' });

    // 4. Completed assignments count
    const completed = await Assignment.countDocuments({ status: 'Completed' });

    // 5. Overdue assignments count:
    // Defined as due date passed (< now) AND status is NOT 'Completed'
    const overdue = await Assignment.countDocuments({
      status: { $ne: 'Completed' },
      dueDate: { $lt: now },
    });

    // 6. Completion percentage calculation:
    // completed / total * 100 (safely handle division by zero)
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 7. Upcoming deadlines:
    // Pending or In Progress assignments whose deadlines are in the future
    const upcomingDeadlines = await Assignment.find({
      status: { $in: ['Pending', 'In Progress'] },
      dueDate: { $gte: now },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    // 8. Recent assignments:
    // Latest 5 assignments added to the system
    const recentAssignments = await Assignment.find()
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
