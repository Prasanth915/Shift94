import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encrypt } from '../utils/encryption.js';

const prisma = new PrismaClient();

async function main() {
  console.info('Seeding database with development data...');

  // 1. Clean existing data
  await prisma.publishLog.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.connectedAccount.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create mock user
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.create({
    data: {
      name: 'John Developer',
      email: 'john@example.com',
      password: hashedPassword,
      avatar: null,
    },
  });
  console.info(`Created User: ${user.name} (${user.email})`);

  // 3. Create mock connected accounts
  const githubAccount = await prisma.connectedAccount.create({
    data: {
      userId: user.id,
      platform: 'GITHUB',
      accessToken: encrypt('mock_github_token'),
      refreshToken: null,
      username: 'johndev',
      profileUrl: 'https://github.com/johndev',
      status: 'CONNECTED',
    },
  });

  const linkedinAccount = await prisma.connectedAccount.create({
    data: {
      userId: user.id,
      platform: 'LINKEDIN',
      accessToken: encrypt('mock_linkedin_token'),
      refreshToken: encrypt('mock_linkedin_refresh_token'),
      username: 'John Developer',
      profileUrl: 'https://linkedin.com/in/johndev',
      status: 'CONNECTED',
    },
  });
  console.info('Created Connected Accounts for GitHub and LinkedIn');

  // 4. Create mock projects
  const project1 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Shift94',
      subtitle: 'Developer Portfolio Automation Platform',
      description: 'A modern web application that allows developers to create one project post and publish it to multiple professional platforms from one dashboard.',
      githubUrl: 'https://github.com/johndev/shift94',
      demoUrl: 'http://localhost:5173',
      techStack: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Prisma'],
      tags: ['SaaS', 'Automation', 'Portfolio'],
      status: 'PUBLISHED',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Personal Dev Blog',
      subtitle: 'My thoughts on software engineering',
      description: 'A static blog built with Next.js and Markdown, styled with Tailwind CSS, and hosted on a local server.',
      githubUrl: 'https://github.com/johndev/blog',
      demoUrl: null,
      techStack: ['Next.js', 'Markdown', 'Tailwind CSS'],
      tags: ['Blog', 'Nextjs'],
      status: 'DRAFT',
    },
  });
  console.info('Created Projects');

  // 5. Create mock publish logs
  await prisma.publishLog.create({
    data: {
      projectId: project1.id,
      platform: 'LINKEDIN',
      status: 'PUBLISHED',
      externalUrl: 'https://linkedin.com/feed/update/urn:li:activity:7123456789012345678',
      apiResponse: { id: 'urn:li:share:1234567', visibility: 'PUBLIC' },
    },
  });

  await prisma.publishLog.create({
    data: {
      projectId: project1.id,
      platform: 'GITHUB',
      status: 'PUBLISHED',
      externalUrl: 'https://github.com/johndev/shift94',
      apiResponse: { message: 'Repository linked successfully' },
    },
  });

  await prisma.publishLog.create({
    data: {
      projectId: project2.id,
      platform: 'LINKEDIN',
      status: 'FAILED',
      externalUrl: null,
      apiResponse: { error: 'Access token expired', code: 401 },
    },
  });
  console.info('Created Publish Logs');

  console.info('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
