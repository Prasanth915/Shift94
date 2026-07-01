/**
 * This file contains JSDoc type definitions representing DTOs, request payloads,
 * and API responses used across the Shift 9 application.
 * Using JSDoc allows these types to be recognized by IDEs in both frontend and backend.
 */

/**
 * @typedef {object} StandardResponse
 * @property {boolean} success - Indicates if the operation succeeded
 * @property {string} message - User-friendly status message
 * @property {object|null} data - Payload returned by the operation
 * @property {ValidationError[]|null} errors - Array of validation or execution errors
 */

/**
 * @typedef {object} ValidationError
 * @property {string} [field] - The field that failed validation
 * @property {string} message - Description of the validation failure
 */

/**
 * @typedef {object} PaginationMetadata
 * @property {number} total - Total number of records
 * @property {number} page - Current page number
 * @property {number} limit - Max records per page
 * @property {number} pages - Total number of pages
 */

/**
 * @typedef {object} UserDTO
 * @property {string} id - UUID of the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address
 * @property {string|null} avatar - Local path to the avatar image
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {object} ConnectedAccountDTO
 * @property {string} id - UUID of the connection
 * @property {string} userId - UUID of the owner
 * @property {string} platform - LINKEDIN | GITHUB | INSTAGRAM | PORTFOLIO
 * @property {string|null} username - Platform username
 * @property {string|null} profileUrl - Platform profile link
 * @property {string} status - CONNECTED | DISCONNECTED | EXPIRED
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {object} ProjectDTO
 * @property {string} id - UUID of the project
 * @property {string} userId - UUID of the creator
 * @property {string} title - Project title
 * @property {string|null} subtitle - Project subtitle
 * @property {string} description - Project description
 * @property {string|null} image - Local path to cover image
 * @property {string|null} githubUrl - Repository URL
 * @property {string|null} demoUrl - Live demo URL
 * @property {string[]} techStack - Technologies used
 * @property {string[]} tags - Category tags
 * @property {string} status - DRAFT | PUBLISHED
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {object} PublishLogDTO
 * @property {string} id - UUID of the log
 * @property {string} projectId - UUID of the associated project
 * @property {string} platform - LINKEDIN | GITHUB
 * @property {string} status - PENDING | PUBLISHING | PUBLISHED | FAILED
 * @property {string|null} externalUrl - Link to the published post or repository
 * @property {object|null} apiResponse - Raw response from the third-party API
 * @property {string} createdAt - ISO timestamp
 */
export {};
