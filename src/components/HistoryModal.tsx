import { Modal } from './ui';
import HistoryView from './HistoryView';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal = ({ onClose }: HistoryModalProps) => {
  return (
    <Modal onClose={onClose} title="Activity History">
      <div className="max-h-[70vh] overflow-y-auto">
        <HistoryView showDeleteButtons />
      </div>
    </Modal>
  );
};

export default HistoryModal;
