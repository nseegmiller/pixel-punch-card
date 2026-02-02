import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from './ui';
import LoginPage from './LoginPage';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

export default AuthGuard;
