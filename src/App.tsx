import { AuthProvider } from './context/AuthContext';
import { HabitsProvider } from './context/HabitsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard>
          <HabitsProvider>
            <div className="min-h-screen bg-gray-900">
              <Header />

              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <HabitList />
                <AddHabitForm />
              </main>
            </div>
          </HabitsProvider>
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
