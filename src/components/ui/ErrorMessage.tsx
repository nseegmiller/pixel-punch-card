interface ErrorMessageProps {
  message: string;
  variant?: 'inline' | 'block';
}

const ErrorMessage = ({ message, variant = 'inline' }: ErrorMessageProps) => {
  if (variant === 'block') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{message}</p>
      </div>
    );
  }

  return <p className="text-sm text-red-600">{message}</p>;
};

export default ErrorMessage;
