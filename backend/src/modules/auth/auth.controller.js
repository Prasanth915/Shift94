import { formatStandardResponse } from '../../../../shared/helpers/index.js';

/**
 * Controller handling HTTP request/response parsing for authentication endpoints.
 * Enforces the Controller Layer, utilizing AuthService via Dependency Injection.
 */
export class AuthController {
  /**
   * @param {AuthService} authService
   */
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Handles user registration.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  register = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register({ name, email, password });
      
      res.status(201).json(
        formatStandardResponse(true, 'Account created successfully.', result)
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles user login.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      res.status(200).json(
        formatStandardResponse(true, 'Logged in successfully.', result)
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handles retrieving current authenticated user.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getMe = async (req, res, next) => {
    try {
      const user = await this.authService.getUserById(req.user.id);
      
      res.status(200).json(
        formatStandardResponse(true, 'Profile retrieved successfully.', { user })
      );
    } catch (err) {
      next(err);
    }
  };
}
