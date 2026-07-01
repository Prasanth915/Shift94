import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import { LinkedInService } from '../services/linkedin.service.js';

/**
 * LinkedIn Publisher strategy implementing the Publisher interface.
 * Coordinates token validation, image uploads, and post creation.
 */
export class LinkedInPublisher {
  constructor() {
    this.linkedinService = new LinkedInService();
  }

  /**
   * Validates the connection status and token validity.
   * @param {object} account
   * @returns {Promise<boolean>}
   */
  async validate(account) {
    try {
      const profile = await this.linkedinService.getUserProfile(account.accessToken);
      return !!profile.id;
    } catch {
      return false;
    }
  }

  /**
   * Establishes connection credentials.
   * @param {object} account
   * @returns {Promise<object>}
   */
  async connect(account) {
    return account;
  }

  /**
   * Formats a professional project showcase post.
   * @param {object} project
   * @returns {string} Formatted commentary
   */
  formatPostContent(project) {
    const lines = [];
    lines.push(`🚀 New Project Showcase: ${project.title}`);
    if (project.subtitle) {
      lines.push(`${project.subtitle}`);
    }
    lines.push('');
    lines.push(project.description);
    lines.push('');
    
    if (project.techStack && project.techStack.length > 0) {
      lines.push(`🛠 Tech Stack: ${project.techStack.join(', ')}`);
    }
    
    if (project.githubUrl) {
      lines.push(`📦 Repository: ${project.githubUrl}`);
    }
    if (project.demoUrl) {
      lines.push(`💻 Live Demo: ${project.demoUrl}`);
    }

    if (project.tags && project.tags.length > 0) {
      lines.push('');
      lines.push(project.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' '));
    }

    return lines.join('\n');
  }

  /**
   * Publishes the project showcase to LinkedIn.
   * Executes the 2-step image upload if a cover image exists locally.
   * @param {object} project
   * @param {object} account
   * @returns {Promise<{ success: boolean, externalUrl: string|null, apiResponse: object }>}
   */
  async publish(project, account) {
    let imageUrn = null;

    // Retrieve platform-specific profile URN username (sub value)
    const personId = account.profileUrl.split('/').pop() || account.username;

    // 1. If project has a cover image, execute the 2-step upload workflow
    if (project.image) {
      try {
        const imagePath = path.join(process.cwd(), config.uploadPath || './uploads', path.basename(project.image));
        
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          
          // Step 1: Initialize Upload
          const { uploadUrl, imageUrn: registeredUrn } = await this.linkedinService.initializeImageUpload(
            account.accessToken,
            personId
          );

          // Step 2: Upload Binary
          await this.linkedinService.uploadImageBinary(uploadUrl, imageBuffer);
          imageUrn = registeredUrn;
        }
      } catch (err) {
        // Fall back to text-only publish if image upload fails
        console.error('[LinkedInPublisher] Image upload failed, falling back to text-only:', err);
      }
    }

    // 2. Publish post
    const textContent = this.formatPostContent(project);
    const result = await this.linkedinService.createPost(
      account.accessToken,
      personId,
      textContent,
      imageUrn
    );

    return {
      success: true,
      externalUrl: result.externalUrl,
      apiResponse: {
        id: result.id,
        linkedAt: new Date(),
        platform: 'LINKEDIN',
        raw: result.apiResponse,
      },
    };
  }

  /**
   * Revokes permissions.
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
    return 'LINKEDIN';
  }
}
