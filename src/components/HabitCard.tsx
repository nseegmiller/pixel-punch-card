import { useState } from 'react';
import { HabitWithCard } from '@/hooks/useHabits';
import { Icon } from './ui';
import PunchCard from './PunchCard';
import CompletedCardsCount from './CompletedCardsCount';
import CardMenuModal from './CardMenuModal';
import CardHistoryModal from './CardHistoryModal';
import EditHabitModal from './EditHabitModal';
import DeleteHabitModal from './DeleteHabitModal';

interface HabitCardProps {
  habit: HabitWithCard;
}

const HabitCard = ({ habit }: HabitCardProps) => {
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showCardHistory, setShowCardHistory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-md p-6 relative border border-gray-700">
        {/* Kebab menu button */}
        <button
          onClick={() => setShowCardMenu(true)}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          title="Card options"
          aria-label="Card options"
        >
          <Icon name="dotsVertical" className="w-5 h-5" />
        </button>

        <div className="flex items-start justify-between mb-6 pr-8">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">{habit.name}</h3>
            <CompletedCardsCount count={habit.completedCardsCount} />
          </div>
        </div>

        {habit.currentCard ? (
          <PunchCard
            cardId={habit.currentCard.id}
            punches={habit.punches}
            habitId={habit.id}
            habitName={habit.name}
          />
        ) : (
          <div className="text-center text-gray-400 py-8">No active card</div>
        )}
      </div>

      {showCardMenu && (
        <CardMenuModal
          habitId={habit.id}
          habitName={habit.name}
          cardId={habit.currentCard?.id || ''}
          onClose={() => setShowCardMenu(false)}
          onViewHistory={() => setShowCardHistory(true)}
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
