import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-ui-bg p-4">
          <div className="max-w-md w-full bg-ui-surface rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-ui-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-ui-secondary mb-6">
              An unexpected error occurred. Please try again.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-600 mb-6 font-mono bg-red-50 p-3 rounded">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.handleReset}>Try Again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
