export const createDateTimeFromStrings = (dateObj: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(dateObj);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};