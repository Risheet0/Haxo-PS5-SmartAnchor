/**
 * Formats a given number of seconds into MM:SS string
 */
export const formatTimer = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Returns a deterministic, stylized Dicebear avatar URL for speakers without uploaded photos
 */
export const getSpeakerAvatar = (speakerName, customUrl = null) => {
  if (customUrl && customUrl.trim()) return customUrl;
  const seed = encodeURIComponent(speakerName || 'Anchor');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Parses script lines to detect stage cues vs vocal speech lines
 */
export const parseStageScript = (rawText = '') => {
  return rawText.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return { id: idx, type: 'empty', content: '' };
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return {
        id: idx,
        type: 'cue',
        content: trimmed.slice(1, -1).replace(/^⚡\s*/, '')
      };
    }
    return {
      id: idx,
      type: 'speech',
      content: line
    };
  });
};

/**
 * Shifts a time string (12h or 24h) by deltaMinutes
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

  let totalMinutes = hours * 60 + minutes + deltaMinutes;
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

