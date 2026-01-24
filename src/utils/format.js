/**
 * Formatting utilities for dates, currency, phone numbers, etc.
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time', 'datetime'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
  };

  return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Format phone number to US format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }

  return phone;
};

/**
 * Format currency to USD
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format enum value to readable text
 * @param {string} enumValue - Enum value (e.g., 'COMPLETED')
 * @returns {string} Readable text (e.g., 'Completed')
 */
export const formatEnumValue = (enumValue) => {
  if (!enumValue) return '';

  return enumValue
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get time difference from now
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time (e.g., '2 hours ago')
 */
export const getTimeAgo = (date) => {
  if (!date) return '';

  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [key, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `${interval} ${key}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
};

/**
 * Format blood group
 * @param {string} bloodGroup - Blood group enum (e.g., 'O_POSITIVE')
 * @returns {string} Formatted blood group (e.g., 'O+')
 */
export const formatBloodGroup = (bloodGroup) => {
  if (!bloodGroup) return '';

  return bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-');
};

/**
 * Format gender
 * @param {string} gender - Gender enum (e.g., 'MALE')
 * @returns {string} Formatted gender (e.g., 'Male')
 */
export const formatGender = (gender) => {
  if (!gender) return '';

  return gender.charAt(0) + gender.slice(1).toLowerCase();
};

const formatUtils = {
  formatDate,
  formatPhoneNumber,
  formatCurrency,
  formatFileSize,
  capitalize,
  truncate,
  formatEnumValue,
  getTimeAgo,
  formatBloodGroup,
  formatGender,
};

export default formatUtils;

