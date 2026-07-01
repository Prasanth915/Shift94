import assert from 'assert';
import { HistoryController } from './history.controller.js';

// ==========================================
// Mocks
// ==========================================

class MockHistoryService {
  async getHistory(userId, query) {
    return {
      logs: [
        { id: 'log-1', platform: 'LINKEDIN', status: 'PUBLISHED' },
        { id: 'log-2', platform: 'GITHUB', status: 'FAILED' },
      ],
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    };
  }
}

class MockPublishService {
  constructor() {
    this.retried = false;
  }
  async retryPublish(logId, userId) {
    this.retried = true;
    return {
      id: logId,
      platform: 'GITHUB',
      status: 'PUBLISHED',
    };
  }
}

class MockPublishLogRepository {
  constructor() {
    this.logs = [
      { id: 'log-1', platform: 'LINKEDIN', status: 'PUBLISHED', project: { userId: 'user-123' } },
      { id: 'log-2', platform: 'GITHUB', status: 'FAILED', project: { userId: 'user-123' } },
    ];
  }

  async findById(id) {
    return this.logs.find((l) => l.id === id) || null;
  }
}

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Publish History Unit Tests ===');

  const historyService = new MockHistoryService();
  const publishService = new MockPublishService();
  const logRepository = new MockPublishLogRepository();
  const controller = new HistoryController(historyService, publishService, logRepository);

  const userId = 'user-123';
  const req = { user: { id: userId }, params: {}, query: {} };
  
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

  // 1. Get All History Logs
  console.info('Testing getAll...');
  await controller.getAll(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.logs.length, 2);
  console.info('✓ History logs retrieval tests passed.');

  // 2. Get Log Details by ID
  console.info('Testing getById...');
  req.params.id = 'log-1';
  await controller.getById(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.log.id, 'log-1');
  console.info('✓ Log details by ID tests passed.');

  // 3. Retry Failed Log
  console.info('Testing retry failed...');
  req.params.id = 'log-2'; // FAILED log
  await controller.retry(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.log.status, 'PUBLISHED');
  assert.strictEqual(publishService.retried, true);
  console.info('✓ Retry failed publish tests passed.');

  // 4. Reject Retry on Succeeded Log
  console.info('Testing retry rejection on succeeded log...');
  req.params.id = 'log-1'; // Already PUBLISHED log
  
  let nextError = null;
  const next = (err) => {
    nextError = err;
  };

  await controller.retry(req, res, next);

  assert.ok(nextError, 'Should call next with an error');
  assert.strictEqual(nextError.message, 'Only failed publishing attempts can be retried.');
  assert.strictEqual(nextError.statusCode, 400);
  console.info('✓ Rejection on succeeded log retry tests passed.');

  console.info('=== All Publish History Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
