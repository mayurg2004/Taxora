import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssignmentFormData, Subject } from '../../types';
import { toInputDateFormat } from '../../utils/dateUtils';
import { AlertCircle, CheckCircle, Save, ArrowLeft } from 'lucide-react';

interface AssignmentFormProps {
  initialData?: AssignmentFormData;
  subjects: Subject[];
  isEditing?: boolean;
  onSubmit: (formData: AssignmentFormData) => Promise<void>;
}

interface FormErrors {
  title?: string;
  subject?: string;
  dueDate?: string;
  general?: string;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  initialData,
  subjects,
  isEditing = false,
  onSubmit,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AssignmentFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        dueDate: toInputDateFormat(initialData.dueDate),
      };
    }
    return {
      title: '',
      subject: subjects.length > 0 ? subjects[0].name : '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      status: 'Pending',
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select or enter a subject.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required.';
    } else {
      const selected = new Date(formData.dueDate);
      if (isNaN(selected.getTime())) {
        newErrors.dueDate = 'Please enter a valid due date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      await onSubmit(formData);
      setSuccessMessage(isEditing ? 'Assignment updated successfully!' : 'Assignment created successfully!');
      setTimeout(() => {
        navigate('/assignments');
      }, 700);
    } catch (err: any) {
      const msg = err.message || 'Failed to save assignment. Please check all fields.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isEditing ? 'Update your existing coursework record' : 'Fill in the details to add an assignment to your schedule'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {errors.general && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{errors.general}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Assignment Title <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g., Lab Experiment 4 — REST API Integration"
            value={formData.title}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.title && (
            <span className="form-error">
              <AlertCircle size={12} />
              {errors.title}
            </span>
          )}
        </div>

        {/* Subject and Due Date (Two-column) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Subject Field */}
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject <span className="required">*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                id="subject"
                name="subject"
                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.subject && (
              <span className="form-error">
                <AlertCircle size={12} />
                {errors.subject}
              </span>
            )}
            <span className="form-help">Manage subjects under the Subjects tab.</span>
          </div>

          {/* Due Date Field */}
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              Due Date <span className="required">*</span>
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.dueDate && (
              <span className="form-error">
                <AlertCircle size={12} />
                {errors.dueDate}
              </span>
            )}
          </div>
        </div>

        {/* Priority & Status (Two-column) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description / Requirements <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            placeholder="Add relevant instructions, rubric notes, repository links, or experiment details..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/assignments')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Assignment' : 'Create Assignment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
