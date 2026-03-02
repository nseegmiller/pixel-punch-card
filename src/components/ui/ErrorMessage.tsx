interface ErrorMessageProps {
  message: string;
  variant?: 'inline' | 'block';
}

const ErrorMessage = ({ message, variant = 'inline' }: ErrorMessageProps) => {
  if (variant === 'block') {
    return (
      <div className="bg-danger/20 border border-danger rounded-lg p-4">
        <p className="text-danger">{message}</p>
      </div>
    );
  }

  return <p className="text-sm text-danger">{message}</p>;
};

export default ErrorMessage;
