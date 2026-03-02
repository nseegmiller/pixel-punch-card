import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HabitsProvider } from './context/HabitsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';
import LicensesModal from './components/LicensesModal';

function App() {
  const [showLicenses, setShowLicenses] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard>
          <HabitsProvider>
            <div className="min-h-screen bg-ui-bg flex flex-col">
              <Header />

              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <HabitList />
                <AddHabitForm />
              </main>

              <footer className="border-t border-ui-border py-3 px-4">
                <div className="max-w-7xl mx-auto flex justify-end">
                  <button
                    onClick={() => setShowLicenses(true)}
                    className="text-xs text-ui-muted hover:text-ui-secondary transition-colors"
                  >
                    Open Source Licenses
                  </button>
                </div>
              </footer>
            </div>

            {showLicenses && <LicensesModal onClose={() => setShowLicenses(false)} />}
          </HabitsProvider>
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
