import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Button, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, Switch, FormControlLabel, Alert, CircularProgress, IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  TrendingUp as TrendingIcon,
  Feed as FeedIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const FeedMonitor = () => {
  const { authState } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [settings, setSettings] = useState({
    platforms: ['twitter', 'linkedin'],
    refreshInterval: 300, // 5 minutes
    maxPosts: 50,
    engagementThreshold: 10,
    relevanceThreshold: 0.7
  });
  const [filters, setFilters] = useState({
    keywords: '',
    excludeKeywords: '',
    minLikes: 0,
    minRetweets: 0,
    verifiedOnly: false
  });

  useEffect(() => {
    if (monitoring) {
      startMonitoring();
    }
  }, [monitoring, settings]);

  const startMonitoring = async () => {
    if (!authState.twitter && !authState.linkedin) {
      alert('Please connect to at least one platform first');
      return;
    }

    setMonitoring(true);
    setLoading(true);

    try {
      // Fetch initial feeds
      await fetchFeeds();
      
      // Set up interval for monitoring
      const interval = setInterval(async () => {
        if (monitoring) {
          await fetchFeeds();
        }
      }, settings.refreshInterval * 1000);

      // Store interval ID for cleanup
      setMonitoring(interval);
    } catch (error) {
      console.error('Error starting monitoring:', error);
      setLoading(false);
    }
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    setLoading(false);
  };

  const fetchFeeds = async () => {
    try {
      const platformPromises = [];

      if (settings.platforms.includes('twitter') && authState.twitter) {
        platformPromises.push(
          window.electronAPI.getFeed('twitter', settings.maxPosts)
            .then(data => ({ platform: 'twitter', data }))
        );
      }

      if (settings.platforms.includes('linkedin') && authState.linkedin) {
        platformPromises.push(
          window.electronAPI.getFeed('linkedin', settings.maxPosts)
            .then(data => ({ platform: 'linkedin', data }))
        );
      }

      const results = await Promise.all(platformPromises);
      
      // Process and score posts
      const processedFeeds = results.flatMap(result => 
        result.data.map(post => ({
          ...post,
          platform: result.platform,
          engagementScore: calculateEngagementScore(post),
          relevanceScore: calculateRelevanceScore(post),
          shouldEngage: false
        }))
      );

      // Sort by engagement score
      processedFeeds.sort((a, b) => b.engagementScore - a.engagementScore);
      
      setFeeds(processedFeeds);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setLoading(false);
    }
  };

  const calculateEngagementScore = (post) => {
    // Calculate engagement score based on likes, retweets, comments, etc.
    const baseScore = post.public_metrics ? (
      (post.public_metrics.like_count || 0) * 1 +
      (post.public_metrics.retweet_count || 0) * 2 +
      (post.public_metrics.reply_count || 0) * 1.5
    ) : 0;

    // Boost score for verified accounts
    const verifiedBoost = post.author && post.author.verified ? 1.5 : 1;
    
    // Boost score for recent posts
    const timeBoost = Date.now() - new Date(post.created_at).getTime() < 3600000 ? 1.2 : 1;

    return baseScore * verifiedBoost * timeBoost;
  };

  const calculateRelevanceScore = (post) => {
    // Calculate relevance score based on keywords, topics, etc.
    let score = 0;
    const content = (post.text || post.content || '').toLowerCase();
    
    // Check for positive keywords
    const positiveKeywords = ['ai', 'technology', 'innovation', 'startup', 'growth', 'marketing'];
    positiveKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.1;
    });

    // Check for negative keywords (reduce score)
    const negativeKeywords = ['spam', 'scam', 'fake'];
    negativeKeywords.forEach(keyword => {
      if (content.includes(keyword)) score -= 0.2;
    });

    // Boost score for posts from followed accounts or relevant industries
    if (post.author && post.author.followed) score += 0.3;

    return Math.max(0, Math.min(1, score));
  };

  const handleEngage = async (post) => {
    try {
      if (post.platform === 'twitter') {
        // Like the tweet
        await window.electronAPI.likePost(post.platform, post.id);
      } else if (post.platform === 'linkedin') {
        // Like the post
        await window.electronAPI.likePost(post.platform, post.urn);
      }

      // Update the feed to mark as engaged
      setFeeds(prev => prev.map(p => 
        p.id === post.id ? { ...p, shouldEngage: true } : p
      ));
    } catch (error) {
      console.error('Error engaging with post:', error);
    }
  };

  const filteredFeeds = feeds.filter(post => {
    // Apply keyword filters
    if (filters.keywords && !post.text.toLowerCase().includes(filters.keywords.toLowerCase())) {
      return false;
    }

    // Apply exclude keyword filters
    if (filters.excludeKeywords && post.text.toLowerCase().includes(filters.excludeKeywords.toLowerCase())) {
      return false;
    }

    // Apply minimum likes filter
    if (filters.minLikes > 0 && (post.public_metrics?.like_count || 0) < filters.minLikes) {
      return false;
    }

    // Apply minimum retweets filter
    if (filters.minRetweets > 0 && (post.public_metrics?.retweet_count || 0) < filters.minRetweets) {
      return false;
    }

    // Apply verified only filter
    if (filters.verifiedOnly && !(post.author?.verified)) {
      return false;
    }

    // Apply engagement threshold
    if (post.engagementScore < settings.engagementThreshold) {
      return false;
    }

    // Apply relevance threshold
    if (post.relevanceScore < settings.relevanceThreshold) {
      return false;
    }

    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Feed Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={monitoring ? "outlined" : "contained"}
            color="primary"
            startIcon={monitoring ? <PauseIcon /> : <PlayIcon />}
            onClick={monitoring ? stopMonitoring : startMonitoring}
            disabled={loading}
          >
            {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchFeeds}
            disabled={loading}
          >
            Refresh Now
          </Button>
        </Box>
      </Box>

      {/* Settings Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monitoring Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Platforms</InputLabel>
                <Select
                  multiple
                  value={settings.platforms}
                  onChange={(e) => setSettings(prev => ({ ...prev, platforms: e.target.value }))}
                  label="Platforms"
                >
                  <MenuItem value="twitter">Twitter</MenuItem>
                  <MenuItem value="linkedin">LinkedIn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Refresh Interval (seconds)"
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Posts"
                type="number"
                value={settings.maxPosts}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPosts: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Engagement Threshold"
                type="number"
                value={settings.engagementThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, engagementThreshold: parseInt(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Keywords (include)"
                value={filters.keywords}
                onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Keywords (exclude)"
                value={filters.excludeKeywords}
                onChange={(e) => setFilters(prev => ({ ...prev, excludeKeywords: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Likes"
                type="number"
                value={filters.minLikes}
                onChange={(e) => setFilters(prev => ({ ...prev, minLikes: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Retweets"
                type="number"
                value={filters.minRetweets}
                onChange={(e) => setFilters(prev => ({ ...prev, minRetweets: parseInt(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  />
                }
                label="Verified accounts only"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {(!authState.twitter && !authState.linkedin) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your social media accounts in Settings to start monitoring feeds.
        </Alert>
      )}

      {/* Feeds Display */}
      <Grid container spacing={3}>
        {loading && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Fetching feeds...</Typography>
            </Box>
          </Grid>
        )}

        {filteredFeeds.length === 0 && !loading && (
          <Grid item xs={12}>
            <Alert severity="info">
              No posts match your current filters. Try adjusting the settings or wait for new content.
            </Alert>
          </Grid>
        )}

        {filteredFeeds.map((post, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {post.platform === 'twitter' ? (
                      <TwitterIcon color="primary" />
                    ) : (
                      <LinkedInIcon color="primary" />
                    )}
                    <Typography variant="subtitle2" color="textSecondary">
                      {post.platform.toUpperCase()}
                    </Typography>
                    <Chip
                      label={`Engagement: ${post.engagementScore.toFixed(1)}`}
                      color={post.engagementScore > 50 ? "success" : post.engagementScore > 20 ? "warning" : "default"}
                      size="small"
                    />
                    <Chip
                      label={`Relevance: ${(post.relevanceScore * 100).toFixed(0)}%`}
                      color={post.relevanceScore > 0.8 ? "success" : post.relevanceScore > 0.5 ? "warning" : "default"}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>
                </Box>
                
                <Typography variant="body1" paragraph>
                  {post.text || post.content}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {post.author && (
                      <Chip
                        label={post.author.name || post.author.username}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {post.author?.verified && (
                      <Chip
                        label="Verified"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleEngage(post)}
                      disabled={post.shouldEngage}
                    >
                      {post.shouldEngage ? 'Engaged' : 'Engage'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.electronAPI.openExternal(post.url)}
                    >
                      View Post
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeedMonitor;