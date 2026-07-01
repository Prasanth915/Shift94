import assert from 'assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateRegisterInput, validateLoginInput, validatePasswordStrength } from '../../../../shared/validators/index.js';
import { UserRepository } from './user.repository.js';
import { AuthService } from './auth.service.js';

// Mock User Repository for unit testing AuthService without database calls
class MockUserRepository {
  constructor() {
    this.users = [];
  }

  async findById(id) {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  async create(data) {
    const newUser = {
      id: `mock-uuid-${Date.now()}`,
      createdAt: new Date(),
      ...data,
    };
    this.users.push(newUser);
    return newUser;
  }
}

async function runTests() {
  console.info('=== Starting Authentication Module Unit Tests ===');

  // 1. Password Strength Validation Tests
  console.info('Running Password Strength Validation Tests...');
  assert.strictEqual(validatePasswordStrength('weak'), false, 'Should reject short passwords');
  assert.strictEqual(validatePasswordStrength('password123'), false, 'Should reject passwords without uppercase');
  assert.strictEqual(validatePasswordStrength('Password123'), false, 'Should reject passwords without special characters');
  assert.strictEqual(validatePasswordStrength('Password123!'), true, 'Should accept strong passwords');
  console.info('✓ Password strength tests passed.');

  // 2. Input Validation Tests
  console.info('Running Input Validation Tests...');
  const invalidRegister = validateRegisterInput({ name: '', email: 'invalid', password: '123' });
  assert.ok(Array.isArray(invalidRegister), 'Should return errors array for invalid registration inputs');
  
  const validRegister = validateRegisterInput({ name: 'Jane Doe', email: 'jane@example.com', password: 'Password123!' });
  assert.strictEqual(validRegister, null, 'Should return null for valid registration inputs');
  console.info('✓ Input validation tests passed.');

  // 3. Password Hashing & Registration Flow
  console.info('Running Registration and Password Hashing Tests...');
  const mockRepo = new MockUserRepository();
  const authService = new AuthService(mockRepo);

  const registrationResult = await authService.register({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123!',
  });

  assert.ok(registrationResult.token, 'Should return a JWT token');
  assert.strictEqual(registrationResult.user.name, 'Jane Doe');
  assert.strictEqual(registrationResult.user.email, 'jane@example.com');
  assert.strictEqual(registrationResult.user.password, undefined, 'Should not return the password field');

  // Verify stored password is hashed
  const storedUser = mockRepo.users[0];
  assert.ok(storedUser.password !== 'Password123!', 'Stored password must be hashed');
  const isMatch = await bcrypt.compare('Password123!', storedUser.password);
  assert.strictEqual(isMatch, true, 'Stored hash should match the raw password');
  console.info('✓ Password hashing and registration tests passed.');

  // 4. Duplicate Email Handling
  console.info('Running Duplicate Email Prevention Tests...');
  try {
    await authService.register({
      name: 'Duplicate User',
      email: 'jane@example.com',
      password: 'Password123!',
    });
    assert.fail('Should throw an error when registering a duplicate email');
  } catch (err) {
    assert.strictEqual(err.message, 'An account with this email already exists.');
    assert.strictEqual(err.statusCode, 400);
  }
  console.info('✓ Duplicate email prevention tests passed.');

  // 5. Login Flow Tests
  console.info('Running Login Flow Tests...');
  const loginResult = await authService.login('jane@example.com', 'Password123!');
  assert.ok(loginResult.token, 'Should return a JWT token on successful login');
  assert.strictEqual(loginResult.user.email, 'jane@example.com');

  try {
    await authService.login('jane@example.com', 'WrongPassword!');
    assert.fail('Should throw an error for incorrect passwords');
  } catch (err) {
    assert.strictEqual(err.message, 'Invalid email or password.');
    assert.strictEqual(err.statusCode, 401);
  }
  console.info('✓ Login flow tests passed.');

  console.info('=== All Authentication Module Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
