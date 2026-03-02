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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-arcade text-ui-primary truncate">
            Pixel Punch Card
          </h1>

          {user && (
            <div className="flex items-center gap-2 shrink-0">
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
                loadingText="..."
              >
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>

      {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} />}
    </header>
  );
};

export default Header;
