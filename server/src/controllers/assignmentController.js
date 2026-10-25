// ============================================================================
// ASSIGNMENT CONTROLLER
// Handles complete CRUD operations, filtering, search, and status tracking
// ============================================================================

import { Assignment } from '../models/Assignment.js';
import { Subject } from '../models/Subject.js';

/**
 * @route   GET /api/assignments
 * @desc    Fetch assignments with optional search, filtering, and sorting
 * @access  Protected
 */
export async function getAssignments(req, res, next) {
  try {
    const { search, subject, status, priority, sort } = req.query;

    const filter = { user: req.user._id };

    // Text search on title, subject, or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
      ];
    }

    // Filter by subject
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Sorting configuration
    let sortOptions = { dueDate: 1 }; // Default: earliest due date first

    if (sort) {
      switch (sort) {
        case 'dueDate_desc':
          sortOptions = { dueDate: -1 };
          break;
        case 'title_asc':
          sortOptions = { title: 1 };
          break;
        case 'title_desc':
          sortOptions = { title: -1 };
          break;
        case 'priority_desc':
          // Sort by priority (we can handle standard priority sort)
          sortOptions = { priority: -1, dueDate: 1 };
          break;
        case 'createdAt_desc':
          sortOptions = { createdAt: -1 };
          break;
        case 'dueDate_asc':
        default:
          sortOptions = { dueDate: 1 };
          break;
      }
    }

    const assignments = await Assignment.find(filter).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/assignments/:id
 * @desc    Fetch a single assignment by ID
 * @access  Protected
 */
export async function getAssignmentById(req, res, next) {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found with specified identifier.',
      });
    }

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/assignments
 * @desc    Create a new assignment
 * @access  Protected
 */
export async function createAssignment(req, res, next) {
  try {
    const { title, subject, description, dueDate, priority, status } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment title is required.',
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Due date is required.',
      });
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format.',
      });
    }
    if (parsedDueDate.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Due date and time must be now or in the future.',
      });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      subject: subject ? subject.trim() : 'Personal',
      user: req.user._id,
      description: description ? description.trim() : '',
      dueDate: parsedDueDate,
      priority: priority || 'Medium',
      status: status || 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      assignment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/assignments/:id
 * @desc    Update an existing assignment
 * @access  Protected
 */
export async function updateAssignment(req, res, next) {
  try {
    const { title, subject, description, dueDate, priority, status } = req.body;

    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found to update.',
      });
    }

    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid due date format.' });
      }
      if (parsedDueDate.getTime() < Date.now() && parsedDueDate.getTime() !== assignment.dueDate.getTime()) {
        return res.status(400).json({ success: false, message: 'Due date and time must be now or in the future.' });
      }
      assignment.dueDate = parsedDueDate;
    }
    if (title !== undefined) assignment.title = title.trim();
    if (subject !== undefined) assignment.subject = subject.trim();
    if (description !== undefined) assignment.description = description.trim();
    if (priority !== undefined) assignment.priority = priority;
    if (status !== undefined) assignment.status = status;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully.',
      assignment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PATCH /api/assignments/:id/status
 * @desc    Quickly toggle or update assignment status
 * @access  Protected
 */
export async function updateAssignmentStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, In Progress, or Completed.',
      });
    }

    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found to update status.',
      });
    }

    assignment.status = status;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: `Assignment marked as ${status}.`,
      assignment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete an assignment
 * @access  Protected
 */
export async function deleteAssignment(req, res, next) {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found to delete.',
      });
    }

    await Assignment.deleteOne({ _id: req.params.id, user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
