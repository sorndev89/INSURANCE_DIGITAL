export const useFormat = () => {
  const date = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return new Intl.DateTimeFormat('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(parsed)
  }

  const dateTime = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return new Intl.DateTimeFormat('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed)
  }

  const number = (value) =>
    new Intl.NumberFormat('lo-LA').format(Number(value || 0))

  return { date, dateTime, number }
}
