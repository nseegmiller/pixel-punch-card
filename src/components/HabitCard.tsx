import { useState } from 'react';
import { HabitWithCard } from '@/hooks/useHabits';
import { Icon } from './ui';
import PunchCard from './PunchCard';
import CompletedCardsCount from './CompletedCardsCount';
import EditHabitModal from './EditHabitModal';
import DeleteHabitModal from './DeleteHabitModal';

interface HabitCardProps {
  habit: HabitWithCard;
}

const HabitCard = ({ habit }: HabitCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{habit.name}</h3>
            <CompletedCardsCount count={habit.completedCardsCount} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-600 hover:text-punch-primary hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit habit"
            >
              <Icon name="edit" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete habit"
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>

        {habit.currentCard ? (
          <PunchCard cardId={habit.currentCard.id} punches={habit.punches} />
        ) : (
          <div className="text-center text-gray-500 py-8">No active card</div>
        )}
      </div>

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
