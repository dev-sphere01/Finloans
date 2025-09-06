/**
 * @fileOverview Token management utilities
 */
import { isTokenExpired } from './authService';

/**
 * Get token expiration time in human readable format
 * @param {number} exp - Token expiration timestamp
 * @returns {string} Human readable expiration time
 */
export const getTokenExpirationTime = (exp) => {
  if (!exp) return 'Unknown';
  
  const expirationDate = new Date(exp * 1000);
  return expirationDate.toLocaleString();
};

/**
 * Get time remaining until token expires
 * @param {number} exp - Token expiration timestamp
 * @returns {object} Time remaining object
 */
export const getTimeUntilExpiration = (exp) => {
  if (!exp) return { expired: true, timeLeft: 0, humanReadable: 'Expired', countdown: '00:00:00' };
  
  const now = Date.now();
  const expirationTime = exp * 1000;
  const timeLeft = expirationTime - now;
  
  if (timeLeft <= 0) {
    return { expired: true, timeLeft: 0, humanReadable: 'Expired', countdown: '00:00:00' };
  }
  
  const totalSeconds = Math.floor(timeLeft / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  
  // Create countdown format (H:MM:SS or HH:MM:SS)
  let countdown = '';
  if (days > 0) {
    // If more than 24 hours, show days + hours:minutes:seconds
    const remainingHours = hours % 24;
    countdown = `${days}d ${remainingHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // Show hours:minutes:seconds
    countdown = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  let humanReadable = '';
  if (days > 0) {
    humanReadable = `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    humanReadable = `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    humanReadable = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return {
    expired: false,
    timeLeft,
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    humanReadable,
    countdown
  };
};

/**
 * Check if token will expire soon (within specified minutes)
 * @param {number} exp - Token expiration timestamp
 * @param {number} warningMinutes - Minutes before expiration to warn (default: 5)
 * @returns {boolean} True if token will expire soon
 */
export const willExpireSoon = (exp, warningMinutes = 5) => {
  if (!exp) return true;
  
  const timeUntilExpiry = (exp * 1000) - Date.now();
  const warningTime = warningMinutes * 60 * 1000;
  
  return timeUntilExpiry <= warningTime && timeUntilExpiry > 0;
};

/**
 * Get token status
 * @param {number} exp - Token expiration timestamp
 * @returns {object} Token status object
 */
export const getTokenStatus = (exp) => {
  if (!exp) {
    return {
      status: 'invalid',
      message: 'No expiration time found',
      color: 'red'
    };
  }
  
  if (isTokenExpired(exp)) {
    return {
      status: 'expired',
      message: 'Token has expired',
      color: 'red'
    };
  }
  
  if (willExpireSoon(exp, 5)) {
    return {
      status: 'expiring',
      message: 'Token will expire soon',
      color: 'orange'
    };
  }
  
  if (willExpireSoon(exp, 30)) {
    return {
      status: 'warning',
      message: 'Token will expire within 30 minutes',
      color: 'yellow'
    };
  }
  
  return {
    status: 'valid',
    message: 'Token is valid',
    color: 'green'
  };
};

/**
 * Format token expiration for display
 * @param {number} exp - Token expiration timestamp
 * @returns {string} Formatted expiration display
 */
export const formatTokenExpiration = (exp) => {
  if (!exp) return 'No expiration data';
  
  const { expired, humanReadable } = getTimeUntilExpiration(exp);
  const expirationTime = getTokenExpirationTime(exp);
  
  if (expired) {
    return `Expired at ${expirationTime}`;
  }
  
  return `Expires in ${humanReadable} (${expirationTime})`;
};

export default {
  getTokenExpirationTime,
  getTimeUntilExpiration,
  willExpireSoon,
  getTokenStatus,
  formatTokenExpiration
};