import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-punch-primary text-white hover:bg-indigo-700 focus:ring-punch-primary',
  secondary: 'text-gray-200 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (loadingText || 'Loading...') : children}
    </button>
  );
};

export default Button;
