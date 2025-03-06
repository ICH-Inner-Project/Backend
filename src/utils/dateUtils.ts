
export function addTimeToDate(date: string | null): Date | null {
  if (!date) return null;

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }
  const now = new Date();
  parsedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);

  return parsedDate;
}
