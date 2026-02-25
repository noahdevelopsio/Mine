const axios = require('axios');
const crypto = require('crypto');

class TwitterAPI {
  constructor() {
    this.baseURL = 'https://api.twitter.com/2';
    this.clientId = process.env.TWITTER_CLIENT_ID;
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET;
    this.redirectUri = 'http://localhost:3000/auth/twitter/callback';
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Generate OAuth 2.0 authorization URL
  getAuthURL() {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'tweet.read tweet.write users.read follows.read follows.write';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scope,
      state: state,
      code_challenge: this.generateCodeChallenge(),
      code_challenge_method: 'S256'
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  // Generate PKCE code challenge
  generateCodeChallenge() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code, codeVerifier) {
    try {
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
        client_id: this.clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error.response?.data || error.message);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
        client_id: this.clientId,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's home timeline
  async getHomeTimeline(maxResults = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/users/me/timelines/reverse_chronological`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          max_results: maxResults,
          expansions: 'author_id',
          'tweet.fields': 'created_at,public_metrics,conversation_id',
          'user.fields': 'name,username,verified'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching home timeline:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's mentions
  async getMentions(maxResults = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/users/me/mentions`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          max_results: maxResults,
          expansions: 'author_id',
          'tweet.fields': 'created_at,public_metrics,conversation_id',
          'user.fields': 'name,username,verified'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching mentions:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's feed (timeline)
  async getFeed(limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/users/me/timelines/reverse_chronological`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          max_results: limit,
          expansions: 'author_id',
          'tweet.fields': 'created_at,public_metrics,conversation_id',
          'user.fields': 'name,username,verified'
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching Twitter feed:', error);
      return [];
    }
  }

  // Like a post
  async likePost(postId) {
    try {
      const response = await axios.post(`${this.baseURL}/users/me/likes`, {
        tweet_id: postId
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error liking Twitter post:', error);
      return false;
    }
  }

  // Get trending topics
  async getTrends(timeRange = '1h') {
    try {
      // Twitter doesn't have a direct trends endpoint for specific time ranges
      // This is a mock implementation that would integrate with Twitter's trends API
      const trends = [
        { name: '#AI', tweet_volume: 50000, created_at: new Date().toISOString() },
        { name: '#SocialMedia', tweet_volume: 30000, created_at: new Date().toISOString() },
        { name: '#Marketing', tweet_volume: 25000, created_at: new Date().toISOString() },
        { name: '#Technology', tweet_volume: 20000, created_at: new Date().toISOString() },
        { name: '#Innovation', tweet_volume: 15000, created_at: new Date().toISOString() }
      ];
      
      return trends;
    } catch (error) {
      console.error('Error fetching Twitter trends:', error);
      return [];
    }
  }

  // Get trending topics
  async getTrends(woeid = 1) { // WOEID 1 is worldwide
    try {
      const response = await axios.get(`${this.baseURL}/trends/place`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          id: woeid
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error.response?.data || error.message);
      throw error;
    }
  }

  // Post a tweet
  async postTweet(text) {
    try {
      const response = await axios.post(`${this.baseURL}/tweets`, {
        text: text
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error posting tweet:', error.response?.data || error.message);
      throw error;
    }
  }

  // Like a tweet
  async likeTweet(tweetId) {
    try {
      const response = await axios.post(`${this.baseURL}/users/me/likes`, {
        tweet_id: tweetId
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error liking tweet:', error.response?.data || error.message);
      throw error;
    }
  }

  // Retweet
  async retweet(tweetId) {
    try {
      const response = await axios.post(`${this.baseURL}/users/me/retweets`, {
        tweet_id: tweetId
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error retweeting:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user info
  async getUserInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          'user.fields': 'created_at,description,public_metrics,verified'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      throw error;
    }
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }
}

module.exports = TwitterAPI;