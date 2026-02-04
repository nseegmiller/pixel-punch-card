import { useCallback } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Modal, Button, ErrorMessage } from './ui';

interface DeleteHabitModalProps {
  habitId: string;
  habitName: string;
  onClose: () => void;
}

const DeleteHabitModal = ({ habitId, habitName, onClose }: DeleteHabitModalProps) => {
  const { deleteHabit } = useHabitsContext();

  const handleDelete = useCallback(async () => {
    await deleteHabit(habitId);
    onClose();
  }, [deleteHabit, habitId, onClose]);

  const { execute, loading, error } = useAsyncAction(handleDelete);

  return (
    <Modal title="Delete Habit" onClose={onClose}>
      <p className="text-gray-300 mb-2">
        Are you sure you want to delete <span className="font-semibold text-gray-100">"{habitName}"</span>?
      </p>
      <p className="text-sm text-gray-400 mb-6">
        This will delete all cards and punch history for this habit. You can undo this action.
      </p>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={execute} loading={loading} loadingText="Deleting...">
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteHabitModal;
