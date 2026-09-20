/**
 * Shifts a time string (12h or 24h format) by deltaMinutes
 * e.g., "10:15 AM" + 15 -> "10:30 AM"
 */
export const shiftTimeString = (timeStr, deltaMinutes) => {
  if (!timeStr || !deltaMinutes) return timeStr || '';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const is12Hour = Boolean(match[3]);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (is12Hour) {
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  }

  let totalMinutes = hours * 60 + minutes + Number(deltaMinutes);
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const newHours24 = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  const mm = newMinutes.toString().padStart(2, '0');

  if (is12Hour) {
    const newMeridiem = newHours24 >= 12 ? 'PM' : 'AM';
    let newHours12 = newHours24 % 12;
    if (newHours12 === 0) newHours12 = 12;
    return `${newHours12.toString().padStart(2, '0')}:${mm} ${newMeridiem}`;
  } else {
    return `${newHours24.toString().padStart(2, '0')}:${mm}`;
  }
};
