import React from 'react';
import { AssignmentForm } from '../components/assignments/AssignmentForm';
import { AssignmentFormData } from '../types';
import { assignmentsApi } from '../services/api';

export const AddAssignmentPage: React.FC = () => {
  const handleCreateAssignment = async (formData: AssignmentFormData): Promise<void> => {
    await assignmentsApi.create(formData);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <AssignmentForm
        isEditing={false}
        onSubmit={handleCreateAssignment}
      />
    </div>
  );
};
