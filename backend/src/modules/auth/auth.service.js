import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';
import { BCRYPT_SALT_ROUNDS } from '../../../../shared/constants/index.js';

/**
 * Service handling core business logic for authentication and user management.
 * Enforces the Service Layer Pattern, utilizing UserRepository via Dependency Injection.
 */
export class AuthService {
  /**
   * @param {UserRepository} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Registers a new user.
   * @param {object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toDTO(user),
      token,
    };
  }

  /**
   * Authenticates a user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toDTO(user),
      token,
    };
  }

  /**
   * Generates a signed JWT.
   * @param {string} id - User UUID
   * @param {string} email
   * @returns {string}
   */
  generateToken(id, email) {
    return jwt.sign({ id, email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verifies a JWT.
   * @param {string} token
   * @returns {object} Decoded payload
   */
  verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  }

  /**
   * Retrieves user profile by ID.
   * @param {string} id - User UUID
   * @returns {Promise<object>}
   */
  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return this.toDTO(user);
  }

  /**
   * Maps a User database record to a clean Data Transfer Object, ensuring passwords are never exposed.
   * @param {object} user
   * @returns {object} UserDTO
   */
  toDTO(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
