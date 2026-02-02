import { useState, useCallback } from 'react';
import { History } from '@/types';
import { PUNCHES_PER_CARD, CELEBRATION_DURATION_MS } from '@/utils/constants';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useHabitsContext } from '@/context/HabitsContext';
import PunchSlot from './PunchSlot';
import CompletionCelebration from './CompletionCelebration';

interface PunchCardProps {
  cardId: string;
  punches: History[];
}

const PunchCard = ({ cardId, punches }: PunchCardProps) => {
  const { punch, unpunch } = useHabitsContext();
  const [showCelebration, setShowCelebration] = useState(false);

  const handlePunch = useCallback(async () => {
    const result = await punch(cardId);
    if (result.completed) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), CELEBRATION_DURATION_MS);
    }
  }, [punch, cardId]);

  const { execute: executePunch, loading: punchLoading } = useAsyncAction(handlePunch);

  const handleSlotClick = async (index: number) => {
    const punchAtSlot = punches[index];

    if (punchAtSlot) {
      try {
        await unpunch(punchAtSlot.id);
      } catch (err) {
        console.error('Error unpunching:', err);
      }
    } else {
      try {
        await executePunch();
      } catch (err) {
        console.error('Error punching:', err);
      }
    }
  };

  const slots = Array.from({ length: PUNCHES_PER_CARD }, (_, i) => punches[i] || null);

  return (
    <div className="relative">
      <div className="grid grid-cols-5 gap-x-3 gap-y-6 mb-6">
        {slots.map((punchData, index) => (
          <PunchSlot
            key={index}
            punch={punchData}
            onClick={() => handleSlotClick(index)}
            disabled={punchLoading || (punchData === null && punches.length !== index)}
          />
        ))}
      </div>

      {showCelebration && <CompletionCelebration />}

      <div className="text-center text-sm text-gray-600">
        {punches.length} / {PUNCHES_PER_CARD} punches
      </div>
    </div>
  );
};

export default PunchCard;
