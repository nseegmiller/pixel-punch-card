import { HABIT_NAME_MAX_LENGTH } from './constants';

export const validateHabitName = (name: string): string | null => {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return 'Habit name cannot be empty';
  }

  if (trimmed.length > HABIT_NAME_MAX_LENGTH) {
    return `Habit name must be ${HABIT_NAME_MAX_LENGTH} characters or less`;
  }

  return null;
};
