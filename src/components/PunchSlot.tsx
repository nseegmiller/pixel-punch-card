import { useMemo } from 'react';
import { History } from '@/types';
import { formatPunchDate, formatPunchTime } from '@/utils/timezone';
import { Icon } from './ui';

interface PunchSlotProps {
  punch: History | null;
  onClick: () => void;
  disabled?: boolean;
}

const PunchSlot = ({ punch, onClick, disabled }: PunchSlotProps) => {
  const isPunched = punch !== null;

  const formattedDate = useMemo(() => {
    if (!punch) return null;
    return formatPunchDate(punch.created_at, punch.timezone || undefined);
  }, [punch]);

  const formattedTime = useMemo(() => {
    if (!punch) return null;
    return formatPunchTime(punch.created_at, punch.timezone || undefined);
  }, [punch]);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-16 h-16 rounded-lg border-2 transition-all duration-200
          ${
            isPunched
              ? 'bg-punch-primary border-punch-primary text-white hover:bg-indigo-700 hover:border-indigo-700 animate-punch'
              : 'bg-white border-gray-300 hover:border-punch-primary hover:bg-indigo-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-punch-primary
        `}
        title={formattedTime || 'Click to punch'}
      >
        {isPunched && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="checkBold" className="w-8 h-8" />
          </div>
        )}
      </button>
      {formattedDate && (
        <div className="text-xs text-gray-500 whitespace-nowrap text-center">
          {formattedDate}
        </div>
      )}
    </div>
  );
};

export default PunchSlot;
