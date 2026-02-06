import { Modal, Icon } from './ui';

interface CardMenuModalProps {
  habitId: string;
  habitName: string;
  cardId: string;
  onClose: () => void;
  onViewHistory: () => void;
  onAddBackdatedPunch: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CardMenuModal = ({
  onClose,
  onViewHistory,
  onAddBackdatedPunch,
  onEdit,
  onDelete,
}: CardMenuModalProps) => {
  const handleOption = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal onClose={onClose} title="Card Options">
      <div className="space-y-2">
        <button
          onClick={() => handleOption(onViewHistory)}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Icon name="clock" className="w-5 h-5 text-gray-400" />
          <span className="text-gray-100">View Punch History</span>
        </button>
        <button
          onClick={() => handleOption(onAddBackdatedPunch)}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Icon name="plus" className="w-5 h-5 text-gray-400" />
          <span className="text-gray-100">Add Backdated Punch</span>
        </button>
        <button
          onClick={() => handleOption(onEdit)}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Icon name="edit" className="w-5 h-5 text-gray-400" />
          <span className="text-gray-100">Edit Habit</span>
        </button>
        <button
          onClick={() => handleOption(onDelete)}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <Icon name="trash" className="w-5 h-5 text-red-400" />
          <span className="text-red-400">Delete Habit</span>
        </button>
      </div>
    </Modal>
  );
};

export default CardMenuModal;
