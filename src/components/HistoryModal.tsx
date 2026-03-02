import { Modal } from './ui';
import HistoryView from './HistoryView';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal = ({ onClose }: HistoryModalProps) => {
  return (
    <Modal onClose={onClose} title="History" size="lg">
      <div className="max-h-[70vh] overflow-y-auto">
        <HistoryView />
      </div>
    </Modal>
  );
};

export default HistoryModal;
