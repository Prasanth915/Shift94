import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants/index.js';

// ==========================================
// Date Helpers
// ==========================================

/**
 * Formats a date string to a human-readable format.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a date to a relative "time ago" string.
 * @param {string|Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) return `${interval}y ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval}mo ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval}d ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval}h ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval}m ago`;
  return 'just now';
};

// ==========================================
// String Helpers
// ==========================================

/**
 * Truncates a string to a specified length and appends ellipsis.
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
};

/**
 * Generates a URL-friendly slug from a string.
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ==========================================
// Array Helpers
// ==========================================

/**
 * Chunks an array into smaller arrays of a specified size.
 * @param {Array} array
 * @param {number} size
 * @returns {Array[]}
 */
export const chunkArray = (array, size) => {
  if (!array || size <= 0) return [];
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

/**
 * Filters unique items in an array.
 * @param {Array} array
 * @returns {Array}
 */
export const uniqueArray = (array) => {
  if (!array) return [];
  return [...new Set(array)];
};

// ==========================================
// File Helpers
// ==========================================

/**
 * Gets the file extension from a filename.
 * @param {string} filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
};

/**
 * Validates file size.
 * @param {number} sizeInBytes
 * @param {number} maxSizeInBytes
 * @returns {boolean}
 */
export const isValidFileSize = (sizeInBytes, maxSizeInBytes) => {
  return sizeInBytes <= maxSizeInBytes;
};

// ==========================================
// Response & Pagination Helpers
// ==========================================

/**
 * Standardizes API response formatting.
 * @param {boolean} success
 * @param {string} message
 * @param {object|null} data
 * @param {Array|null} errors
 * @returns {object}
 */
export const formatStandardResponse = (success, message, data = null, errors = null) => {
  return {
    success,
    message,
    data,
    errors,
  };
};

/**
 * Calculates SQL pagination offsets.
 * @param {number|string} page
 * @param {number|string} limit
 * @returns {{skip: number, take: number}}
 */
export const calculatePagination = (page, limit) => {
  const p = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return {
    skip: (p - 1) * l,
    take: l,
  };
};

// ==========================================
// Encryption Helper Interface
// ==========================================

/**
 * @interface EncryptionHelper
 */
export class EncryptionHelper {
  /**
   * Encrypts a string.
   * @param {string} text
   * @returns {string}
   */
  encrypt(text) {
    throw new Error('Method not implemented.');
  }

  /**
   * Decrypts an encrypted string.
   * @param {string} encryptedText
   * @returns {string}
   */
  decrypt(encryptedText) {
    throw new Error('Method not implemented.');
  }
}
