/**
 * Returns an ISO date (YYYY-MM-DD) in the local timezone.
 * Using local time prevents the "yesterday" bug around UTC midnight.
 */
export const todayIso = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
