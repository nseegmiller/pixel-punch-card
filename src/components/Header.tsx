import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoggingOut(false);
    }
  };

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
                <div className="text-sm text-gray-600">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                >
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
