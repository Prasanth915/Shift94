import assert from 'assert';
import { GitHubPublisher } from '../../../publishers/github.publisher.js';

// Setup environment mock for key length validation
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function runTests() {
  console.info('=== Starting GitHub Integration Unit Tests ===');

  const publisher = new GitHubPublisher();

  // Mock the githubService methods to prevent network requests
  publisher.githubService = {
    checkRepositoryAccess: async (token, owner, repo) => true,
    createRelease: async (token, owner, repo, data) => ({
      id: 12345,
      name: data.name,
      tag_name: data.tag_name,
      published_at: new Date().toISOString(),
      html_url: `https://github.com/${owner}/${repo}/releases/tag/${data.tag_name}`,
    }),
  };

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
  assert.ok(publishResult.externalUrl.includes('/releases/tag/v1.0.'));
  assert.strictEqual(publishResult.apiResponse.platform, 'GITHUB');
  assert.strictEqual(publishResult.apiResponse.releaseId, '12345');
  assert.strictEqual(publishResult.apiResponse.releaseName, 'Shift94 Portfolio Publish');
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
