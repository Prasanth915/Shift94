/**
 * Standardised API response helpers.
 * Every controller should use these to guarantee a consistent JSON envelope.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {*} data — payload to include
 * @param {string} [message='Success']
 * @param {number} [statusCode=200]
 */
function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {*} [errors=null] — optional validation / detail errors
 */
function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated success response.
 * @param {import('express').Response} res
 * @param {Array} data — page items
 * @param {number} total — total count across all pages
 * @param {number} page — current page (1-based)
 * @param {number} limit — items per page
 * @param {string} [message='Success']
 */
function paginated(res, data, total, page, limit, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

module.exports = { success, error, paginated };
