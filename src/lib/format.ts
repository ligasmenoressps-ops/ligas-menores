export function formatMatchDate(date: Date | string, time?: Date | string | null, formatType: 'short' | 'full' = 'full'): string {
  const dateObj = new Date(date);
  const timeObj = time ? new Date(time) : null;

  if (formatType === 'short') {
    return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  if (timeObj) {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timeObj);
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(dateObj);
}
