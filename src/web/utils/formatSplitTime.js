export const formatSplitTime = (start_hour, start_minute) => {
  const formattedStartHour = start_hour.toString().padStart(2, '0');
  const formattedStartMinute = start_minute.toString().padStart(2, '0');
  return `${formattedStartHour}:${formattedStartMinute}`;
};
