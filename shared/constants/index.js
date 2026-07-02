// ==========================================
// Application Constants
// ==========================================
export const APP_NAME = 'Shift94';
export const APP_VERSION = '1.0.0';

// ==========================================
// Platform Constants
// ==========================================
export const SUPPORTED_PLATFORMS = ['LINKEDIN', 'GITHUB'];
export const UPCOMING_PLATFORMS = ['INSTAGRAM', 'PORTFOLIO'];

// ==========================================
// Authentication & JWT Constants
// ==========================================
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const JWT_EXPIRY_DEFAULT = '7d';
export const BCRYPT_SALT_ROUNDS = 12;

// ==========================================
// File Upload Constants
// ==========================================
export const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// ==========================================
// API & Pagination Constants
// ==========================================
export const API_V1_PREFIX = '/api/v1';
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// ==========================================
// Standard Success Messages
// ==========================================
export const SuccessMessages = {
  REGISTRATION_SUCCESS: 'Account created successfully. Welcome to Shift94!',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully.',
  PROJECT_CREATED: 'Project created and publishing initiated.',
  PROJECT_UPDATED: 'Project updated successfully.',
  PROJECT_DELETED: 'Project deleted successfully.',
  OAUTH_CONNECT_SUCCESS: 'Account connected successfully.',
  OAUTH_DISCONNECT_SUCCESS: 'Account disconnected successfully.',
  PUBLISH_TRIGGERED: 'Publishing process triggered successfully.',
};

// ==========================================
// Standard Error Messages
// ==========================================
export const ErrorMessages = {
  // Authentication Errors
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  AUTH_INVALID_TOKEN: 'Invalid or expired session token.',
  AUTH_FAILED: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  PASSWORD_TOO_WEAK: 'Password must be stronger (include uppercase, lowercase, numbers, and symbols).',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN_ACCESS: 'You do not have permission to perform this action.',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',

  // Validation Errors
  VALIDATION_ERROR: 'One or more fields failed validation.',
  INVALID_UUID: 'Invalid identifier format.',
  INVALID_URL: 'Please enter a valid URL.',
  TITLE_REQUIRED: 'Project title is required.',
  DESCRIPTION_REQUIRED: 'Project description is required.',
  TECH_STACK_REQUIRED: 'At least one technology must be specified in the tech stack.',

  // File Upload Errors
  FILE_TOO_LARGE: 'File size exceeds the allowed limit.',
  FILE_INVALID_TYPE: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
  FILE_UPLOAD_FAILED: 'Failed to upload file.',

  // Platform & OAuth Errors
  PLATFORM_UNSUPPORTED: 'This platform is not supported in the current version.',
  PLATFORM_COMING_SOON: 'This platform is coming soon and cannot be selected.',
  OAUTH_FAILED: 'Failed to authenticate with the external platform.',
  OAUTH_CSRF_FAILED: 'Security validation failed (CSRF state mismatch). Please try again.',
  ACCOUNT_NOT_CONNECTED: 'Please connect your account before publishing.',
  PUBLISH_FAILED: 'Failed to publish to the selected platform.',
};
