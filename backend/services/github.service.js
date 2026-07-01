import axios from 'axios';

/**
 * Service handling all direct HTTP requests to the GitHub REST API.
 * Isolates third-party API details from the rest of the application.
 */
export class GitHubService {
  /**
   * Exchanges an OAuth authorization code for an access token.
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {string} code
   * @param {string} redirectUri
   * @returns {Promise<{ accessToken: string }>}
   */
  async getAccessToken(clientId, clientSecret, code, redirectUri) {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (response.data.error) {
      const error = new Error(`GitHub OAuth error: ${response.data.error_description || response.data.error}`);
      error.statusCode = 400;
      throw error;
    }

    return {
      accessToken: response.data.access_token,
    };
  }

  /**
   * Fetches the authenticated user's GitHub profile.
   * @param {string} accessToken - Plain text access token
   * @returns {Promise<{ username: string, profileUrl: string }>}
   */
  async getUserProfile(accessToken) {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Shift-9-App',
      },
    });

    return {
      username: response.data.login,
      profileUrl: response.data.html_url,
    };
  }

  /**
   * Fetches the repositories owned by the authenticated user.
   * @param {string} accessToken - Plain text access token
   * @returns {Promise<object[]>} Array of repository metadata
   */
  async getUserRepositories(accessToken) {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Shift-9-App',
      },
      params: {
        sort: 'updated',
        per_page: 100,
        type: 'owner',
      },
    });

    return response.data.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description || '',
      defaultBranch: repo.default_branch,
      language: repo.language || 'Unknown',
      visibility: repo.private ? 'private' : 'public',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));
  }

  /**
   * Verifies if repository exists and user has push/admin permissions.
   * @param {string} accessToken
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<boolean>}
   */
  async checkRepositoryAccess(accessToken, owner, repo) {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Shift-9-App',
        },
      });

      const permissions = response.data.permissions;
      if (!permissions || (!permissions.push && !permissions.admin)) {
        const error = new Error('You do not have push permissions for this repository.');
        error.statusCode = 403;
        throw error;
      }
      return true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          const error = new Error('Repository not found on GitHub.');
          error.statusCode = 404;
          throw error;
        }
        if (err.response.status === 401) {
          const error = new Error('Invalid or expired GitHub token.');
          error.statusCode = 401;
          throw error;
        }
        if (err.response.status === 403) {
          const error = new Error('Access to repository forbidden or missing permissions.');
          error.statusCode = 403;
          throw error;
        }
      }
      throw err;
    }
  }

  /**
   * Creates a new release in the specified repository.
   * @param {string} accessToken
   * @param {string} owner
   * @param {string} repo
   * @param {object} releaseData
   * @returns {Promise<object>}
   */
  async createRelease(accessToken, owner, repo, releaseData) {
    try {
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/releases`,
        releaseData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Shift-9-App',
          },
        }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.message;
        const error = new Error(`Failed to create GitHub release: ${msg}`);
        error.statusCode = err.response.status || 400;
        error.apiResponse = err.response.data;
        throw error;
      }
      throw err;
    }
  }
}
