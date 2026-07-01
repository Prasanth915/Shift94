import assert from 'assert';
import bcrypt from 'bcryptjs';
import { SettingsController } from './settings.controller.js';

// ==========================================
// Mocks
// ==========================================

class MockSettingsService {
  constructor() {
    this.user = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_current_password_123',
    };
    this.accounts = [
      { id: 'acc-1', platform: 'LINKEDIN', username: 'john-linkedin', status: 'CONNECTED' },
    ];
    this.userRepository = {
      findById: async (id) => (id === this.user.id ? this.user : null),
    };
  }

  async updateProfile(userId, data) {
    Object.assign(this.user, data);
    return this.user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (currentPassword !== 'Password123!') {
      throw new Error('Invalid current password.');
    }
    if (newPassword === currentPassword) {
      throw new Error('New password cannot be the same as your current password.');
    }
    this.user.password = 'hashed_new_password';
  }

  async getConnectedAccounts(userId) {
    return this.accounts;
  }

  async disconnectAccount(userId, platform) {
    const idx = this.accounts.findIndex((acc) => acc.platform === platform.toUpperCase());
    if (idx === -1) throw new Error('Account not found');
    this.accounts.splice(idx, 1);
    return true;
  }
}

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Settings Module Unit Tests ===');

  const mockService = new MockSettingsService();
  const controller = new SettingsController(mockService);
  const userId = 'user-123';

  const req = { user: { id: userId }, body: {}, params: {} };
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

  // 1. Get Profile Details
  console.info('Testing getProfile...');
  await controller.getProfile(req, res, (err) => {
    if (err) assert.fail('Should not throw error');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.user.name, 'John Doe');
  assert.strictEqual(responseData.data.user.password, undefined, 'Should never return password hash');
  console.info('✓ Profile retrieval tests passed.');

  // 2. Update Profile Metadata
  console.info('Testing updateProfile...');
  req.body = { name: 'John Updated', email: 'john-new@example.com' };
  await controller.updateProfile(req, res, (err) => {
    if (err) assert.fail('Should not throw');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.data.user.name, 'John Updated');
  assert.strictEqual(mockService.user.email, 'john-new@example.com');
  console.info('✓ Profile update tests passed.');

  // 3. Change Password Success
  console.info('Testing changePassword...');
  req.body = { currentPassword: 'Password123!', newPassword: 'NewPassword123!' };
  await controller.changePassword(req, res, (err) => {
    if (err) assert.fail('Should not throw');
  });

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(mockService.user.password, 'hashed_new_password');
  console.info('✓ Password change tests passed.');

  // 4. Change Password Rejection (Same Password)
  console.info('Testing changePassword same-password rejection...');
  req.body = { currentPassword: 'Password123!', newPassword: 'Password123!' };
  
  let nextError = null;
  const next = (err) => {
    nextError = err;
  };

  await controller.changePassword(req, res, next);
  assert.ok(nextError);
  assert.strictEqual(nextError.message, 'New password cannot be the same as your current password.');
  console.info('✓ Password change validation rejection tests passed.');

  console.info('=== All Settings Module Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
