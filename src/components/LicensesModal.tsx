import licenseText from '@/assets/fonts/fs-pixel-sans-unicode-regular-license.txt?raw';
import { Modal, Button } from './ui';

interface LicensesModalProps {
  onClose: () => void;
}

const LicensesModal = ({ onClose }: LicensesModalProps) => {
  return (
    <Modal title="Open Source Licenses" onClose={onClose} size="xl" variant="system">
      <div>
        <h3 className="mb-1">
          FS Pixel Sans Unicode Regular
        </h3>
        <p className="mb-2 text-modal-muted">
          Font by NZWStudios2024 via{' '}
          <a
            href="https://fontstruct.com/fontstructions/show/2606508"
            target="_blank"
            rel="noopener noreferrer"
            className="text-punch-primary hover:underline"
          >
            Fontstruct
          </a>
        </p>
        <pre
          className="whitespace-pre-wrap rounded p-3 overflow-y-auto bg-modal-hover text-modal-text"
          style={{ maxHeight: '60vh' }}
        >
          {licenseText}
        </pre>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default LicensesModal;
