import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssignmentForm } from '../components/assignments/AssignmentForm';
import { Subject, AssignmentFormData, Assignment } from '../types';
import { subjectsApi, assignmentsApi } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const EditAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [assignRes, subRes] = await Promise.all([
        assignmentsApi.getById(id),
        subjectsApi.getAll(),
      ]);
      setAssignment(assignRes.assignment);
      setSubjects(subRes.subjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateAssignment = async (formData: AssignmentFormData): Promise<void> => {
    if (!id) return;
    await assignmentsApi.update(id, formData);
  };

  if (loading) {
    return <LoadingSpinner message="Loading assignment for editing..." />;
  }

  if (error || !assignment) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <ErrorMessage
          message={error || 'Assignment not found.'}
          onRetry={loadData}
        />
        <button
          onClick={() => navigate('/assignments')}
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          Return to Assignments
        </button>
      </div>
    );
  }

  const initialFormData: AssignmentFormData = {
    title: assignment.title,
    subject: assignment.subject,
    description: assignment.description || '',
    dueDate: assignment.dueDate,
    priority: assignment.priority,
    status: assignment.status,
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <AssignmentForm
        initialData={initialFormData}
        subjects={subjects}
        isEditing={true}
        onSubmit={handleUpdateAssignment}
      />
    </div>
  );
};
