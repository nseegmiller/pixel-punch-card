import { useHabitsContext } from '@/context/HabitsContext';
import { LoadingSpinner, ErrorMessage } from './ui';
import HabitCard from './HabitCard';

const HabitList = () => {
  const { habits, loading, error } = useHabitsContext();

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner message="Loading habits..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} variant="block" />;
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-ui-primary mb-2">No habits yet</h3>
        <p className="text-ui-secondary">Create your first habit to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
};

export default HabitList;
