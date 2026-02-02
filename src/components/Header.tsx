import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Button } from './ui';

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const { execute, loading } = useAsyncAction(handleSignOut);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pixel Punch Card
            </h1>
            <p className="text-sm text-gray-600">
              Track your habits, one punch at a time
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm text-gray-600">{user.email}</div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={execute}
                  loading={loading}
                  loadingText="Signing out..."
                >
                  Sign out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
