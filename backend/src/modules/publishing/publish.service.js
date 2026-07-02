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
    this.activeLocks = new Set();
  }

  /**
   * Orchestrates project publishing to selected platforms.
   * @param {string} projectId - Project UUID
   * @param {string} userId - Owner UUID
   * @param {string[]} platforms - Array of platforms (e.g., ['LINKEDIN', 'GITHUB'])
   * @param {string|null} retryLogId - Optional log UUID to reuse during retry
   * @returns {Promise<object[]>} Array of publishing results
   */
  async publishProject(projectId, userId, platforms, retryLogId = null) {
    console.info('[PUBLISH_LOG] Request received', { projectId, userId, platforms, retryLogId });

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      console.error('[PUBLISH_LOG] Validation failure: Project not found', { projectId });
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    if (project.userId !== userId) {
      console.error('[PUBLISH_LOG] Validation failure: Unauthorized access', { projectId, userId });
      const error = new Error('You do not have permission to publish this project.');
      error.statusCode = 403;
      throw error;
    }

    // Validate GITHUB publishing requirements upfront before creating any logs
    if (platforms.map((p) => p.toUpperCase()).includes('GITHUB')) {
      if (!project.githubUrl || !project.sourceRepository) {
        console.error('[PUBLISH_LOG] Validation failure: Missing GitHub repository association', {
          projectId,
          githubUrl: project.githubUrl,
          hasSourceRepo: !!project.sourceRepository,
        });
        const error = new Error('Missing GitHub repository association. Link a repository before publishing.');
        error.statusCode = 400;
        throw error;
      }
    }

    const userAccounts = await this.accountRepository.findByUserId(userId);
    const linkedinAccount = userAccounts.find(
      (acc) => acc.platform === 'LINKEDIN' && acc.status === 'CONNECTED'
    );
    if (linkedinAccount) {
      project.linkedinUrl = linkedinAccount.profileUrl;
    }

    const results = [];

    for (const platform of platforms) {
      const platformUpper = platform.toUpperCase();
      const lockKey = `${projectId}-${platformUpper}`;

      // 1. Concurrency Check (In-Memory App Lock)
      if (this.activeLocks.has(lockKey)) {
        console.warn('[PUBLISH_LOG] Conflict: publishing is already in progress (in-memory)', {
          projectId,
          platform: platformUpper,
        });
        const error = new Error('A publish operation is already in progress for this project.');
        error.statusCode = 409;
        throw error;
      }

      // Synchronously acquire lock to block concurrent requests
      this.activeLocks.add(lockKey);

      let log;

      try {
        if (retryLogId) {
          // Retry flow: load existing log
          log = await this.logRepository.findById(retryLogId);
          if (!log || log.projectId !== projectId || log.platform !== platformUpper) {
            const error = new Error('Invalid retry log association.');
            error.statusCode = 400;
            throw error;
          }
          console.info('[PUBLISH_LOG] Reusing failed log for retry', { logId: log.id });
        } else {
          // Standard flow: check for active publish logs in database
          const activeLog = await this.logRepository.findActiveLog(projectId, platformUpper);

          if (activeLog) {
            const timeElapsed = Date.now() - new Date(activeLog.createdAt).getTime();
            const isStale = timeElapsed > 5 * 60 * 1000; // 5 minutes

            if (activeLog.status === 'PUBLISHING' && !isStale) {
              console.warn('[PUBLISH_LOG] Conflict: publishing is already in progress (database)', {
                projectId,
                platform: platformUpper,
                logId: activeLog.id,
              });
              const error = new Error('A publish operation is already in progress for this project.');
              error.statusCode = 409;
              throw error;
            }

            if (activeLog.status === 'PENDING' && !isStale) {
              console.info('[PUBLISH_LOG] Reusing existing PENDING log', { logId: activeLog.id });
              log = activeLog;
            } else {
              // Stale attempt - fail it first
              console.warn('[PUBLISH_LOG] Failing stale publish log', { logId: activeLog.id });
              await this.logRepository.updateStatus(
                activeLog.id,
                'FAILED',
                null,
                { error: 'Publish operation timed out or process was aborted.' }
              );
              
              // Create a new PENDING log
              log = await this.logRepository.create({
                projectId,
                platform: platformUpper,
                status: 'PENDING',
              });
            }
          } else {
            // Create new PENDING log
            log = await this.logRepository.create({
              projectId,
              platform: platformUpper,
              status: 'PENDING',
            });
          }
        }

        // Try to acquire the publish lock atomically in database
        await this.logRepository.acquirePublishLock(log.id);
        console.info('[PUBLISH_LOG] Lock acquired', { logId: log.id, projectId, platform: platformUpper });
      } catch (err) {
        this.activeLocks.delete(lockKey);
        console.warn('[PUBLISH_LOG] Lock acquisition failure', { projectId, platform: platformUpper, error: err.message });
        throw err;
      }

      try {
        const connection = await this.accountRepository.findByUserIdAndPlatform(userId, platformUpper);
        if (!connection || connection.status !== 'CONNECTED') {
          throw new Error(`Account not connected for platform: ${platform}`);
        }

        const decryptedAccount = {
          ...connection,
          accessToken: decrypt(connection.accessToken),
          refreshToken: connection.refreshToken ? decrypt(connection.refreshToken) : null,
        };

        // Delegate to PublisherManager
        const publishResult = await this.publisherManager.publish(
          platformUpper,
          project,
          decryptedAccount
        );

        // Release lock / log success or failure
        const finalLog = await this.logRepository.updateStatus(
          log.id,
          publishResult.success ? 'PUBLISHED' : 'FAILED',
          publishResult.externalUrl,
          publishResult.apiResponse
        );

        this.activeLocks.delete(lockKey);
        console.info('[PUBLISH_LOG] Lock released', {
          logId: log.id,
          projectId,
          platform: platformUpper,
          status: finalLog.status,
        });

        if (publishResult.success) {
          console.info('[PUBLISH_LOG] Publish success', { projectId, platform: platformUpper, externalUrl: publishResult.externalUrl });
        } else {
          console.error('[PUBLISH_LOG] Publish failure', { projectId, platform: platformUpper, error: publishResult.apiResponse });
        }

        results.push(finalLog);
      } catch (err) {
        // Release lock on failure
        this.activeLocks.delete(lockKey);
        const finalLog = await this.logRepository.updateStatus(
          log.id,
          'FAILED',
          null,
          { error: err.message }
        );

        console.error('[PUBLISH_LOG] Lock released due to execution failure', {
          logId: log.id,
          projectId,
          platform: platformUpper,
          status: 'FAILED',
          error: err.message,
        });

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

    // Check if there is an active publish log for this project/platform to prevent concurrent retries
    const activeLog = await this.logRepository.findActiveLog(project.id, log.platform);
    if (activeLog && activeLog.id !== logId) {
      const timeElapsed = Date.now() - new Date(activeLog.createdAt).getTime();
      const isStale = timeElapsed > 5 * 60 * 1000;
      if (!isStale) {
        const error = new Error('A publish operation is already in progress for this project.');
        error.statusCode = 409;
        throw error;
      }
    }

    // Reset log to PENDING
    await this.logRepository.retryFailed(logId);

    // Re-run publishing logic reusing the exact same log ID
    const [result] = await this.publishProject(project.id, userId, [log.platform], logId);
    return result;
  }
}
