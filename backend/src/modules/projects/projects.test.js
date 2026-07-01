import assert from 'assert';
import { ProjectController } from './project.controller.js';

// ==========================================
// Mocks
// ==========================================

class MockProjectService {
  constructor() {
    this.projects = [];
  }

  async createProject(userId, data) {
    const p = {
      id: 'mock-project-uuid',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.projects.push(p);
    return p;
  }

  async updateProject(id, userId, data) {
    const p = this.projects.find((item) => item.id === id);
    if (!p) throw new Error('Project not found');
    Object.assign(p, data);
    return p;
  }

  async getProjectById(id, userId) {
    const p = this.projects.find((item) => item.id === id);
    if (!p) throw new Error('Project not found');
    return p;
  }

  async deleteProject(id, userId) {
    const idx = this.projects.findIndex((item) => item.id === id);
    if (idx === -1) throw new Error('Project not found');
    this.projects.splice(idx, 1);
    return true;
  }

  async listProjects(userId, query) {
    return {
      projects: this.projects.filter((p) => p.userId === userId),
      pagination: { total: this.projects.length, page: 1, limit: 10, pages: 1 },
    };
  }
}

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Project Management Unit Tests ===');

  const mockService = new MockProjectService();
  const controller = new ProjectController(mockService);
  const userId = 'user-123';

  // 1. Array Parsing Helper Tests
  console.info('Testing Multipart Form Field Parsing...');
  assert.deepStrictEqual(controller.parseArrayField('React, Node, Prisma'), ['React', 'Node', 'Prisma']);
  assert.deepStrictEqual(controller.parseArrayField('["React", "Node"]'), ['React', 'Node']);
  assert.deepStrictEqual(controller.parseArrayField(['React', 'Node']), ['React', 'Node']);
  assert.deepStrictEqual(controller.parseArrayField(null), []);
  console.info('✓ Array parsing helper tests passed.');

  // 2. Controller Create Request Mocking
  console.info('Testing Controller Project Creation...');
  const req = {
    user: { id: userId },
    body: {
      title: 'Showcase App',
      description: 'Mocked controller test',
      techStack: 'React, Tailwind, Node',
    },
    file: { filename: 'cover-123.png' },
  };

  let responseData = null;
  let responseStatus = null;

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

  await controller.create(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 201);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.project.title, 'Showcase App');
  assert.strictEqual(responseData.data.project.image, '/uploads/cover-123.png');
  console.info('✓ Controller project creation tests passed.');

  // 3. Controller Get List Request Mocking
  console.info('Testing Controller List Projects...');
  const listReq = {
    user: { id: userId },
    query: { page: 1, limit: 10 },
  };

  await controller.getAll(listReq, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.projects.length, 1);
  console.info('✓ Controller list projects tests passed.');

  console.info('=== All Project Management Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
