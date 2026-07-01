import dotenv from 'dotenv';
import path from 'url';

// Load environment variables from .env file
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_should_never_be_used_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    redirectUri: process.env.GITHUB_REDIRECT_URI || '',
  },
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
};

// Validate that required variables are present in production
if (config.nodeEnv === 'production') {
  const missing = [];
  if (!config.jwt.secret || config.jwt.secret.length < 32) missing.push('JWT_SECRET');
  if (!config.encryptionKey || config.encryptionKey.length !== 64) missing.push('ENCRYPTION_KEY');
  if (missing.length > 0) {
    throw new Error(`Critical environment variables missing or invalid: ${missing.join(', ')}`);
  }
}

export default config;
