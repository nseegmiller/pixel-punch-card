export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatPunchTime = (timestamp: string, timezone?: string): string => {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};
