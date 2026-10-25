import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssignmentForm } from '../components/assignments/AssignmentForm';
import { AssignmentFormData, Assignment } from '../types';
import { assignmentsApi } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const EditAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const assignRes = await assignmentsApi.getById(id);
      setAssignment(assignRes.assignment);
    } catch (err: any) {
      setError(err.message || 'Failed to load task details.');
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
    return <LoadingSpinner message="Loading task for editing..." />;
  }

  if (error || !assignment) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <ErrorMessage
          message={error || 'Task not found.'}
          onRetry={loadData}
        />
        <button
          onClick={() => navigate('/assignments')}
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          Return to my tasks
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
        isEditing={true}
        onSubmit={handleUpdateAssignment}
      />
    </div>
  );
};
