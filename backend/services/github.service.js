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
}
