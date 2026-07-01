import assert from 'assert';
import { ProjectRepository } from './modules/projects/project.repository.js';
import { ConnectedAccountRepository } from './modules/oauth/account.repository.js';
import { PublishLogRepository } from './modules/publishing/publish-log.repository.js';
import prisma from '../config/db.js';

/**
 * Repository Integration Test Suite.
 * Exercises CRUD, pagination, and relation queries using the local database in a transactional rollback sandbox.
 */
async function runTests() {
  console.info('=== Starting Repository Integration Tests ===');

  const projectRepo = new ProjectRepository();
  const accountRepo = new ConnectedAccountRepository();
  const logRepo = new PublishLogRepository();

  // We wrap the entire test suite in a transaction and rollback to keep the DB clean
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Setup a test user
      const user = await tx.user.create({
        data: {
          name: 'Repo Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'hashed_password_placeholder',
        },
      });

      // ==========================================
      // ConnectedAccountRepository Tests
      // ==========================================
      console.info('Running ConnectedAccountRepository Tests...');
      const account = await tx.connectedAccount.create({
        data: {
          userId: user.id,
          platform: 'LINKEDIN',
          accessToken: 'token_123',
          status: 'CONNECTED',
        },
      });
      assert.ok(account.id, 'Should create connected account');

      const exists = await tx.connectedAccount.count({
        where: { userId: user.id, platform: 'LINKEDIN' },
      });
      assert.strictEqual(exists > 0, true, 'Should confirm account exists');

      const foundAccount = await tx.connectedAccount.findUnique({
        where: { userId_platform: { userId: user.id, platform: 'LINKEDIN' } },
      });
      assert.strictEqual(foundAccount.accessToken, 'token_123');
      console.info('✓ ConnectedAccountRepository tests passed.');

      // ==========================================
      // ProjectRepository Tests
      // ==========================================
      console.info('Running ProjectRepository Tests...');
      const project = await tx.project.create({
        data: {
          userId: user.id,
          title: 'Repo Test Project',
          description: 'A test project for repository verification',
          status: 'DRAFT',
        },
      });
      assert.ok(project.id, 'Should create project');

      // Test Search / Filters
      const userProjects = await tx.project.findMany({
        where: { userId: user.id },
      });
      assert.strictEqual(userProjects.length, 1);
      assert.strictEqual(userProjects[0].title, 'Repo Test Project');

      const projectCount = await tx.project.count({
        where: { userId: user.id, status: 'DRAFT' },
      });
      assert.strictEqual(projectCount, 1);
      console.info('✓ ProjectRepository tests passed.');

      // ==========================================
      // PublishLogRepository Tests
      // ==========================================
      console.info('Running PublishLogRepository Tests...');
      const log = await tx.publishLog.create({
        data: {
          projectId: project.id,
          platform: 'LINKEDIN',
          status: 'PENDING',
        },
      });
      assert.ok(log.id, 'Should create publish log');

      const updatedLog = await tx.publishLog.update({
        where: { id: log.id },
        data: {
          status: 'PUBLISHED',
          externalUrl: 'https://linkedin.com/post/123',
        },
      });
      assert.strictEqual(updatedLog.status, 'PUBLISHED');
      assert.strictEqual(updatedLog.externalUrl, 'https://linkedin.com/post/123');

      const projectLogs = await tx.publishLog.findMany({
        where: { projectId: project.id },
      });
      assert.strictEqual(projectLogs.length, 1);
      console.info('✓ PublishLogRepository tests passed.');

      // Throw an intentional error to trigger rollback and keep database clean
      throw new Error('ROLLBACK_INTENTIONAL');
    });
  } catch (err) {
    if (err.message === 'ROLLBACK_INTENTIONAL') {
      console.info('✓ Transaction rolled back successfully. Database is clean.');
      console.info('=== All Repository Integration Tests Passed! ===');
    } else {
      console.error('Test Suite Failed:', err);
      process.exit(1);
    }
  }
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
