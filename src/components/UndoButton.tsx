import { useCallback } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Icon } from './ui';

const UndoButton = () => {
  const { undo, recentHistory } = useHabitsContext();

  const handleUndo = useCallback(async () => {
    await undo();
  }, [undo]);

  const { execute, loading } = useAsyncAction(handleUndo);

  const canUndo = recentHistory.length > 0;

  if (!canUndo) return null;

  const getUndoText = () => {
    const lastEvent = recentHistory[0];
    switch (lastEvent.event_type) {
      case 'punch':
        return 'Undo punch';
      case 'habit_create':
        return 'Undo habit creation';
      case 'habit_edit':
        return 'Undo habit edit';
      case 'habit_delete':
        return 'Undo habit deletion';
      default:
        return 'Undo';
    }
  };

  return (
    <button
      onClick={execute}
      disabled={loading}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
      title={getUndoText()}
    >
      <Icon name="undo" />
      <span className="font-medium">{loading ? 'Undoing...' : 'Undo'}</span>
    </button>
  );
};

export default UndoButton;
