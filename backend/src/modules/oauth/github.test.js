import assert from 'assert';
import axios from 'axios';
import { GitHubPublisher } from '../../../publishers/github.publisher.js';
import { GitHubService } from '../../../services/github.service.js';

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

  // 4. GitHubService Repository Creation & Name Check Tests
  console.info('Verifying GitHubService repository creation...');
  const service = new GitHubService();

  // Stub axios.post for successful repo creation
  const originalPost = axios.post;
  const originalPut = axios.put;
  const originalGet = axios.get;

  axios.post = async (url, data, config) => {
    if (url === 'https://api.github.com/user/repos') {
      assert.strictEqual(data.name, 'shift94-new-repo');
      assert.strictEqual(data.private, false);
      return {
        data: {
          id: 998877,
          name: 'shift94-new-repo',
          html_url: 'https://github.com/johndev/shift94-new-repo',
          owner: { login: 'johndev' },
          default_branch: 'main',
          private: false,
          created_at: '2026-07-02T11:22:53Z',
        },
      };
    }
    throw new Error('Unknown post url');
  };

  axios.put = async (url, data, config) => {
    if (url.includes('/topics')) {
      assert.deepStrictEqual(data.names, ['shift94', 'portfolio']);
      return { data: {} };
    }
    throw new Error('Unknown put url');
  };

  const createdRepo = await service.createRepository('mock_token', {
    name: 'shift94-new-repo',
    description: 'Testing portfolio creation',
    private: false,
    autoInit: true,
    topics: ['shift94', 'portfolio'],
  });

  assert.strictEqual(createdRepo.id, 998877);
  assert.strictEqual(createdRepo.name, 'shift94-new-repo');
  assert.strictEqual(createdRepo.url, 'https://github.com/johndev/shift94-new-repo');
  assert.strictEqual(createdRepo.owner, 'johndev');
  console.info('✓ Repository creation service call passed.');

  // Error Cases (409 Conflict)
  console.info('Verifying duplicate repository conflict...');
  axios.post = async () => {
    const err = new Error('Conflict');
    err.response = { status: 409, data: { message: 'Repository already exists.' } };
    throw err;
  };

  try {
    await service.createRepository('mock_token', { name: 'shift94-new-repo' });
    assert.fail('Should fail on 409 conflict');
  } catch (err) {
    assert.strictEqual(err.message, 'Repository already exists.');
    assert.strictEqual(err.statusCode, 409);
  }
  console.info('✓ Duplicate repository conflict handling passed.');

  // Error Cases (422 Invalid Name)
  console.info('Verifying invalid repository name...');
  axios.post = async () => {
    const err = new Error('Unprocessable');
    err.response = { status: 422, data: { message: 'Invalid name.' } };
    throw err;
  };

  try {
    await service.createRepository('mock_token', { name: 'invalid/name' });
    assert.fail('Should fail on 422 name validation');
  } catch (err) {
    assert.strictEqual(err.message, 'Invalid repository name.');
    assert.strictEqual(err.statusCode, 422);
  }
  console.info('✓ Invalid repository name handling passed.');

  // Error Cases (401 Expired token)
  console.info('Verifying expired OAuth token...');
  axios.post = async () => {
    const err = new Error('Unauthorized');
    err.response = { status: 401 };
    throw err;
  };

  try {
    await service.createRepository('mock_token', { name: 'repo' });
    assert.fail('Should fail on 401 unauthorized');
  } catch (err) {
    assert.strictEqual(err.message, 'GitHub authorization expired. Reconnect your account.');
    assert.strictEqual(err.statusCode, 401);
  }
  console.info('✓ Expired OAuth token handling passed.');

  // Restore axios stubs
  axios.post = originalPost;
  axios.put = originalPut;
  axios.get = originalGet;

  console.info('=== All GitHub Integration Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
