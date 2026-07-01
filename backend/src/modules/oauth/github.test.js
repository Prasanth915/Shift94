import assert from 'assert';
import { GitHubPublisher } from '../../../publishers/github.publisher.js';

// Setup environment mock for key length validation
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function runTests() {
  console.info('=== Starting GitHub Integration Unit Tests ===');

  const publisher = new GitHubPublisher();

  // 1. Publisher Platform Verification
  console.info('Verifying publisher platform identifier...');
  assert.strictEqual(publisher.getPlatform(), 'GITHUB');
  console.info('✓ Platform verification passed.');

  // 2. Mock Publishing flow
  console.info('Verifying GitHub Publisher linkage execution...');
  const mockProject = {
    title: 'Test Portfolio Showcase',
    githubUrl: 'https://github.com/johndev/test-portfolio',
  };
  const mockAccount = {
    accessToken: 'mock_access_token',
  };

  const publishResult = await publisher.publish(mockProject, mockAccount);
  assert.strictEqual(publishResult.success, true);
  assert.strictEqual(publishResult.externalUrl, 'https://github.com/johndev/test-portfolio');
  assert.strictEqual(publishResult.apiResponse.platform, 'GITHUB');
  assert.ok(publishResult.apiResponse.linkedAt instanceof Date);
  console.info('✓ Linkage execution tests passed.');

  // 3. Error Case (Missing GitHub URL)
  console.info('Verifying validation errors during publish...');
  const invalidProject = {
    title: 'Test Portfolio Showcase',
    githubUrl: null,
  };

  try {
    await publisher.publish(invalidProject, mockAccount);
    assert.fail('Should throw an error if githubUrl is missing');
  } catch (err) {
    assert.strictEqual(err.message, 'No GitHub repository URL associated with this project.');
  }
  console.info('✓ Validation error tests passed.');

  console.info('=== All GitHub Integration Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
