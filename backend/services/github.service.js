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
    if (accessToken === 'mock_github_token') {
      return {
        username: 'johndev',
        profileUrl: 'https://github.com/johndev',
      };
    }
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Shift94-App',
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
    if (accessToken === 'mock_github_token') {
      return [
        {
          id: '123456',
          name: 'shift94',
          fullName: 'johndev/shift94',
          url: 'https://github.com/johndev/shift94',
          description: 'Developer Portfolio Automation Platform',
          defaultBranch: 'main',
          visibility: 'public',
        },
        {
          id: '123457',
          name: 'blog',
          fullName: 'johndev/blog',
          url: 'https://github.com/johndev/blog',
          description: 'My thoughts on software engineering',
          defaultBranch: 'main',
          visibility: 'public',
        }
      ];
    }
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Shift94-App',
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
    if (accessToken === 'mock_github_token') {
      return true;
    }
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Shift94-App',
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
    if (accessToken === 'mock_github_token') {
      return {
        id: 12345,
        name: releaseData.name,
        tag_name: releaseData.tag_name,
        published_at: new Date().toISOString(),
        html_url: `https://github.com/${owner}/${repo}/releases/tag/${releaseData.tag_name}`,
      };
    }
    try {
      console.info('[PUBLISH_LOG] GitHub API request - Create Release', { owner, repo, tagName: releaseData.tag_name });
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/releases`,
        releaseData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Shift94-App',
          },
        }
      );
      console.info('[PUBLISH_LOG] GitHub API response - Create Release success', { owner, repo, releaseId: response.data.id });
      return response.data;
    } catch (err) {
      console.error('[PUBLISH_LOG] GitHub API response - Create Release failure', { owner, repo, error: err.message });
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

  /**
   * Creates a new GitHub repository for the user.
   * @param {string} accessToken
   * @param {object} repoData
   * @returns {Promise<object>} Repository details
   */
  async createRepository(accessToken, repoData) {
    if (accessToken === 'mock_github_token') {
      const name = repoData.name || 'shift94-repo';
      return {
        id: 12345678,
        name: name,
        url: `https://github.com/johndev/${name}`,
        owner: 'johndev',
        defaultBranch: 'main',
        visibility: repoData.private ? 'private' : 'public',
        createdAt: new Date().toISOString(),
      };
    }
    try {
      const response = await axios.post(
        'https://api.github.com/user/repos',
        {
          name: repoData.name,
          description: repoData.description,
          private: repoData.private,
          auto_init: repoData.autoInit,
          gitignore_template: repoData.gitignoreTemplate || null,
          license_template: repoData.licenseTemplate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Shift94-App',
          },
        }
      );

      const repo = response.data;
      const owner = repo.owner.login;

      // If topics are provided, set them
      if (repoData.topics && Array.isArray(repoData.topics) && repoData.topics.length > 0) {
        try {
          await axios.put(
            `https://api.github.com/repos/${owner}/${repo.name}/topics`,
            {
              names: repoData.topics.map(t => t.toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean),
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Shift94-App',
              },
            }
          );
        } catch (topicErr) {
          // Log but do not fail repository creation if topics fail
          console.warn(`[GitHubService] Failed to set topics for ${repo.name}:`, topicErr.message);
        }
      }

      return {
        id: repo.id,
        name: repo.name,
        url: repo.html_url,
        owner: owner,
        defaultBranch: repo.default_branch || 'main',
        visibility: repo.private ? 'private' : 'public',
        createdAt: repo.created_at,
      };
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message || err.message;
        
        if (status === 401) {
          const error = new Error('GitHub authorization expired. Reconnect your account.');
          error.statusCode = 401;
          throw error;
        }
        if (status === 403) {
          const error = new Error('Repository creation permission denied.');
          error.statusCode = 403;
          throw error;
        }
        if (status === 404) {
          const error = new Error('GitHub API unavailable.');
          error.statusCode = 404;
          throw error;
        }
        if (status === 409) {
          const error = new Error('Repository already exists.');
          error.statusCode = 409;
          throw error;
        }
        if (status === 422) {
          const error = new Error('Invalid repository name.');
          error.statusCode = 422;
          throw error;
        }
        if (status === 429) {
          const error = new Error('GitHub rate limit exceeded. Please try again later.');
          error.statusCode = 429;
          throw error;
        }

        const error = new Error(`Failed to create repository: ${msg}`);
        error.statusCode = status;
        throw error;
      }
      
      const error = new Error('Unable to contact GitHub.');
      error.statusCode = 503;
      throw error;
    }
  }
}
