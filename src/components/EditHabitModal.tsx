import { useState, FormEvent, useEffect } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { validateHabitName } from '@/utils/validation';

interface EditHabitModalProps {
  habitId: string;
  currentName: string;
  onClose: () => void;
}

const EditHabitModal = ({ habitId, currentName, onClose }: EditHabitModalProps) => {
  const { updateHabit } = useHabitsContext();
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validateHabitName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (name.trim() === currentName.trim()) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updateHabit(habitId, name, currentName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Habit</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Enter habit name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-punch-primary focus:border-transparent mb-4"
            disabled={loading}
            autoFocus
          />
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
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-punch-primary text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-punch-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHabitModal;
