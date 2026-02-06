import { useMemo } from 'react';
import { History } from '@/types';
import { formatPunchDate, formatPunchTime } from '@/utils/timezone';
import { Icon } from './ui';

interface PunchSlotProps {
  punch: History | null;
  onClick: () => void;
  onRightClick?: () => void;
  disabled?: boolean;
}

const PunchSlot = ({ punch, onClick, onRightClick, disabled }: PunchSlotProps) => {
  const isPunched = punch !== null;

  const formattedDate = useMemo(() => {
    if (!punch) return null;
    return formatPunchDate(punch.created_at, punch.timezone || undefined);
  }, [punch]);

  const formattedTime = useMemo(() => {
    if (!punch) return null;
    return formatPunchTime(punch.created_at, punch.timezone || undefined);
  }, [punch]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPunched && onRightClick && !disabled) {
      onRightClick();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        disabled={disabled}
        className={`
          relative w-16 h-16 rounded-lg border-2 transition-all duration-200
          ${
            isPunched
              ? 'bg-punch-primary border-punch-primary text-white hover:bg-indigo-700 hover:border-indigo-700 animate-punch'
              : 'bg-gray-700 border-gray-600 hover:border-punch-primary hover:bg-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-punch-primary
        `}
        title={formattedTime || 'Click to punch | Right-click for custom date'}
      >
        {isPunched && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="checkBold" className="w-8 h-8" />
          </div>
        )}
      </button>
      {formattedDate && (
        <div className="text-xs text-gray-400 whitespace-nowrap text-center">
          {formattedDate}
        </div>
      )}
    </div>
  );
};

export default PunchSlot;
