import config from '../../../config/index.js';
import { encrypt, decrypt } from '../../../utils/encryption.js';

/**
 * Service managing OAuth authorization flows and credential security.
 * Enforces the Service Layer Pattern, utilizing ConnectedAccountRepository via Dependency Injection.
 */
export class OAuthService {
  /**
   * @param {ConnectedAccountRepository} accountRepository
   */
  constructor(accountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * Generates the OAuth authorization URL for a target platform.
   * @param {string} platform - LINKEDIN | GITHUB
   * @param {string} state - Random CSRF security string
   * @returns {string} Redirect URL
   */
  getAuthUrl(platform, state) {
    const platformUpper = platform.toUpperCase();

    if (platformUpper === 'LINKEDIN') {
      const scope = encodeURIComponent('openid profile email w_member_social');
      const redirectUri = encodeURIComponent(config.linkedin.redirectUri);
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.linkedin.clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    }

    if (platformUpper === 'GITHUB') {
      const scope = encodeURIComponent('read:user repo');
      const redirectUri = encodeURIComponent(config.github.redirectUri);
      return `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    }

    const error = new Error(`OAuth not supported for platform: ${platform}`);
    error.statusCode = 400;
    throw error;
  }

  /**
   * Saves or updates a connected account with encrypted tokens.
   * @param {string} userId - Owner UUID
   * @param {object} accountData
   * @param {string} accountData.platform - LINKEDIN | GITHUB
   * @param {string} accountData.accessToken - Plain text token from OAuth provider
   * @param {string|null} [accountData.refreshToken] - Plain text refresh token
   * @param {string} accountData.username
   * @param {string} accountData.profileUrl
   * @returns {Promise<object>} Saved ConnectedAccount record
   */
  async saveConnection(userId, accountData) {
    const encryptedAccessToken = encrypt(accountData.accessToken);
    const encryptedRefreshToken = accountData.refreshToken
      ? encrypt(accountData.refreshToken)
      : null;

    const existingConnection = await this.accountRepository.findByUserIdAndPlatform(
      userId,
      accountData.platform
    );

    if (existingConnection) {
      return this.accountRepository.update(existingConnection.id, {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        username: accountData.username,
        profileUrl: accountData.profileUrl,
        status: 'CONNECTED',
      });
    }

    return this.accountRepository.create({
      userId,
      platform: accountData.platform,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      username: accountData.username,
      profileUrl: accountData.profileUrl,
      status: 'CONNECTED',
    });
  }

  /**
   * Disconnects a platform, removing credentials.
   * @param {string} userId - Owner UUID
   * @param {string} platform - LINKEDIN | GITHUB
   * @returns {Promise<boolean>}
   */
  async disconnect(userId, platform) {
    const connection = await this.accountRepository.findByUserIdAndPlatform(
      userId,
      platform.toUpperCase()
    );

    if (!connection) {
      const error = new Error(`No connected account found for platform: ${platform}`);
      error.statusCode = 404;
      throw error;
    }

    return this.accountRepository.delete(connection.id);
  }

  /**
   * Lists connected accounts for a user, stripping out the encrypted tokens for security.
   * @param {string} userId - Owner UUID
   * @returns {Promise<object[]>} Array of ConnectedAccount objects without credentials
   */
  async getConnectedAccounts(userId) {
    const accounts = await this.accountRepository.findByUserId(userId);
    return accounts.map((acc) => ({
      id: acc.id,
      platform: acc.platform,
      username: acc.username,
      profileUrl: acc.profileUrl,
      status: acc.status,
      createdAt: acc.createdAt,
    }));
  }

  /**
   * Retrieves a decrypted access token for publishing.
   * @param {string} userId - Owner UUID
   * @param {string} platform - LINKEDIN | GITHUB
   * @returns {Promise<string>} Decrypted access token
   */
  async getDecryptedAccessToken(userId, platform) {
    const connection = await this.accountRepository.findByUserIdAndPlatform(
      userId,
      platform.toUpperCase()
    );

    if (!connection || connection.status !== 'CONNECTED') {
      const error = new Error(`Platform ${platform} is not connected.`);
      error.statusCode = 400;
      throw error;
    }

    return decrypt(connection.accessToken);
  }
}
