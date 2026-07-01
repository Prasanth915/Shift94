import { decrypt } from '../../../utils/encryption.js';

/**
 * Service orchestrating the publishing process via the Publish Engine.
 * Enforces the Service Layer Pattern, utilizing Repositories and PublisherManager via Dependency Injection.
 */
export class PublishService {
  /**
   * @param {ProjectRepository} projectRepository
   * @param {ConnectedAccountRepository} accountRepository
   * @param {PublishLogRepository} logRepository
   * @param {PublisherManager} publisherManager
   */
  constructor(projectRepository, accountRepository, logRepository, publisherManager) {
    this.projectRepository = projectRepository;
    this.accountRepository = accountRepository;
    this.logRepository = logRepository;
    this.publisherManager = publisherManager;
  }

  /**
   * Orchestrates project publishing to selected platforms.
   * @param {string} projectId - Project UUID
   * @param {string} userId - Owner UUID
   * @param {string[]} platforms - Array of platforms (e.g., ['LINKEDIN', 'GITHUB'])
   * @returns {Promise<object[]>} Array of publishing results
   */
  async publishProject(projectId, userId, platforms) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId !== userId) {
      const error = new Error('You do not have permission to publish this project.');
      error.statusCode = 403;
      throw error;
    }

    const results = [];

    for (const platform of platforms) {
      const platformUpper = platform.toUpperCase();

      // 1. Create a PENDING log entry
      const log = await this.logRepository.create({
        projectId,
        platform: platformUpper,
        status: 'PENDING',
      });

      try {
        // 2. Fetch connection and decrypt tokens
        const connection = await this.accountRepository.findByUserIdAndPlatform(userId, platformUpper);
        if (!connection || connection.status !== 'CONNECTED') {
          throw new Error(`Account not connected for platform: ${platform}`);
        }

        const decryptedAccount = {
          ...connection,
          accessToken: decrypt(connection.accessToken),
          refreshToken: connection.refreshToken ? decrypt(connection.refreshToken) : null,
        };

        // 3. Update status to PUBLISHING
        await this.logRepository.updateStatus(log.id, 'PUBLISHING');

        // 4. Delegate to PublisherManager
        const publishResult = await this.publisherManager.publish(
          platformUpper,
          project,
          decryptedAccount
        );

        // 5. Log success
        const finalLog = await this.logRepository.updateStatus(
          log.id,
          publishResult.success ? 'PUBLISHED' : 'FAILED',
          publishResult.externalUrl,
          publishResult.apiResponse
        );

        results.push(finalLog);
      } catch (err) {
        // Log failure
        const finalLog = await this.logRepository.updateStatus(
          log.id,
          'FAILED',
          null,
          { error: err.message }
        );
        results.push(finalLog);
      }
    }

    // Update project status to PUBLISHED if at least one platform succeeded
    const hasSuccess = results.some((r) => r.status === 'PUBLISHED');
    if (hasSuccess) {
      await this.projectRepository.update(projectId, { status: 'PUBLISHED' });
    }

    return results;
  }

  /**
   * Retries a failed publishing log entry.
   * @param {string} logId - PublishLog UUID
   * @param {string} userId - Owner UUID
   * @returns {Promise<object>} Resulting log entry
   */
  async retryPublish(logId, userId) {
    const log = await this.logRepository.findById(logId);
    if (!log) {
      const error = new Error('Publish log not found.');
      error.statusCode = 404;
      throw error;
    }

    const project = await this.projectRepository.findById(log.projectId);
    if (project.userId !== userId) {
      const error = new Error('You do not have permission to retry this publish.');
      error.statusCode = 403;
      throw error;
    }

    // Reset log to PENDING
    await this.logRepository.retryFailed(logId);

    // Re-run publishing logic
    const [result] = await this.publishProject(project.id, userId, [log.platform]);
    return result;
  }
}
