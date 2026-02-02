import { useState } from 'react';
import { useHabitsContext } from '@/context/HabitsContext';

const UndoButton = () => {
  const { undo, recentHistory } = useHabitsContext();
  const [loading, setLoading] = useState(false);

  const handleUndo = async () => {
    try {
      setLoading(true);
      await undo();
    } catch (err) {
      console.error('Error undoing:', err);
    } finally {
      setLoading(false);
    }
  };

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
      onClick={handleUndo}
      disabled={loading}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
      title={getUndoText()}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
      </svg>
      <span className="font-medium">{loading ? 'Undoing...' : 'Undo'}</span>
    </button>
  );
};

export default UndoButton;
