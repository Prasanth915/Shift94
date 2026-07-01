import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../constants/index.js';

// ==========================================
// Regex Patterns
// ==========================================
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/[\w\d-._~:/?#[\]@!$&'()*+,;=]*)?$/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ==========================================
// Basic Validator Functions
// ==========================================

/**
 * Checks if a value is a valid email address.
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
};

/**
 * Checks if a value is a valid URL.
 * @param {string} url
 * @returns {boolean}
 */
export const validateUrl = (url) => {
  if (!url) return false;
  return URL_REGEX.test(url);
};

/**
 * Checks if a value is a valid UUID v4.
 * @param {string} uuid
 * @returns {boolean}
 */
export const validateUuid = (uuid) => {
  if (!uuid) return false;
  return UUID_REGEX.test(uuid);
};

/**
 * Validates password strength (uppercase, lowercase, number, symbol).
 * @param {string} password
 * @returns {boolean}
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUppercase && hasLowercase && hasDigit && hasSpecial;
};

// ==========================================
// Object Validation Schemas (Framework-Independent)
// ==========================================

/**
 * Validates registration payload.
 * @param {object} data
 * @returns {string[] | null} Array of error messages, or null if valid
 */
export const validateRegisterInput = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required.');
  }
  if (!validateEmail(data.email)) {
    errors.push('A valid email address is required.');
  }
  if (!validatePasswordStrength(data.password)) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain uppercase, lowercase, numbers, and special characters.`);
  }
  return errors.length > 0 ? errors : null;
};

/**
 * Validates login payload.
 * @param {object} data
 * @returns {string[] | null} Array of error messages, or null if valid
 */
export const validateLoginInput = (data) => {
  const errors = [];
  if (!validateEmail(data.email)) {
    errors.push('A valid email address is required.');
  }
  if (!data.password || data.password.length === 0) {
    errors.push('Password is required.');
  }
  return errors.length > 0 ? errors : null;
};

/**
 * Validates project creation payload.
 * @param {object} data
 * @returns {string[] | null} Array of error messages, or null if valid
 */
export const validateProjectInput = (data) => {
  const errors = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Project title is required.');
  }
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Project description is required.');
  }
  if (data.githubUrl && !validateUrl(data.githubUrl)) {
    errors.push('Invalid GitHub URL format.');
  }
  if (data.demoUrl && !validateUrl(data.demoUrl)) {
    errors.push('Invalid Live Demo URL format.');
  }
  if (!data.techStack || !Array.isArray(data.techStack) || data.techStack.length === 0) {
    errors.push('At least one technology is required in the tech stack.');
  }
  return errors.length > 0 ? errors : null;
};
