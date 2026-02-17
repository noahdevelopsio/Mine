import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Select, MenuItem, FormControl, InputLabel,
  Alert, CircularProgress, Chip, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { authState } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('both');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedPlatform]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await window.electronAPI.getAnalytics({
        timeRange,
        platform: selectedPlatform
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementTrend = (analytics) => {
    if (!analytics || !analytics.engagementHistory) return 'stable';
    
    const history = analytics.engagementHistory;
    if (history.length < 2) return 'stable';
    
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    if (current > previous * 1.1) return 'up';
    if (current < previous * 0.9) return 'down';
    return 'stable';
  };

  const getTopPerformingContent = (analytics) => {
    if (!analytics || !analytics.contentPerformance) return [];
    
    return analytics.contentPerformance
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);
  };

  const getHashtagPerformance = (analytics) => {
    if (!analytics || !analytics.hashtagPerformance) return [];
    
    return analytics.hashtagPerformance
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  };

  const engagementTrend = analytics ? getEngagementTrend(analytics) : 'stable';
  const topContent = analytics ? getTopPerformingContent(analytics) : [];
  const topHashtags = analytics ? getHashtagPerformance(analytics) : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics & Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Platform</InputLabel>
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              label="Platform"
            >
              <MenuItem value="both">Both Platforms</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="linkedin">LinkedIn</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Status Alert */}
      {(!authState.twitter && !authState.linkedin) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your social media accounts in Settings to view analytics.
        </Alert>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Posts
                    </Typography>
                    <Typography variant="h4">{analytics.totalPosts}</Typography>
                  </Box>
                  <BarChartIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Engagement
                    </Typography>
                    <Typography variant="h4">{analytics.totalEngagement.toLocaleString()}</Typography>
                  </Box>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Avg Engagement Rate
                    </Typography>
                    <Typography variant="h4">{analytics.avgEngagementRate}%</Typography>
                  </Box>
                  <PieChartIcon color="secondary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Engagement Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h4">
                        {engagementTrend === 'up' ? '↗' : engagementTrend === 'down' ? '↘' : '→'}
                      </Typography>
                      <Chip
                        label={engagementTrend === 'up' ? 'Growing' : engagementTrend === 'down' ? 'Declining' : 'Stable'}
                        color={engagementTrend === 'up' ? 'success' : engagementTrend === 'down' ? 'error' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <TimelineIcon color={engagementTrend === 'up' ? 'success' : engagementTrend === 'down' ? 'error' : 'default'} sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Loading State */}
        {loading && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading analytics...</Typography>
            </Box>
          </Grid>
        )}

        {/* Top Performing Content */}
        {topContent.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Content
                </Typography>
                <List>
                  {topContent.map((content, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip label={`#${index + 1}`} size="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={content.title}
                        secondary={`Engagement: ${content.engagement.toLocaleString()} • ${content.platform.toUpperCase()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Hashtag Performance */}
        {topHashtags.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Hashtags
                </Typography>
                <List>
                  {topHashtags.map((hashtag, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip label={`#${index + 1}`} size="small" color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={hashtag.tag}
                        secondary={`Usage: ${hashtag.usage} • Reach: ${hashtag.reach.toLocaleString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Content Recommendations */}
        {analytics && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {analytics.recommendations.map((rec, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label={rec.type.toUpperCase()} size="small" color="info" />
                            <Chip label={rec.priority.toUpperCase()} size="small" variant="outlined" />
                          </Box>
                          <Typography variant="body2">
                            {rec.text}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* No Data State */}
        {!analytics && !loading && (
          <Grid item xs={12}>
            <Alert severity="info">
              No analytics data available yet. Start using the feed monitor and post generator to collect data.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Analytics;