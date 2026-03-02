import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
}

const Modal = ({ children, onClose, title }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    return () => { previousActiveElement.current?.focus(); };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="border rounded-xl shadow-xl max-w-md w-full p-6"
        style={{ backgroundColor: '#312234', borderColor: '#5b596d' }}
        tabIndex={-1}
      >
        <h2 id="modal-title" className="text-2xl font-bold text-ui-primary mb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
