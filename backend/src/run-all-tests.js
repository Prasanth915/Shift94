import { execSync } from 'child_process';
import path from 'path';

const tests = [
  'src/modules/auth/auth.test.js',
  'src/services.test.js',
  'src/modules/projects/projects.test.js',
  'src/modules/oauth/github.test.js',
  'src/modules/oauth/linkedin.test.js',
  'src/modules/history/dashboard.test.js',
  'src/modules/history/history.test.js',
  'src/modules/settings/settings.test.js',
];

console.info('==================================================');
console.info('   Running Shift 9 Backend Test Suite Runner      ');
console.info('==================================================\n');

let passedCount = 0;
let failedCount = 0;

tests.forEach((testFile) => {
  const absolutePath = path.resolve(testFile);
  console.info(`Running: ${testFile}...`);
  try {
    const output = execSync(`node "${absolutePath}"`, { stdio: 'pipe' });
    console.info(output.toString());
    passedCount++;
  } catch (err) {
    console.error(`❌ Failed: ${testFile}`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    failedCount++;
  }
});

console.info('==================================================');
console.info('   Test Execution Summary');
console.info('==================================================');
console.info(`Total Suites: ${tests.length}`);
console.info(`Passed:       ${passedCount}`);
console.info(`Failed:       ${failedCount}`);
console.info('==================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
