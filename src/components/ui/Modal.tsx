import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  size?: 'md' | 'lg' | 'xl';
  variant?: 'default' | 'system';
}

const sizeClass = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-3xl' };

const Modal = ({ children, onClose, title, size = 'md', variant = 'default' }: ModalProps) => {
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

  const variantClass = variant === 'system' ? 'system-font' : '';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/75"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`border border-ui-border text-modal-text rounded-xl shadow-xl ${sizeClass[size]} w-full p-4 sm:p-6 ${variantClass}`}
        style={{ backgroundColor: '#f8e6d0', color: '#3e4350' }}
        tabIndex={-1}
      >
        <h2 id="modal-title" className="text-2xl mb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
