import { useState } from 'react';
import { History } from '@/types';
import { PUNCHES_PER_CARD } from '@/utils/constants';
import PunchSlot from './PunchSlot';
import CompletionCelebration from './CompletionCelebration';
import { useHabitsContext } from '@/context/HabitsContext';

interface PunchCardProps {
  cardId: string;
  punches: History[];
}

const PunchCard = ({ cardId, punches }: PunchCardProps) => {
  const { punch, unpunch } = useHabitsContext();
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleSlotClick = async (index: number) => {
    if (loading) return;

    const punchAtSlot = punches[index];

    try {
      setLoading(true);

      if (punchAtSlot) {
        // Unpunch
        await unpunch(punchAtSlot.id);
      } else {
        // Punch
        const result = await punch(cardId);

        if (result.completed) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      }
    } catch (err) {
      console.error('Error punching/unpunching:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create array of slots (10 total)
  const slots = Array.from({ length: PUNCHES_PER_CARD }, (_, i) => {
    return punches[i] || null;
  });

  return (
    <div className="relative">
      <div className="grid grid-cols-5 gap-3 mb-8">
        {slots.map((punchData, index) => (
          <PunchSlot
            key={index}
            punch={punchData}
            onClick={() => handleSlotClick(index)}
            disabled={loading || (punchData === null && punches.length !== index)}
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
