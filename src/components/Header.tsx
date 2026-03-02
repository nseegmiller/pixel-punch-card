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
    <header className="bg-ui-surface shadow-sm border-b border-ui-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-arcade text-ui-primary">
              Pixel Punch Card
            </h1>
            <p className="text-sm text-ui-secondary">
              Track your habits, one punch at a time
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm text-ui-secondary">{user.email}</div>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="p-2 text-ui-muted hover:text-punch-primary hover:bg-ui-raised rounded-lg transition-colors"
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
