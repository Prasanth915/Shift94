const authService = require('../services/auth.service');
const { success, error } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Register a new user account.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await authService.findUserByEmail(email);
    if (existing) {
      return error(res, 'An account with this email already exists', 409);
    }

    const user = await authService.createUser({ name, email, password });
    const token = authService.signToken({ userId: user.id, email: user.email });

    return success(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate with email and password.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const valid = await authService.comparePassword(password, user.password);
    if (!valid) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = authService.signToken({ userId: user.id, email: user.email });

    // Strip password from response
    const { password: _pw, ...userData } = user;

    return success(res, { user: userData, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 * Get the authenticated user's profile.
 */
async function getProfile(req, res, next) {
  try {
    const user = await authService.findUserById(req.user.userId);
    if (!user) {
      return error(res, 'User not found', 404);
    }
    return success(res, { user });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile (name, avatar).
 */
async function updateProfile(req, res, next) {
  try {
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.file) updateData.avatar = `/uploads/${req.file.filename}`;

    const user = await authService.updateUser(req.user.userId, updateData);
    return success(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/password
 * Change the authenticated user's password.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    return success(res, null, 'Password changed successfully');
  } catch (err) {
    if (err.message === 'Current password is incorrect') {
      return error(res, err.message, 400);
    }
    next(err);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
