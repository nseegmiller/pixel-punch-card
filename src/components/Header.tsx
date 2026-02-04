import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Button, Icon } from './ui';
import HistoryModal from './HistoryModal';

const Header = () => {
  const { user, signOut } = useAuth();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const { execute, loading } = useAsyncAction(handleSignOut);

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Pixel Punch Card
            </h1>
            <p className="text-sm text-gray-400">
              Track your habits, one punch at a time
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm text-gray-400">{user.email}</div>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="p-2 text-gray-400 hover:text-punch-primary hover:bg-gray-700 rounded-lg transition-colors"
                  title="View activity history"
                  aria-label="View activity history"
                >
                  <Icon name="settings" className="w-6 h-6" />
                </button>
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

      {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} />}
    </header>
  );
};

export default Header;
