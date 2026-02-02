import { useHabitsContext } from '@/context/HabitsContext';
import { formatPunchTime } from '@/utils/timezone';
import { HISTORY_DISPLAY_LIMIT } from '@/utils/constants';
import { Icon, IconName } from './ui';

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

const HistoryView = () => {
  const { recentHistory, habits } = useHabitsContext();

  const getHabitName = (habitId: string | null) => {
    if (!habitId) return 'Unknown habit';
    const habit = habits.find((h) => h.id === habitId);
    return habit?.name || 'Deleted habit';
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
        {recentHistory.slice(0, HISTORY_DISPLAY_LIMIT).map((event) => {
          const iconConfig = eventIcons[event.event_type];
          return (
            <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {iconConfig && <Icon name={iconConfig.name} className={`w-5 h-5 ${iconConfig.className}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {eventDescriptions[event.event_type] || 'Unknown event'}
                </p>
                <p className="text-sm text-gray-600 truncate">{getHabitName(event.habit_id)}</p>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500">
                {formatPunchTime(event.created_at, event.timezone || undefined)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
