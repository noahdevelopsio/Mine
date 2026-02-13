const axios = require('axios');
const crypto = require('crypto');

class LinkedInAPI {
  constructor() {
    this.baseURL = 'https://api.linkedin.com/v2';
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = 'http://localhost:3000/auth/linkedin/callback';
    this.accessToken = null;
  }

  // Generate OAuth 2.0 authorization URL
  getAuthURL() {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'r_liteprofile r_emailaddress w_member_social';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scope,
      state: state
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code) {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user email
  async getUserEmail() {
    try {
      const response = await axios.get(`${this.baseURL}/emailAddress?q=members&projection=(elements*(handle~))`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user email:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's feed/posts
  async getUserFeed() {
    try {
      const response = await axios.get(`${this.baseURL}/me/feed`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user feed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's network updates
  async getNetworkUpdates() {
    try {
      const response = await axios.get(`${this.baseURL}/network/updates`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'viewer',
          count: 100
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching network updates:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get followed companies
  async getFollowedCompanies() {
    try {
      const response = await axios.get(`${this.baseURL}/me/followedCompanies`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching followed companies:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get followed schools
  async getFollowedSchools() {
    try {
      const response = await axios.get(`${this.baseURL}/me/followedSchools`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching followed schools:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get followed influencers
  async getFollowedInfluencers() {
    try {
      const response = await axios.get(`${this.baseURL}/me/followedInfluencers`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching followed influencers:', error.response?.data || error.message);
      throw error;
    }
  }

  // Post content
  async postContent(text, visibility = 'anyone') {
    try {
      const response = await axios.post(`${this.baseURL}/ugcPosts`, {
        author: `urn:li:person:${await this.getUserId()}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error posting content:', error.response?.data || error.message);
      throw error;
    }
  }

  // Like a post
  async likePost(postUrn) {
    try {
      const response = await axios.post(`${this.baseURL}/socialActions/${postUrn}/likes`, {
        actor: `urn:li:person:${await this.getUserId()}`
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error liking post:', error.response?.data || error.message);
      throw error;
    }
  }

  // Comment on a post
  async commentOnPost(postUrn, text) {
    try {
      const response = await axios.post(`${this.baseURL}/socialActions/${postUrn}/comments`, {
        actor: `urn:li:person:${await this.getUserId()}`,
        object: postUrn,
        message: {
          text: text
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error commenting on post:', error.response?.data || error.message);
      throw error;
    }
  }

  // Share a post
  async sharePost(postUrn, comment = '') {
    try {
      const response = await axios.post(`${this.baseURL}/ugcPosts`, {
        author: `urn:li:person:${await this.getUserId()}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: comment
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text: comment
                },
                originalUrl: postUrn
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'anyone'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sharing post:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user ID
  async getUserId() {
    try {
      const profile = await this.getUserProfile();
      return profile.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  }

  // Get trending content
  async getTrendingContent() {
    try {
      const response = await axios.get(`${this.baseURL}/social/trendingContent`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching trending content:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get company updates
  async getCompanyUpdates(companyId, count = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/companies/${companyId}/updates`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          count: count
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching company updates:', error.response?.data || error.message);
      throw error;
    }
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }
}

module.exports = LinkedInAPI;