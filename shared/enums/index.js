/**
 * Supported platforms in the application.
 */
export const Platform = {
  LINKEDIN: 'LINKEDIN',
  GITHUB: 'GITHUB',
  INSTAGRAM: 'INSTAGRAM',
  PORTFOLIO: 'PORTFOLIO'
};

/**
 * Lifecycle status of a platform publishing request.
 */
export const PublishStatus = {
  PENDING: 'PENDING',
  PUBLISHING: 'PUBLISHING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

/**
 * Lifecycle status of a project.
 */
export const ProjectStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
};

/**
 * Connection status of an OAuth account.
 */
export const ConnectionStatus = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  EXPIRED: 'EXPIRED'
};

/**
 * Access levels within the application.
 */
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

/**
 * OAuth Providers.
 */
export const OAuthProvider = {
  LINKEDIN: 'LINKEDIN',
  GITHUB: 'GITHUB'
};

/**
 * Token Types.
 */
export const TokenType = {
  ACCESS: 'ACCESS',
  REFRESH: 'REFRESH',
  BEARER: 'BEARER'
};

/**
 * File upload category.
 */
export const FileType = {
  IMAGE: 'IMAGE',
  AVATAR: 'AVATAR'
};

/**
 * Node environments.
 */
export const Environment = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};
