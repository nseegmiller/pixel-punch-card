import { useState } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { formatPunchTime } from '@/utils/timezone';
import { HISTORY_DISPLAY_LIMIT } from '@/utils/constants';
import { Icon, IconName, Button, Modal } from './ui';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EventType } from '@/types';

const eventIcons: Record<string, { name: IconName; className: string }> = {
  punch: { name: 'check', className: 'text-punch-primary' },
  habit_create: { name: 'plus', className: 'text-punch-success' },
  habit_edit: { name: 'edit', className: 'text-punch-primary' },
  habit_delete: { name: 'trash', className: 'text-danger' },
};

const eventDescriptions: Record<string, string> = {
  punch: 'Punch',
  habit_create: 'Created habit',
  habit_edit: 'Edited habit',
  habit_delete: 'Deleted habit',
};

interface HistoryViewProps {
  showDeleteButtons?: boolean;
}

const HistoryView = ({ showDeleteButtons = false }: HistoryViewProps) => {
  const { recentHistory, habits, deleteHistoryEntry } = useHabitsContext();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; habitName: string } | null>(null);

  const getHabitName = (habitId: string | null, eventData?: any) => {
    if (!habitId) return 'Unknown habit';
    const habit = habits.find((h) => h.id === habitId);

    // For habit_delete events, try to get the name from event_data
    if (!habit && eventData && eventData.habit && eventData.habit.name) {
      return eventData.habit.name;
    }

    return habit?.name || 'Deleted habit';
  };

  const handleDelete = async (historyId: string, eventType: EventType, habitName: string) => {
    // Show confirmation only for habit_delete events (permanent loss of restore point)
    if (eventType === 'habit_delete') {
      setDeleteConfirm({ id: historyId, habitName });
    } else {
      // Direct delete for other event types
      try {
        await deleteHistoryEntry(historyId, eventType);
      } catch (err) {
        console.error('Error deleting history entry:', err);
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteHistoryEntry(deleteConfirm.id, 'habit_delete');
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting history entry:', err);
    }
  };

  const { execute: executeDelete, loading: deleteLoading } = useAsyncAction(confirmDelete);

  if (recentHistory.length === 0) {
    return <p className="text-modal-muted text-center py-8">No activity yet</p>;
  }

  return (
    <>
      <div className="space-y-3">
          {recentHistory.slice(0, HISTORY_DISPLAY_LIMIT).map((event) => {
            const iconConfig = eventIcons[event.event_type];
            const habitName = getHabitName(event.habit_id, event.event_data);
            return (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-modal-hover rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {iconConfig && <Icon name={iconConfig.name} className={`w-5 h-5 ${iconConfig.className}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-modal-text">
                    {eventDescriptions[event.event_type] || 'Unknown event'}
                  </p>
                  <p className="text-sm text-modal-muted truncate">{habitName}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-modal-muted">
                  {formatPunchTime(event.created_at, event.timezone || undefined)}
                </div>
                {showDeleteButtons && (
                  <button
                    onClick={() => handleDelete(event.id, event.event_type as EventType, habitName)}
                    className="flex-shrink-0 p-1 text-modal-muted hover:text-danger transition-colors"
                    title="Delete entry"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
      </div>

      {deleteConfirm && (
        <Modal
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <p className="text-modal-muted mb-6">
            This will permanently remove the ability to restore <strong className="text-modal-text">{deleteConfirm.habitName}</strong>. Continue?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={executeDelete}
              loading={deleteLoading}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default HistoryView;
