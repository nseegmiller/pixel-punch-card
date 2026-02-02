import { useState } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';

interface DeleteHabitModalProps {
  habitId: string;
  habitName: string;
  onClose: () => void;
}

const DeleteHabitModal = ({ habitId, habitName, onClose }: DeleteHabitModalProps) => {
  const { deleteHabit } = useHabitsContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteHabit(habitId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Habit</h2>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <span className="font-semibold">"{habitName}"</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This will delete all cards and punch history for this habit. You can undo this action.
        </p>
        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHabitModal;
