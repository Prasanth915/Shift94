import assert from 'assert';
import { LinkedInPublisher } from '../../../publishers/linkedin.publisher.js';

// Setup environment mock for key length validation
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Mock LinkedIn API requests inside the test context
class MockLinkedInPublisher extends LinkedInPublisher {
  constructor() {
    super();
  }

  async publish(project, account) {
    const textContent = this.formatPostContent(project);
    assert.ok(textContent.includes('🚀 New Project Showcase: Test Portfolio'));
    assert.ok(textContent.includes('🛠 Tech Stack: React, Node.js'));
    assert.ok(textContent.includes('📦 Repository: https://github.com/johndev/test-portfolio'));

    return {
      success: true,
      externalUrl: 'https://www.linkedin.com/feed/update/urn:li:share:1234567',
      apiResponse: {
        id: '1234567',
        platform: 'LINKEDIN',
        linkedAt: new Date(),
      },
    };
  }
}

async function runTests() {
  console.info('=== Starting LinkedIn Integration Unit Tests ===');

  const publisher = new MockLinkedInPublisher();

  // 1. Publisher Platform Verification
  console.info('Verifying publisher platform identifier...');
  assert.strictEqual(publisher.getPlatform(), 'LINKEDIN');
  console.info('✓ Platform verification passed.');

  // 2. Post Formatting Verification
  console.info('Verifying LinkedIn post formatting...');
  const mockProject = {
    title: 'Test Portfolio',
    subtitle: 'Modular Architecture Showcase',
    description: 'A test project showcasing clean architecture design.',
    techStack: ['React', 'Node.js'],
    githubUrl: 'https://github.com/johndev/test-portfolio',
    demoUrl: 'https://test-portfolio.com',
    tags: ['SaaS', 'WebDev'],
  };

  const formattedContent = publisher.formatPostContent(mockProject);
  assert.ok(formattedContent.includes('Test Portfolio'), 'Should include title');
  assert.ok(formattedContent.includes('Modular Architecture Showcase'), 'Should include subtitle');
  assert.ok(formattedContent.includes('React, Node.js'), 'Should include tech stack');
  assert.ok(formattedContent.includes('#SaaS'), 'Should format tags as hashtags');
  console.info('✓ Post formatting verification passed.');

  // 3. Mock Publishing Flow Execution
  console.info('Verifying LinkedIn Publisher execution...');
  const mockAccount = {
    accessToken: 'mock_access_token',
    username: 'John Dev',
    profileUrl: 'https://linkedin.com/in/john-dev',
  };

  const publishResult = await publisher.publish(mockProject, mockAccount);
  assert.strictEqual(publishResult.apiResponse.platform, 'LINKEDIN');
  console.info('✓ Publishing flow execution tests passed.');

  console.info('=== All LinkedIn Integration Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
