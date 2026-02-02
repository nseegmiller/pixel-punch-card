interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const LoadingSpinner = ({ size = 'md', message, fullScreen = false }: LoadingSpinnerProps) => {
  const spinner = (
    <div className="text-center">
      <div
        className={`inline-block animate-spin rounded-full border-b-2 border-punch-primary ${sizeStyles[size]}`}
      />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
