// ============================================================================
// ASSIGNMENT DATA MODEL (Mongoose)
// Represents academic student coursework records with backend validation
// ============================================================================

import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (value) {
          return !isNaN(new Date(value).getTime());
        },
        message: 'Invalid due date format',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority level (must be Low, Medium, or High)',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid status (must be Pending, In Progress, or Completed)',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for high-performance title/subject text searches and sorting
assignmentSchema.index({ title: 'text', description: 'text' });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
