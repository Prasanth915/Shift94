import assert from 'assert';
import { PublishController } from './publish.controller.js';

// ==========================================
// Mocks
// ==========================================

class MockPublishService {
  constructor() {
    this.publishedCalls = [];
  }

  async publishProject(projectId, userId, platforms) {
    // 1. Invalid Project case
    if (projectId === '00000000-0000-0000-0000-000000000000') {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Unauthorized User case
    if (userId === 'unauthorized-user-uuid') {
      const error = new Error('You do not have permission to publish this project.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Validation / invalid platform case (normally handled by validator, but handled by service if passed)
    const results = [];
    for (const platform of platforms) {
      if (platform !== 'GITHUB' && platform !== 'LINKEDIN') {
        const error = new Error(`Unsupported platform: ${platform}`);
        error.statusCode = 400;
        throw error;
      }
      results.push({
        id: `log-${platform.toLowerCase()}`,
        projectId,
        platform,
        status: 'PUBLISHED',
        externalUrl: `https://${platform.toLowerCase()}.com/johndev/showcase`,
      });
    }

    this.publishedCalls.push({ projectId, userId, platforms });
    return results;
  }
}

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Publish Controller Unit Tests ===');

  const publishService = new MockPublishService();
  const controller = new PublishController(publishService);

  const defaultProjectId = '11111111-1111-1111-1111-111111111111';
  const defaultUserId = 'user-123-uuid';

  let responseStatus = null;
  let responseData = null;

  const res = {
    status: (code) => {
      responseStatus = code;
      return {
        json: (data) => {
          responseData = data;
        },
      };
    },
  };

  // Helper helper to reset response captures
  const resetRes = () => {
    responseStatus = null;
    responseData = null;
  };

  // Helper next capture
  let nextError = null;
  const next = (err) => {
    nextError = err;
  };

  const resetNext = () => {
    nextError = null;
  };

  // Test Case 1: Successful GitHub publish
  console.info('Testing successful GitHub publish...');
  resetRes();
  resetNext();
  const req1 = {
    user: { id: defaultUserId },
    body: { projectId: defaultProjectId, platforms: ['GITHUB'] },
  };
  await controller.publish(req1, res, next);

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.results.length, 1);
  assert.strictEqual(responseData.data.results[0].platform, 'GITHUB');
  assert.strictEqual(responseData.data.results[0].status, 'PUBLISHED');
  console.info('✓ GitHub publish tests passed.');

  // Test Case 2: Successful LinkedIn publish
  console.info('Testing successful LinkedIn publish...');
  resetRes();
  resetNext();
  const req2 = {
    user: { id: defaultUserId },
    body: { projectId: defaultProjectId, platforms: ['LINKEDIN'] },
  };
  await controller.publish(req2, res, next);

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.results.length, 1);
  assert.strictEqual(responseData.data.results[0].platform, 'LINKEDIN');
  assert.strictEqual(responseData.data.results[0].status, 'PUBLISHED');
  console.info('✓ LinkedIn publish tests passed.');

  // Test Case 3: Multi-platform publish (both GitHub and LinkedIn)
  console.info('Testing multi-platform publish...');
  resetRes();
  resetNext();
  const req3 = {
    user: { id: defaultUserId },
    body: { projectId: defaultProjectId, platforms: ['GITHUB', 'LINKEDIN'] },
  };
  await controller.publish(req3, res, next);

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.results.length, 2);
  assert.strictEqual(responseData.data.results[0].platform, 'GITHUB');
  assert.strictEqual(responseData.data.results[1].platform, 'LINKEDIN');
  console.info('✓ Multi-platform publish tests passed.');

  // Test Case 4: Invalid platform
  console.info('Testing invalid platform error handling...');
  resetRes();
  resetNext();
  const req4 = {
    user: { id: defaultUserId },
    body: { projectId: defaultProjectId, platforms: ['INVALID_PLATFORM'] },
  };
  await controller.publish(req4, res, next);

  assert.ok(nextError);
  assert.strictEqual(nextError.message, 'Unsupported platform: INVALID_PLATFORM');
  assert.strictEqual(nextError.statusCode, 400);
  console.info('✓ Invalid platform test passed.');

  // Test Case 5: Invalid project (not found)
  console.info('Testing invalid project error handling...');
  resetRes();
  resetNext();
  const req5 = {
    user: { id: defaultUserId },
    body: { projectId: '00000000-0000-0000-0000-000000000000', platforms: ['GITHUB'] },
  };
  await controller.publish(req5, res, next);

  assert.ok(nextError);
  assert.strictEqual(nextError.message, 'Project not found.');
  assert.strictEqual(nextError.statusCode, 404);
  console.info('✓ Invalid project test passed.');

  // Test Case 6: Unauthorized user
  console.info('Testing unauthorized user error handling...');
  resetRes();
  resetNext();
  const req6 = {
    user: { id: 'unauthorized-user-uuid' },
    body: { projectId: defaultProjectId, platforms: ['GITHUB'] },
  };
  await controller.publish(req6, res, next);

  assert.ok(nextError);
  assert.strictEqual(nextError.message, 'You do not have permission to publish this project.');
  assert.strictEqual(nextError.statusCode, 403);
  console.info('✓ Unauthorized user test passed.');

  console.info('=== All Publish Controller Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
