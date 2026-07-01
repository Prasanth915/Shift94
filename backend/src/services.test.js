import assert from 'assert';
import { ProjectService } from './modules/projects/project.service.js';
import { OAuthService } from './modules/oauth/oauth.service.js';
import { PublishService } from './modules/publishing/publish.service.js';
import { HistoryService } from './modules/history/history.service.js';
import { encrypt } from '../utils/encryption.js';

// Setup environment mock for key length validation
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// ==========================================
// Mocks
// ==========================================

class MockProjectRepository {
  constructor() {
    this.projects = [];
  }
  async create(data) {
    const p = { id: 'project-1', createdAt: new Date(), ...data };
    this.projects.push(p);
    return p;
  }
  async findById(id) {
    return this.projects.find((p) => p.id === id) || null;
  }
  async update(id, data) {
    const idx = this.projects.findIndex((p) => p.id === id);
    this.projects[idx] = { ...this.projects[idx], ...data };
    return this.projects[idx];
  }
  async count() {
    return this.projects.length;
  }
}

class MockConnectedAccountRepository {
  constructor() {
    this.accounts = [];
  }
  async findByUserIdAndPlatform(userId, platform) {
    return this.accounts.find((a) => a.userId === userId && a.platform === platform) || null;
  }
  async create(data) {
    const a = { id: 'acc-1', createdAt: new Date(), ...data };
    this.accounts.push(a);
    return a;
  }
  async findByUserId(userId) {
    return this.accounts.filter((a) => a.userId === userId);
  }
}

class MockPublishLogRepository {
  constructor() {
    this.logs = [];
  }
  async create(data) {
    const l = { id: `log-${Date.now()}`, createdAt: new Date(), ...data };
    this.logs.push(l);
    return l;
  }
  async updateStatus(id, status, externalUrl, apiResponse) {
    const idx = this.logs.findIndex((l) => l.id === id);
    this.logs[idx] = { ...this.logs[idx], status, externalUrl, apiResponse };
    return this.logs[idx];
  }
}

class MockPublisher {
  async publish(project, account) {
    return {
      success: true,
      externalUrl: 'https://external.com/post/123',
      apiResponse: { id: 'ext-123' },
    };
  }
}

class MockPublisherManager {
  async publish(platform, project, account) {
    return {
      success: true,
      externalUrl: `https://${platform.toLowerCase()}.com/post/123`,
      apiResponse: { id: 'ext-123' },
    };
  }
}

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Service Layer Unit Tests ===');

  const userId = 'user-123';

  // 1. ProjectService Tests
  console.info('Testing ProjectService...');
  const projectRepo = new MockProjectRepository();
  const projectService = new ProjectService(projectRepo);

  const project = await projectService.createProject(userId, {
    title: 'Test Showcase',
    description: 'Showcasing modular services',
    techStack: ['Node.js', 'Express'],
  });
  assert.strictEqual(project.title, 'Test Showcase');
  assert.strictEqual(project.userId, userId);
  console.info('✓ ProjectService tests passed.');

  // 2. OAuthService Tests
  console.info('Testing OAuthService...');
  const accountRepo = new MockConnectedAccountRepository();
  const oauthService = new OAuthService(accountRepo);

  const savedConnection = await oauthService.saveConnection(userId, {
    platform: 'LINKEDIN',
    accessToken: 'plain_access_token',
    username: 'Jane Doe',
    profileUrl: 'https://linkedin.com/in/jane',
  });
  assert.strictEqual(savedConnection.platform, 'LINKEDIN');
  assert.ok(savedConnection.accessToken !== 'plain_access_token', 'Access token must be encrypted');

  const decryptedToken = await oauthService.getDecryptedAccessToken(userId, 'LINKEDIN');
  assert.strictEqual(decryptedToken, 'plain_access_token', 'Decrypted token should match original');
  console.info('✓ OAuthService tests passed.');

  // 3. PublishService Tests
  console.info('Testing PublishService...');
  const logRepo = new MockPublishLogRepository();
  const pubManager = new MockPublisherManager();
  const publishService = new PublishService(projectRepo, accountRepo, logRepo, pubManager);

  const publishResult = await publishService.publishProject(project.id, userId, ['LINKEDIN']);
  assert.strictEqual(publishResult.length, 1);
  assert.strictEqual(publishResult[0].status, 'PUBLISHED');
  assert.strictEqual(publishResult[0].externalUrl, 'https://linkedin.com/post/123');

  // Verify project status updated to PUBLISHED
  const updatedProject = await projectRepo.findById(project.id);
  assert.strictEqual(updatedProject.status, 'PUBLISHED');
  console.info('✓ PublishService tests passed.');

  // 4. HistoryService Tests
  console.info('Testing HistoryService...');
  const historyService = new HistoryService(logRepo, projectRepo, accountRepo);
  const stats = await historyService.getDashboardStats(userId);
  
  assert.strictEqual(stats.totalProjects, 1);
  assert.strictEqual(stats.publishedProjects, 1);
  assert.strictEqual(stats.linkedinConnected, true);
  assert.strictEqual(stats.githubConnected, false);
  console.info('✓ HistoryService tests passed.');

  console.info('=== All Service Layer Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
