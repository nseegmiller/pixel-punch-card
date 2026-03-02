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
          className="justify-start w-full gap-3 p-3 text-modal-text hover:bg-modal-hover rounded-lg transition-colors"
        >
          <Icon name="clock" className="w-5 h-5 text-modal-muted" />
          <span>View Punch History</span>
        </button>
        <button
          onClick={() => handleOption(onAddBackdatedPunch)}
          className="justify-start w-full gap-3 p-3 text-modal-text hover:bg-modal-hover rounded-lg transition-colors"
        >
          <Icon name="plus" className="w-5 h-5 text-modal-muted" />
          <span>Add Backdated Punch</span>
        </button>
        <button
          onClick={() => handleOption(onEdit)}
          className="justify-start w-full gap-3 p-3 text-modal-text hover:bg-modal-hover rounded-lg transition-colors"
        >
          <Icon name="edit" className="w-5 h-5 text-modal-muted" />
          <span>Edit Habit</span>
        </button>
        <button
          onClick={() => handleOption(onDelete)}
          className="justify-start w-full gap-3 p-3 text-danger hover:bg-modal-hover rounded-lg transition-colors"
        >
          <Icon name="trash" className="w-5 h-5" />
          <span>Delete Habit</span>
        </button>
      </div>
    </Modal>
  );
};

export default CardMenuModal;
