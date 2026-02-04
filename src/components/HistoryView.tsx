import { useState } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { formatPunchTime } from '@/utils/timezone';
import { HISTORY_DISPLAY_LIMIT } from '@/utils/constants';
import { Icon, IconName, Button, Modal } from './ui';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EventType } from '@/types';

const eventIcons: Record<string, { name: IconName; className: string }> = {
  punch: { name: 'check', className: 'text-punch-primary' },
  habit_create: { name: 'plus', className: 'text-green-600' },
  habit_edit: { name: 'edit', className: 'text-blue-600' },
  habit_delete: { name: 'trash', className: 'text-red-600' },
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
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600 text-center py-8">No activity yet</p>
      </div>
    );
  }

  return (
    <>
      <div className={showDeleteButtons ? '' : 'bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6'}>
        {!showDeleteButtons && <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>}
        <div className={`space-y-3 ${showDeleteButtons ? '' : 'max-h-96 overflow-y-auto'}`}>
          {recentHistory.slice(0, HISTORY_DISPLAY_LIMIT).map((event) => {
            const iconConfig = eventIcons[event.event_type];
            const habitName = getHabitName(event.habit_id, event.event_data);
            return (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {iconConfig && <Icon name={iconConfig.name} className={`w-5 h-5 ${iconConfig.className}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100">
                    {eventDescriptions[event.event_type] || 'Unknown event'}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{habitName}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {formatPunchTime(event.created_at, event.timezone || undefined)}
                </div>
                {showDeleteButtons && (
                  <button
                    onClick={() => handleDelete(event.id, event.event_type as EventType, habitName)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete entry"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {deleteConfirm && (
        <Modal
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <p className="text-gray-300 mb-6">
            This will permanently remove the ability to restore <strong className="text-gray-100">{deleteConfirm.habitName}</strong>. Continue?
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
