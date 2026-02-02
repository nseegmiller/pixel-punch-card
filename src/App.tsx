import { AuthProvider } from './context/AuthContext';
import { HabitsProvider } from './context/HabitsContext';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';
import UndoButton from './components/UndoButton';
import HistoryView from './components/HistoryView';

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <HabitsProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AddHabitForm />
              <HabitList />

              <div className="mt-8">
                <HistoryView />
              </div>
            </main>

            <UndoButton />
          </div>
        </HabitsProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
