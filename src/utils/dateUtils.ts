// Enhanced date normalization and comparison functions
export const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  // Set to midnight local time to remove time component
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isSameDay = (date1: Date | string | undefined, date2: Date | string | undefined): boolean => {
  if (!date1 || !date2) return false;
  
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}; 