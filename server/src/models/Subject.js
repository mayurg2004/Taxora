// ============================================================================
// SUBJECT DATA MODEL (Mongoose)
// Represents academic subjects or modules in the curriculum
// ============================================================================

import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters long'],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Subject = mongoose.model('Subject', subjectSchema);
