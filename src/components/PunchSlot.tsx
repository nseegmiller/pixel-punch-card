import { History } from '@/types';
import { formatPunchTime } from '@/utils/timezone';

interface PunchSlotProps {
  punch: History | null;
  onClick: () => void;
  disabled?: boolean;
}

const PunchSlot = ({ punch, onClick, disabled }: PunchSlotProps) => {
  const isPunched = punch !== null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-16 rounded-lg border-2 transition-all duration-200
        ${isPunched
          ? 'bg-punch-primary border-punch-primary text-white hover:bg-indigo-700 hover:border-indigo-700 animate-punch'
          : 'bg-white border-gray-300 hover:border-punch-primary hover:bg-indigo-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-punch-primary
      `}
      title={isPunched && punch ? formatPunchTime(punch.created_at, punch.timezone || undefined) : 'Click to punch'}
    >
      {isPunched && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
      {isPunched && punch && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
          {formatPunchTime(punch.created_at, punch.timezone || undefined)}
        </div>
      )}
    </button>
  );
};

export default PunchSlot;
