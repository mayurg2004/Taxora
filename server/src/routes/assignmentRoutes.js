// ============================================================================
// ASSIGNMENT ROUTES
// Endpoints for assignment CRUD and status modifications
// ============================================================================

import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All assignment routes require administrator authentication
router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(createAssignment);

router.route('/:id')
  .get(getAssignmentById)
  .put(updateAssignment)
  .delete(deleteAssignment);

router.patch('/:id/status', updateAssignmentStatus);

export default router;
