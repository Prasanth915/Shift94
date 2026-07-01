import axios from 'axios';

/**
 * Service handling direct HTTP requests to the LinkedIn API.
 * Uses OIDC (/v2/userinfo) and the Posts API (/rest/posts) with YYYYMM versioning headers.
 */
export class LinkedInService {
  /**
   * Exchanges an OAuth authorization code for an access token.
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {string} code
   * @param {string} redirectUri
   * @returns {Promise<{ accessToken: string }>}
   */
  async getAccessToken(clientId, clientSecret, code, redirectUri) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
    };
  }

  /**
   * Fetches the member's profile using OpenID Connect.
   * @param {string} accessToken - Plain text access token
   * @returns {Promise<{ id: string, name: string, email: string, avatarUrl: string|null }>}
   */
  async getUserProfile(accessToken) {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      id: response.data.sub, // OIDC subject identifier (member URN id)
      name: `${response.data.given_name} ${response.data.family_name}`,
      email: response.data.email,
      avatarUrl: response.data.picture || null,
    };
  }

  /**
   * Step 1 of Image Upload: Initializes/registers the upload request.
   * @param {string} accessToken - Plain text access token
   * @param {string} personId - Member identifier (sub)
   * @returns {Promise<{ uploadUrl: string, imageUrn: string }>}
   */
  async initializeImageUpload(accessToken, personId) {
    const response = await axios.post(
      'https://api.linkedin.com/rest/images?action=initializeUpload',
      {
        initializeUploadRequest: {
          owner: `urn:li:person:${personId}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202606',
        },
      }
    );

    const { uploadUrl, image } = response.data.value;
    return {
      uploadUrl,
      imageUrn: image,
    };
  }

  /**
   * Step 2 of Image Upload: Uploads the raw binary image.
   * @param {string} uploadUrl - URL from the initialization step
   * @param {Buffer} imageBuffer - Binary file buffer
   * @returns {Promise<void>}
   */
  async uploadImageBinary(uploadUrl, imageBuffer) {
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  }

  /**
   * Publishes a rich media post containing commentary and an optional image.
   * @param {string} accessToken - Plain text access token
   * @param {string} personId - Member identifier (sub)
   * @param {string} textContent - Post body text
   * @param {string|null} [imageUrn] - Optional image URN from the upload workflow
   * @returns {Promise<object>} API response details
   */
  async createPost(accessToken, personId, textContent, imageUrn = null) {
    const payload = {
      author: `urn:li:person:${personId}`,
      commentary: textContent,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
    };

    if (imageUrn) {
      payload.content = {
        media: {
          id: imageUrn,
        },
      };
    }

    const response = await axios.post('https://api.linkedin.com/rest/posts', payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202606',
      },
    });

    // Extract post ID from X-RestLi-Id header or response data
    const postId = response.headers['x-restli-id'] || '';
    const externalUrl = postId
      ? `https://www.linkedin.com/feed/update/urn:li:share:${postId}`
      : 'https://www.linkedin.com';

    return {
      id: postId,
      externalUrl,
      apiResponse: response.data,
    };
  }
}
