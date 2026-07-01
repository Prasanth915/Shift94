const path = require('path');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const { decrypt } = require('../utils/encryption');
const { success, error } = require('../utils/apiResponse');
const projectService = require('../services/project.service');
const linkedinService = require('../services/linkedin.service');

const prisma = new PrismaClient();

/**
 * POST /api/publish/linkedin
 * Publish a project to LinkedIn as a post (with optional image).
 */
async function publishToLinkedIn(req, res, next) {
  try {
    const { projectId, text } = req.body;

    // 1. Verify the project exists and belongs to the user
    const project = await projectService.getProjectById(projectId, req.user.userId);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    // 2. Get the user's LinkedIn connected account
    const account = await prisma.connectedAccount.findUnique({
      where: {
        userId_platform: { userId: req.user.userId, platform: 'LINKEDIN' },
      },
    });
    if (!account || account.status !== 'CONNECTED') {
      return error(res, 'LinkedIn account not connected', 400);
    }

    // 3. Decrypt the access token
    const accessToken = decrypt(account.accessToken);

    // 4. Get LinkedIn profile to find the author URN
    const profile = await linkedinService.getProfile(accessToken);
    const authorUrn = `urn:li:person:${profile.sub}`;

    // 5. Build the post text
    const postText = text || buildDefaultPostText(project);

    // 6. Create a pending publish log
    const publishLog = await projectService.createPublishLog({
      projectId: project.id,
      platform: 'LINKEDIN',
      status: 'PUBLISHING',
    });

    try {
      let imageUrn = null;

      // 7. Upload image if the project has one
      if (project.image) {
        const imagePath = path.resolve(config.uploadDir, '..', project.image.replace(/^\//, ''));
        const { uploadUrl, imageUrn: urn } = await linkedinService.initializeImageUpload(
          accessToken,
          authorUrn,
        );
        await linkedinService.uploadImageBinary(uploadUrl, accessToken, imagePath);
        imageUrn = urn;
      }

      // 8. Create the LinkedIn post
      const result = await linkedinService.createPost(accessToken, {
        authorUrn,
        text: postText,
        imageUrn,
      });

      // 9. Update publish log with success
      const externalUrl = result.postUrn
        ? `https://www.linkedin.com/feed/update/${result.postUrn}`
        : null;

      await projectService.updatePublishLog(publishLog.id, {
        status: 'PUBLISHED',
        externalUrl,
        apiResponse: result.data || { postUrn: result.postUrn },
      });

      // 10. Update project status
      await projectService.updateProject(project.id, req.user.userId, { status: 'PUBLISHED' });

      return success(res, {
        publishLog: { ...publishLog, status: 'PUBLISHED', externalUrl },
      }, 'Published to LinkedIn successfully');
    } catch (publishErr) {
      // Update log with failure
      await projectService.updatePublishLog(publishLog.id, {
        status: 'FAILED',
        apiResponse: { error: publishErr.message, details: publishErr.response?.data },
      });
      return error(res, `LinkedIn publish failed: ${publishErr.message}`, 502);
    }
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/publish/github
 * "Publish" to GitHub — stores repo metadata as a PublishLog entry.
 * No README auto-update.
 */
async function publishToGitHub(req, res, next) {
  try {
    const { projectId, repoUrl, repoName, repoFullName } = req.body;

    // 1. Verify the project
    const project = await projectService.getProjectById(projectId, req.user.userId);
    if (!project) {
      return error(res, 'Project not found', 404);
    }

    // 2. Verify GitHub account is connected
    const account = await prisma.connectedAccount.findUnique({
      where: {
        userId_platform: { userId: req.user.userId, platform: 'GITHUB' },
      },
    });
    if (!account || account.status !== 'CONNECTED') {
      return error(res, 'GitHub account not connected', 400);
    }

    // 3. Create publish log with repo metadata
    const publishLog = await projectService.createPublishLog({
      projectId: project.id,
      platform: 'GITHUB',
      status: 'PUBLISHED',
      externalUrl: repoUrl || null,
      apiResponse: {
        repoName: repoName || null,
        repoFullName: repoFullName || null,
        linkedAt: new Date().toISOString(),
      },
    });

    // 4. Optionally update project's githubUrl
    if (repoUrl && !project.githubUrl) {
      await projectService.updateProject(project.id, req.user.userId, { githubUrl: repoUrl });
    }

    return success(res, { publishLog }, 'Project linked to GitHub repository');
  } catch (err) {
    next(err);
  }
}

/**
 * Build a default LinkedIn post body from project data.
 * @param {object} project
 * @returns {string}
 */
function buildDefaultPostText(project) {
  const lines = [];
  lines.push(`🚀 ${project.title}`);
  if (project.subtitle) lines.push(project.subtitle);
  if (project.description) lines.push(`\n${project.description}`);
  if (project.techStack?.length) lines.push(`\n🛠 Tech Stack: ${project.techStack.join(', ')}`);
  if (project.demoUrl) lines.push(`\n🔗 Live Demo: ${project.demoUrl}`);
  if (project.githubUrl) lines.push(`💻 GitHub: ${project.githubUrl}`);
  if (project.tags?.length) lines.push(`\n${project.tags.map((t) => `#${t}`).join(' ')}`);
  return lines.join('\n');
}

module.exports = { publishToLinkedIn, publishToGitHub };
