import { useHabitsContext } from '@/context/HabitsContext';
import { formatPunchTime } from '@/utils/timezone';

const HistoryView = () => {
  const { recentHistory, habits } = useHabitsContext();

  const getHabitName = (habitId: string | null) => {
    if (!habitId) return 'Unknown habit';
    const habit = habits.find(h => h.id === habitId);
    return habit?.name || 'Deleted habit';
  };

  const getEventDescription = (event: typeof recentHistory[0]) => {
    switch (event.event_type) {
      case 'punch':
        return 'Punch';
      case 'habit_create':
        return 'Created habit';
      case 'habit_edit':
        return 'Edited habit';
      case 'habit_delete':
        return 'Deleted habit';
      default:
        return 'Unknown event';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'punch':
        return (
          <svg className="w-5 h-5 text-punch-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'habit_create':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'habit_edit':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'habit_delete':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (recentHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600 text-center py-8">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentHistory.slice(0, 20).map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0 mt-0.5">
              {getEventIcon(event.event_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {getEventDescription(event)}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {getHabitName(event.habit_id)}
              </p>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-500">
              {formatPunchTime(event.created_at, event.timezone || undefined)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
