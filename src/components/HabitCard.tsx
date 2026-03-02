import { useState } from 'react';
import { HabitWithCard } from '@/hooks/useHabits';
import { Icon } from './ui';
import PunchCard from './PunchCard';
import CompletedCardsCount from './CompletedCardsCount';
import CardMenuModal from './CardMenuModal';
import CardHistoryModal from './CardHistoryModal';
import CustomPunchModal from './CustomPunchModal';
import EditHabitModal from './EditHabitModal';
import DeleteHabitModal from './DeleteHabitModal';

interface HabitCardProps {
  habit: HabitWithCard;
}

const HabitCard = ({ habit }: HabitCardProps) => {
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showCardHistory, setShowCardHistory] = useState(false);
  const [showCustomPunch, setShowCustomPunch] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div>
        {/* Card image is the visual — kebab button floats over its top-right corner */}
        <div className="relative">
          {habit.currentCard ? (
            <PunchCard
              cardId={habit.currentCard.id}
              punches={habit.punches}
              habitId={habit.id}
              habitName={habit.name}
            />
          ) : (
            <div className="flex items-center justify-center h-24 text-ui-muted text-sm">
              No active card
            </div>
          )}

          <button
            onClick={() => setShowCardMenu(true)}
            className="absolute top-[4%] right-[3%] z-10 p-0.5 text-ui-muted hover:text-ui-primary transition-colors rounded"
            title="Card options"
            aria-label="Card options"
          >
            <Icon name="dotsVertical" className="w-4 h-4" />
          </button>
        </div>

        {/* Completed count sits just below the card */}
        <div className="h-5 mt-1 flex justify-center">
          <CompletedCardsCount count={habit.completedCardsCount} />
        </div>
      </div>

      {showCardMenu && (
        <CardMenuModal
          habitId={habit.id}
          habitName={habit.name}
          cardId={habit.currentCard?.id || ''}
          onClose={() => setShowCardMenu(false)}
          onViewHistory={() => setShowCardHistory(true)}
          onAddBackdatedPunch={() => setShowCustomPunch(true)}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteModal(true)}
        />
      )}

      {showCardHistory && habit.currentCard && (
        <CardHistoryModal
          habitName={habit.name}
          cardId={habit.currentCard.id}
          onClose={() => setShowCardHistory(false)}
        />
      )}

      {showCustomPunch && habit.currentCard && (
        <CustomPunchModal
          cardId={habit.currentCard.id}
          habitName={habit.name}
          onClose={() => setShowCustomPunch(false)}
        />
      )}

      {showEditModal && (
        <EditHabitModal
          habitId={habit.id}
          currentName={habit.name}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteHabitModal
          habitId={habit.id}
          habitName={habit.name}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

export default HabitCard;
