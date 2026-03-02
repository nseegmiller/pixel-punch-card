import { useHabitsContext } from '@/context/HabitsContext';
import { formatPunchTime } from '@/utils/timezone';
import { Modal, Icon } from './ui';

interface CardHistoryModalProps {
  habitName: string;
  cardId: string;
  onClose: () => void;
}

const CardHistoryModal = ({ habitName, cardId, onClose }: CardHistoryModalProps) => {
  const { recentHistory, deleteHistoryEntry } = useHabitsContext();

  // Filter to only show punches for this card
  const cardPunches = recentHistory.filter(
    (h) => h.card_id === cardId && h.event_type === 'punch'
  );

  const handleDelete = async (historyId: string) => {
    try {
      await deleteHistoryEntry(historyId, 'punch');
    } catch (err) {
      console.error('Error deleting punch:', err);
    }
  };

  return (
    <Modal onClose={onClose} title={`Punch History - ${habitName}`}>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {cardPunches.length === 0 ? (
          <p className="text-center text-modal-muted py-8">No punches recorded yet</p>
        ) : (
          cardPunches.map((punch) => (
            <div key={punch.id} className="flex items-center gap-3 p-3 bg-modal-hover rounded-lg">
              <div className="flex-shrink-0">
                <Icon name="check" className="w-5 h-5 text-punch-primary" />
              </div>
              <div className="flex-1 text-sm text-modal-muted">
                {formatPunchTime(punch.created_at, punch.timezone || undefined)}
              </div>
              <button
                onClick={() => handleDelete(punch.id)}
                className="flex-shrink-0 p-1 text-modal-muted hover:text-danger transition-colors"
                title="Delete punch"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default CardHistoryModal;
