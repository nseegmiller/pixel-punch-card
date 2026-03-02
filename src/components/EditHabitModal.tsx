import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { validateHabitName } from '@/utils/validation';
import { Modal, Button, ErrorMessage } from './ui';

interface EditHabitModalProps {
  habitId: string;
  currentName: string;
  onClose: () => void;
}

const EditHabitModal = ({ habitId, currentName, onClose }: EditHabitModalProps) => {
  const { updateHabit } = useHabitsContext();
  const [name, setName] = useState(currentName);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleUpdate = useCallback(async () => {
    const error = validateHabitName(name);
    if (error) {
      setValidationError(error);
      throw new Error(error);
    }

    if (name.trim() === currentName.trim()) {
      onClose();
      return;
    }

    await updateHabit(habitId, name, currentName);
    onClose();
  }, [updateHabit, habitId, name, currentName, onClose]);

  const { execute, loading, error: asyncError } = useAsyncAction(handleUpdate);

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
    <Modal title="Edit Habit" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setValidationError(null);
          }}
          placeholder="Enter habit name..."
          className="w-full px-4 py-2 border border-ui-border bg-modal-hover text-modal-text placeholder-modal-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-punch-primary focus:border-transparent mb-4"
          disabled={loading}
          autoFocus
        />
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()} loading={loading} loadingText="Saving...">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditHabitModal;
