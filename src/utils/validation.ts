export const validateHabitName = (name: string): string | null => {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return 'Habit name cannot be empty';
  }

  if (trimmed.length > 100) {
    return 'Habit name must be 100 characters or less';
  }

  return null;
};
