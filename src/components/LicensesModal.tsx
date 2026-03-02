import licenseText from '@/assets/fonts/fs-pixel-sans-unicode-regular-license.txt?raw';
import { Modal } from './ui';

interface LicensesModalProps {
  onClose: () => void;
}

const LicensesModal = ({ onClose }: LicensesModalProps) => {
  return (
    <Modal title="Open Source Licenses" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-ui-primary mb-1">
            FS Pixel Sans Unicode Regular
          </h3>
          <p className="text-xs text-ui-secondary mb-2">
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
          <pre className="text-xs text-ui-secondary whitespace-pre-wrap font-mono bg-ui-bg rounded p-3 max-h-80 overflow-y-auto">
            {licenseText}
          </pre>
        </div>
      </div>
    </Modal>
  );
};

export default LicensesModal;
