const { Router } = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/history.controller');

const router = Router();

/**
 * GET /api/history
 * Retrieve paginated publish history for the authenticated user.
 * Supports ?page=1&limit=20 query parameters.
 */
router.get('/', auth, controller.getHistory);

module.exports = router;
