/**
 * Date Utility Functions
 * Robust date parsing and formatting for queue management
 */

/**
 * Parse various date formats into Date object
 * @param {string|number|Date|null|undefined} value - Date value to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (value) => {
  if (!value) return null;

  try {
    let date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      // Epoch milliseconds
      date = new Date(value);
    } else if (typeof value === 'string') {
      // ISO string or other parseable format
      date = new Date(value);
    } else {
      return null;
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch (error) {
    console.error('Date parse error:', error, 'Value:', value);
    return null;
  }
};

/**
 * Format date and time for display
 * @param {string|number|Date|null} value - Date value
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date/time or fallback
 */
export const formatDateTime = (value, options = {}) => {
  const {
    fallback = '--',
    dateStyle = 'medium',
    timeStyle = 'short',
    showDate = true,
    showTime = true,
  } = options;

  const date = parseDate(value);
  if (!date) return fallback;

  try {
    if (showDate && showTime) {
      return date.toLocaleString('en-US', {
        dateStyle,
        timeStyle,
      });
    } else if (showDate) {
      return date.toLocaleDateString('en-US', {
        dateStyle,
      });
    } else if (showTime) {
      return date.toLocaleTimeString('en-US', {
        timeStyle,
      });
    }
  } catch (error) {
    console.error('Date format error:', error);
    return fallback;
  }

  return fallback;
};

/**
 * Format time only (HH:mm)
 * @param {string|number|Date|null} value - Date value
 * @returns {string} Formatted time or "--"
 */
export const formatTime = (value) => {
  const date = parseDate(value);
  if (!date) return '--';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date only (dd MMM yyyy)
 * @param {string|number|Date|null} value - Date value
 * @returns {string} Formatted date or "--"
 */
export const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return '--';

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Compute wait time in minutes
 * @param {string|number|Date|null} startTime - Start time (joinedAt)
 * @param {string|number|Date|null} endTime - End time (defaults to now)
 * @returns {number|null} Minutes waited or null if invalid
 */
export const computeWaitMinutes = (startTime, endTime = null) => {
  const start = parseDate(startTime);
  if (!start) return null;

  const end = endTime ? parseDate(endTime) : new Date();
  if (!end) return null;

  const diffMs = end.getTime() - start.getTime();
  const minutes = Math.floor(diffMs / 60000);

  return Math.max(0, minutes);
};

/**
 * Format wait time for display
 * @param {number|null} minutes - Minutes to format
 * @returns {string} Formatted wait time (e.g., "15m", "1h 30m")
 */
export const formatWaitTime = (minutes) => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '--';
  }

  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Get relative time (e.g., "2 minutes ago", "just now")
 * @param {string|number|Date|null} value - Date value
 * @returns {string} Relative time string
 */
export const getRelativeTime = (value) => {
  const date = parseDate(value);
  if (!date) return '--';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

/**
 * Check if date is today
 * @param {string|number|Date|null} value - Date value
 * @returns {boolean} True if date is today
 */
export const isToday = (value) => {
  const date = parseDate(value);
  if (!date) return false;

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
