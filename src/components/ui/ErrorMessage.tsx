interface ErrorMessageProps {
  message: string;
  variant?: 'inline' | 'block';
}

const ErrorMessage = ({ message, variant = 'inline' }: ErrorMessageProps) => {
  if (variant === 'block') {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
        <p className="text-red-300">{message}</p>
      </div>
    );
  }

  return <p className="text-sm text-red-400">{message}</p>;
};

export default ErrorMessage;
