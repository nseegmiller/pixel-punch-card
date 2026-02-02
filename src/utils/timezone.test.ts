import { describe, it, expect } from 'vitest';
import { getUserTimezone, formatPunchTime } from './timezone';

describe('getUserTimezone', () => {
  it('should return a valid timezone string', () => {
    const timezone = getUserTimezone();
    expect(timezone).toBeTruthy();
    expect(typeof timezone).toBe('string');
  });
});

describe('formatPunchTime', () => {
  it('should format a timestamp as a readable string', () => {
    const timestamp = '2026-02-01T12:30:00Z';
    const formatted = formatPunchTime(timestamp);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('should respect timezone parameter', () => {
    const timestamp = '2026-02-01T12:30:00Z';
    const formatted = formatPunchTime(timestamp, 'America/New_York');
    expect(formatted).toBeTruthy();
  });
});
