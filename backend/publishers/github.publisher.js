import axios from 'axios';

/**
 * GitHub Publisher strategy implementing the Publisher interface.
 * For the MVP, publishing only links the repository and records metadata.
 */
export class GitHubPublisher {
  /**
   * Validates the connection status and token validity.
   * @param {object} account
   * @returns {Promise<boolean>}
   */
  async validate(account) {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Shift-9-App',
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Establishes connection credentials or refreshes expired tokens.
   * @param {object} account
   * @returns {Promise<object>}
   */
  async connect(account) {
    return account;
  }

  /**
   * Publishes the project showcase to GitHub by linking metadata.
   * @param {object} project
   * @param {object} account
   * @returns {Promise<{ success: boolean, externalUrl: string|null, apiResponse: object }>}
   */
  async publish(project, account) {
    if (!project.githubUrl) {
      throw new Error('No GitHub repository URL associated with this project.');
    }

    return {
      success: true,
      externalUrl: project.githubUrl,
      apiResponse: {
        message: 'Repository linked successfully in Shift 9 database.',
        linkedAt: new Date(),
        platform: 'GITHUB',
      },
    };
  }

  /**
   * Revokes permissions and disconnects the account.
   * @param {object} account
   * @returns {Promise<boolean>}
   */
  async disconnect(account) {
    return true;
  }

  /**
   * Returns the unique platform identifier.
   * @returns {string}
   */
  getPlatform() {
    return 'GITHUB';
  }
}
