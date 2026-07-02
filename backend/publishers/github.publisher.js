import axios from 'axios';
import { GitHubService } from '../services/github.service.js';

/**
 * GitHub Publisher strategy implementing the Publisher interface.
 */
export class GitHubPublisher {
  constructor() {
    this.githubService = new GitHubService();
  }

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
          'User-Agent': 'Shift94-App',
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
   * Publishes the project showcase to GitHub by creating a Release.
   * @param {object} project
   * @param {object} account
   * @returns {Promise<{ success: boolean, externalUrl: string|null, apiResponse: object }>}
   */
  async publish(project, account) {
    if (!project.githubUrl) {
      const error = new Error('No GitHub repository URL associated with this project.');
      error.statusCode = 422;
      throw error;
    }

    const parsed = this.parseRepoUrl(project.githubUrl);
    if (!parsed) {
      const error = new Error('Invalid repository URL. Please link a valid GitHub repository URL.');
      error.statusCode = 422;
      throw error;
    }

    const { owner, repo } = parsed;

    // Verify token permissions and repository access
    await this.githubService.checkRepositoryAccess(account.accessToken, owner, repo);

    const timestamp = Math.floor(Date.now() / 1000);
    const tagName = `v1.0.${timestamp}`;
    const releaseName = 'Shift94 Portfolio Publish';
    const releaseNotes = this.formatReleaseNotes(project);

    // Create the release
    const release = await this.githubService.createRelease(account.accessToken, owner, repo, {
      tag_name: tagName,
      name: releaseName,
      body: releaseNotes,
      draft: false,
      prerelease: false,
    });

    return {
      success: true,
      externalUrl: release.html_url,
      apiResponse: {
        releaseId: release.id.toString(),
        releaseName: release.name,
        tagName: release.tag_name,
        publishedAt: release.published_at,
        repository: `${owner}/${repo}`,
        platform: 'GITHUB',
      },
    };
  }

  /**
   * Parses the GitHub repository owner and name from the URL.
   * @param {string} url
   * @returns {{owner: string, repo: string}|null}
   */
  parseRepoUrl(url) {
    if (!url) return null;
    const cleaned = url.trim().replace(/\/+$/, '');
    
    const httpsMatch = cleaned.match(/github\.com\/([^\/]+)\/([^\/#?]+)/);
    if (httpsMatch) {
      const owner = httpsMatch[1];
      const repo = httpsMatch[2].replace(/\.git$/, '');
      return { owner, repo };
    }
    
    const sshMatch = cleaned.match(/github\.com:([^\/]+)\/([^\/#?]+)/);
    if (sshMatch) {
      const owner = sshMatch[1];
      const repo = sshMatch[2].replace(/\.git$/, '');
      return { owner, repo };
    }
    
    return null;
  }

  /**
   * Formats the release notes in Markdown with Shift94 branding.
   * @param {object} project
   * @returns {string}
   */
  formatReleaseNotes(project) {
    const techStackStr = Array.isArray(project.techStack) && project.techStack.length > 0
      ? project.techStack.map(t => `- ${t}`).join('\n')
      : '- N/A';
    const tagsStr = Array.isArray(project.tags) && project.tags.length > 0
      ? project.tags.map(t => `#${t}`).join(' ')
      : 'N/A';

    return `🚀 Project Published from Shift94

---

### **${project.title}**
*${project.subtitle || 'Showcase Project'}*

#### **Description**
${project.description}

#### **Tech Stack**
${techStackStr}

---

#### **Links & References**
- **Repository:** [GitHub URL](${project.githubUrl})
${project.demoUrl ? `- **Live Demo:** [Demo URL](${project.demoUrl})` : ''}
${project.linkedinUrl ? `- **LinkedIn Profile:** [LinkedIn URL](${project.linkedinUrl})` : ''}

#### **Tags**
${tagsStr}

*Generated automatically via [Shift94](http://localhost:5173).*
`;
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
