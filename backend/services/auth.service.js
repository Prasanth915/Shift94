const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 * @param {string} password
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT containing the user's id and email.
 * @param {{ userId: string, email: string }} payload
 * @returns {string} signed JWT
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

/**
 * Create a new user after hashing their password.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<object>} created user (without password)
 */
async function createUser({ name, email, password }) {
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });
  return user;
}

/**
 * Find a user by email (includes password for login verification).
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Find a user by ID (excludes password).
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });
}

/**
 * Update a user's profile fields.
 * @param {string} id
 * @param {{ name?: string, avatar?: string }} data
 * @returns {Promise<object>} updated user (without password)
 */
async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });
}

/**
 * Change a user's password (verifies old password first).
 * @param {string} id
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<boolean>} true if changed successfully
 * @throws {Error} if current password is incorrect
 */
async function changePassword(id, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw new Error('Current password is incorrect');

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return true;
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  changePassword,
};
