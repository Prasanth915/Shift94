import assert from 'assert';
import { DashboardController } from './dashboard.controller.js';

// ==========================================
// Mocks
// ==========================================

class MockHistoryService {
  async getDashboardStats(userId) {
    return {
      totalProjects: 5,
      publishedProjects: 3,
      linkedinConnected: true,
      githubConnected: false,
    };
  }
}

class MockProjectService {
  async listProjects(userId, query) {
    return {
      projects: [
        { id: 'p-1', title: 'Project One' },
        { id: 'p-2', title: 'Project Two' },
      ],
    };
  }
}

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Dashboard Module Unit Tests ===');

  const historyService = new MockHistoryService();
  const projectService = new MockProjectService();
  const controller = new DashboardController(historyService, projectService);
  const userId = 'user-123';

  // 1. Get Dashboard Data
  console.info('Testing getDashboardData...');
  const req = { user: { id: userId } };
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

  await controller.getDashboardData(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.totalProjects, 5);
  assert.strictEqual(responseData.data.linkedinConnected, true);
  assert.strictEqual(responseData.data.githubConnected, false);
  console.info('✓ Dashboard data retrieval tests passed.');

  // 2. Get Recent Projects
  console.info('Testing getRecentProjects...');
  await controller.getRecentProjects(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.projects.length, 2);
  assert.strictEqual(responseData.data.projects[0].title, 'Project One');
  console.info('✓ Recent projects retrieval tests passed.');

  console.info('=== All Dashboard Module Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
