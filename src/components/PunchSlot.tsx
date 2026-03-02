import { useMemo } from 'react';
import { History } from '@/types';
import { formatPunchTime } from '@/utils/timezone';
import punchImg from '@/assets/punch.png';

interface PunchSlotProps {
  punch: History | null;
  onClick: () => void;
  onRightClick?: () => void;
  disabled?: boolean;
}

const PunchSlot = ({ punch, onClick, onRightClick, disabled }: PunchSlotProps) => {
  const isPunched = punch !== null;

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
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      disabled={disabled}
      className={`
        w-full h-full bg-transparent border-0 p-0 flex items-center justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none
      `}
      title={formattedTime || 'Click to punch | Right-click for custom date'}
      aria-label={isPunched ? `Punched at ${formattedTime}` : 'Empty punch slot'}
    >
      {isPunched && (
        <img
          src={punchImg}
          alt="punch"
          className="w-full h-full pixelated pointer-events-none"
          draggable={false}
        />
      )}
    </button>
  );
};

export default PunchSlot;
