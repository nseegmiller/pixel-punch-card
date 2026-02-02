import { useState } from 'react';
import { HabitWithCard } from '@/hooks/useHabits';
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {habit.name}
            </h3>
            <CompletedCardsCount count={habit.completedCardsCount} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-600 hover:text-punch-primary hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit habit"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete habit"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {habit.currentCard ? (
          <PunchCard
            cardId={habit.currentCard.id}
            punches={habit.punches}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            No active card
          </div>
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
