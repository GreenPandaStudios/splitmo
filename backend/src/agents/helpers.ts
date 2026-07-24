export function getTimeOfDay(tick: number): string {
  const hour = (9 + Math.floor(tick / 10)) % 24;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${ampm}`;
}
