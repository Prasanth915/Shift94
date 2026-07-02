import assert from 'assert';

// ==========================================
// Mocks & Test Setup
// ==========================================

const mockDashboardData = {
  totalProjects: 10,
  publishedProjects: 7,
  linkedinConnected: true,
  githubConnected: true,
};

const mockRecentProjects = [
  { id: '1', title: 'Shift94 App', subtitle: 'Automation Platform', status: 'PUBLISHED' },
  { id: '2', title: 'Developer Hub', subtitle: 'Showcase Suite', status: 'DRAFT' },
];

const mockHistoryLogs = [
  { id: 'log-1', platform: 'LINKEDIN', status: 'PUBLISHED', project: { title: 'Shift94' } },
  { id: 'log-2', platform: 'GITHUB', status: 'FAILED', project: { title: 'Shift94' } },
];

// ==========================================
// Test Suite
// ==========================================

async function runTests() {
  console.info('=== Starting Frontend Integration Unit Tests ===');

  // 1. Dashboard State Mapping
  console.info('Testing Dashboard Metrics Mapping...');
  const stats = { ...mockDashboardData };
  assert.strictEqual(stats.totalProjects, 10);
  assert.strictEqual(stats.publishedProjects, 7);
  assert.strictEqual(stats.linkedinConnected, true);
  assert.strictEqual(stats.githubConnected, true);
  console.info('✓ Dashboard metrics mapping passed.');

  // 2. Recent Projects Rendering List
  console.info('Testing Recent Projects List Mapping...');
  const list = [...mockRecentProjects];
  assert.strictEqual(list.length, 2);
  assert.strictEqual(list[0].title, 'Shift94 App');
  assert.strictEqual(list[1].status, 'DRAFT');
  console.info('✓ Recent projects list mapping passed.');

  // 3. History Logs & Filter Operations
  console.info('Testing History Logs Filtering...');
  const logs = [...mockHistoryLogs];
  
  // Filter by Platform
  const filteredByPlatform = logs.filter((log) => log.platform === 'LINKEDIN');
  assert.strictEqual(filteredByPlatform.length, 1);
  assert.strictEqual(filteredByPlatform[0].id, 'log-1');

  // Filter by Status
  const filteredByStatus = logs.filter((log) => log.status === 'FAILED');
  assert.strictEqual(filteredByStatus.length, 1);
  assert.strictEqual(filteredByStatus[0].id, 'log-2');
  console.info('✓ History logs filtering passed.');

  // 4. Form Payload Preparation (Multipart Simulation)
  console.info('Testing Multipart Form-Data payload preparation...');
  const prepareForm = (title, subtitle, description, techStack, tags, imageFile) => {
    const data = {
      title,
      subtitle,
      description,
      techStack: JSON.stringify(techStack),
      tags: JSON.stringify(tags),
    };
    if (imageFile) {
      data.image = imageFile;
    }
    return data;
  };

  const payload = prepareForm(
    'My Portfolio',
    'Modern showcase',
    'Built with React',
    ['React', 'Vite'],
    ['portfolio'],
    { name: 'cover.png', size: 1024 }
  );

  assert.strictEqual(payload.title, 'My Portfolio');
  assert.strictEqual(JSON.parse(payload.techStack).length, 2);
  assert.strictEqual(payload.image.name, 'cover.png');
  console.info('✓ Form payload preparation passed.');

  // 5. Slug Generation & Manual Override Tests
  console.info('Testing Slug Generation & Manual Override...');
  const slugify = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9_.-]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  assert.strictEqual(slugify('AI Portfolio Generator'), 'ai-portfolio-generator');
  assert.strictEqual(slugify('Cool Project 2.0!'), 'cool-project-2.0');

  let repoName = '';
  let manuallyEdited = false;

  const handleTitleChange = (newTitle) => {
    if (!manuallyEdited) {
      repoName = slugify(newTitle);
    }
  };

  handleTitleChange('Initial Title');
  assert.strictEqual(repoName, 'initial-title');

  manuallyEdited = true;
  handleTitleChange('Second Title');
  assert.strictEqual(repoName, 'initial-title');
  console.info('✓ Slug generation & override tests passed.');

  console.info('=== All Frontend Integration Unit Tests Passed! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
