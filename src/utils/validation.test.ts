import { describe, it, expect } from 'vitest';
import { validateHabitName } from './validation';

describe('validateHabitName', () => {
  it('should return null for valid habit names', () => {
    expect(validateHabitName('Morning Exercise')).toBeNull();
    expect(validateHabitName('Read 30 minutes')).toBeNull();
    expect(validateHabitName('A')).toBeNull();
  });

  it('should reject empty names', () => {
    expect(validateHabitName('')).toBe('Habit name cannot be empty');
    expect(validateHabitName('   ')).toBe('Habit name cannot be empty');
  });

  it('should reject names over 100 characters', () => {
    const longName = 'a'.repeat(101);
    expect(validateHabitName(longName)).toBe('Habit name must be 100 characters or less');
  });

  it('should accept names exactly 100 characters', () => {
    const maxName = 'a'.repeat(100);
    expect(validateHabitName(maxName)).toBeNull();
  });

  it('should trim whitespace before validation', () => {
    expect(validateHabitName('  Valid Name  ')).toBeNull();
  });
});
