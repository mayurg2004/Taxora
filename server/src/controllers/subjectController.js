// ============================================================================
// SUBJECT CONTROLLER
// Handles academic subject management and safety checks before deletion
// ============================================================================

import { Subject } from '../models/Subject.js';
import { Assignment } from '../models/Assignment.js';

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects along with associated assignment counts
 * @access  Protected
 */
export async function getSubjects(req, res, next) {
  try {
    const subjects = await Subject.find().sort({ name: 1 }).lean();

    // Calculate assignment count for each subject
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subj) => {
        const count = await Assignment.countDocuments({ subject: subj.name });
        return {
          ...subj,
          assignmentCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: subjectsWithCounts.length,
      subjects: subjectsWithCounts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/subjects
 * @desc    Create a new subject
 * @access  Protected
 */
export async function createSubject(req, res, next) {
  try {
    const { name, code, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required.',
      });
    }

    // Check duplicate
    const existing = await Subject.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Subject "${name.trim()}" already exists.`,
      });
    }

    const subject = await Subject.create({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : '',
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      subject: {
        ...subject.toObject(),
        assignmentCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update a subject name or details
 * @access  Protected
 */
export async function updateSubject(req, res, next) {
  try {
    const { name, code, description } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found to update.',
      });
    }

    const oldName = subject.name;
    const newName = name ? name.trim() : oldName;

    // If changing name, ensure uniqueness
    if (newName !== oldName) {
      const duplicate = await Subject.findOne({ name: newName });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Subject named "${newName}" already exists.`,
        });
      }
    }

    subject.name = newName;
    if (code !== undefined) subject.code = code.trim().toUpperCase();
    if (description !== undefined) subject.description = description.trim();

    await subject.save();

    // If subject name changed, synchronize existing assignments
    if (newName !== oldName) {
      await Assignment.updateMany({ subject: oldName }, { subject: newName });
    }

    const count = await Assignment.countDocuments({ subject: subject.name });

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      subject: {
        ...subject.toObject(),
        assignmentCount: count,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete a subject (only if no assignments reference it)
 * @access  Protected
 */
export async function deleteSubject(req, res, next) {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found to delete.',
      });
    }

    // Safety check: Prevent deleting if assignments are associated
    const assignmentCount = await Assignment.countDocuments({ subject: subject.name });
    if (assignmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${subject.name}" because ${assignmentCount} assignment(s) are currently assigned to it. Please reassign or delete those assignments first.`,
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Subject "${subject.name}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}
