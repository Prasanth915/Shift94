import { GitHubPublisher } from './github.publisher.js';
import { LinkedInPublisher } from './linkedin.publisher.js';

/**
 * Decoupled Publisher Manager coordinating platform-specific publishing strategies.
 * Enforces the Strategy and Factory Patterns, registering publishers dynamically.
 */
export class PublisherManager {
  constructor() {
    this.publishers = new Map();
    // Auto-register supported platform publishers
    this.registerPublisher('GITHUB', new GitHubPublisher());
    this.registerPublisher('LINKEDIN', new LinkedInPublisher());
  }

  /**
   * Registers a publisher strategy for a platform.
   * @param {string} platform - LINKEDIN | GITHUB
   * @param {object} publisher - Class instance implementing the Publisher interface
   */
  registerPublisher(platform, publisher) {
    this.publishers.set(platform.toUpperCase(), publisher);
  }

  /**
   * Resolves and returns the publisher strategy for a platform.
   * @param {string} platform - LINKEDIN | GITHUB
   * @returns {object} The platform-specific publisher
   */
  getPublisher(platform) {
    const publisher = this.publishers.get(platform.toUpperCase());
    if (!publisher) {
      const error = new Error(`No publisher registered for platform: ${platform}`);
      error.statusCode = 400;
      throw error;
    }
    return publisher;
  }

  /**
   * Orchestrates the publishing execution to a target platform.
   * @param {string} platform - LINKEDIN | GITHUB
   * @param {object} project - Project DTO
   * @param {object} account - Decrypted ConnectedAccount
   * @returns {Promise<{ success: boolean, externalUrl: string|null, apiResponse: object }>}
   */
  async publish(platform, project, account) {
    const publisher = this.getPublisher(platform);
    return publisher.publish(project, account);
  }
}

// Export a singleton instance of the manager to be shared across the application
const publisherManager = new PublisherManager();
export default publisherManager;
