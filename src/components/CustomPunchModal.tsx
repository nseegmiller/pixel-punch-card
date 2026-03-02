import { useState, FormEvent, useCallback } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Modal, Button, ErrorMessage } from './ui';

interface CustomPunchModalProps {
  cardId: string;
  habitName: string;
  onClose: () => void;
}

const CustomPunchModal = ({ cardId, habitName, onClose }: CustomPunchModalProps) => {
  const { punch } = useHabitsContext();

  // Initialize with current date and time
  const now = new Date();
  const localDateString = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

  const [datetime, setDatetime] = useState(localDateString);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    // Convert the datetime input to ISO string
    const customDate = new Date(datetime);
    const isoTimestamp = customDate.toISOString();

    // Punch with custom timestamp
    await punch(cardId, isoTimestamp);
    onClose();
  }, [datetime, punch, cardId, onClose]);

  const { execute, loading, error } = useAsyncAction(handleSubmit);

  return (
    <Modal title="Add Backdated Punch" onClose={onClose}>
      <form onSubmit={execute}>
        <div className="mb-4">
          <p className="text-sm text-modal-muted mb-3">
            Adding punch for: <span className="text-modal-text">{habitName}</span>
          </p>

          <label className="block text-sm text-modal-text mb-2">
            Date and Time
          </label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            max={now.toISOString().slice(0, 16)}
            className="w-full px-4 py-2 border border-ui-border bg-modal-hover text-modal-text rounded-lg focus:outline-none focus:ring-2 focus:ring-punch-primary focus:border-transparent"
            required
          />
          <p className="text-xs text-modal-muted mt-1">
            Cannot select future dates
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} loadingText="Adding...">
            Add Punch
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomPunchModal;
