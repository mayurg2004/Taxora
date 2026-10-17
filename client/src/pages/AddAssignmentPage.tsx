import React, { useEffect, useState } from 'react';
import { AssignmentForm } from '../components/assignments/AssignmentForm';
import { Subject, AssignmentFormData } from '../types';
import { subjectsApi, assignmentsApi } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const AddAssignmentPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectsApi.getAll();
      setSubjects(res.subjects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch academic subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateAssignment = async (formData: AssignmentFormData): Promise<void> => {
    await assignmentsApi.create(formData);
  };

  if (loading) {
    return <LoadingSpinner message="Preparing assignment form..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSubjects} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <AssignmentForm
        subjects={subjects}
        isEditing={false}
        onSubmit={handleCreateAssignment}
      />
    </div>
  );
};
