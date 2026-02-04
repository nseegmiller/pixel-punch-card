import { useState, FormEvent, useCallback } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { validateHabitName } from '@/utils/validation';
import { Button, ErrorMessage } from './ui';

const AddHabitForm = () => {
  const { createHabit } = useHabitsContext();
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    const error = validateHabitName(name);
    if (error) {
      setValidationError(error);
      throw new Error(error);
    }
    await createHabit(name);
    setName('');
  }, [createHabit, name]);

  const { execute, loading, error: asyncError } = useAsyncAction(handleCreate);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await execute();
    } catch {
      // Error is handled by useAsyncAction
    }
  };

  const error = validationError || asyncError;

  return (
    <div className="bg-gray-800 rounded-xl shadow-md p-6 mt-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Add New Habit</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setValidationError(null);
          }}
          placeholder="Enter habit name..."
          className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-punch-primary focus:border-transparent"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          loading={loading}
          loadingText="Adding..."
        >
          Add Habit
        </Button>
      </form>
      {error && (
        <div className="mt-2">
          <ErrorMessage message={error} />
        </div>
      )}
    </div>
  );
};

export default AddHabitForm;
