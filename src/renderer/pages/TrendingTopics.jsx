import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Grid, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, CircularProgress, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  BarChart as ChartIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const TrendingTopics = () => {
  const { authState } = useAuth();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchTrends();
  }, [selectedPlatform, timeRange]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      let platformTrends = [];

      if (selectedPlatform === 'twitter' && authState.twitter) {
        const data = await window.electronAPI.getTrends('twitter', timeRange);
        platformTrends = data.map(trend => ({
          ...trend,
          platform: 'twitter',
          score: calculateTrendScore(trend),
          sentiment: analyzeSentiment(trend.name)
        }));
      } else if (selectedPlatform === 'linkedin' && authState.linkedin) {
        const data = await window.electronAPI.getTrends('linkedin', timeRange);
        platformTrends = data.map(trend => ({
          ...trend,
          platform: 'linkedin',
          score: calculateTrendScore(trend),
          sentiment: analyzeSentiment(trend.title)
        }));
      }

      // Sort by score
      platformTrends.sort((a, b) => b.score - a.score);
      setTrends(platformTrends);
      
      // Generate analysis
      generateAnalysis(platformTrends);
      
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrendScore = (trend) => {
    // Calculate trend score based on volume, velocity, and engagement
    let score = 0;
    
    // Base score from tweet volume
    if (trend.tweet_volume) {
      score += Math.log(trend.tweet_volume) * 10;
    }
    
    // Boost score for recent trends
    const ageHours = (Date.now() - new Date(trend.created_at || Date.now()).getTime()) / 3600000;
    if (ageHours < 2) score *= 1.5;
    else if (ageHours < 6) score *= 1.2;
    
    // Boost score for positive sentiment
    if (trend.sentiment === 'positive') score *= 1.1;
    
    return Math.max(0, score);
  };

  const analyzeSentiment = (text) => {
    const positiveWords = ['growth', 'success', 'innovation', 'launch', 'new', 'win', 'great', 'amazing'];
    const negativeWords = ['problem', 'issue', 'fail', 'bad', 'terrible', 'hate', 'worst'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const generateAnalysis = (trends) => {
    const topCategories = {};
    const sentimentAnalysis = { positive: 0, negative: 0, neutral: 0 };
    
    trends.forEach(trend => {
      // Categorize trends
      const category = categorizeTrend(trend.name || trend.title);
      topCategories[category] = (topCategories[category] || 0) + 1;
      
      // Sentiment analysis
      sentimentAnalysis[trend.sentiment]++;
    });
    
    // Find top category
    const topCategory = Object.keys(topCategories).reduce((a, b) => 
      topCategories[a] > topCategories[b] ? a : b, '');
    
    setAnalysis({
      totalTrends: trends.length,
      topCategory,
      categoryBreakdown: topCategories,
      sentimentBreakdown: sentimentAnalysis,
      bestOpportunity: trends[0] || null,
      recommendations: generateRecommendations(trends, topCategory)
    });
  };

  const categorizeTrend = (text) => {
    const techKeywords = ['ai', 'tech', 'software', 'app', 'startup', 'innovation'];
    const businessKeywords = ['business', 'market', 'economy', 'finance', 'invest', 'startup'];
    const socialKeywords = ['social', 'media', 'viral', 'trending', 'culture', 'lifestyle'];
    const newsKeywords = ['news', 'breaking', 'update', 'announcement', 'event'];
    
    const textLower = text.toLowerCase();
    
    if (techKeywords.some(keyword => textLower.includes(keyword))) return 'Technology';
    if (businessKeywords.some(keyword => textLower.includes(keyword))) return 'Business';
    if (socialKeywords.some(keyword => textLower.includes(keyword))) return 'Social';
    if (newsKeywords.some(keyword => textLower.includes(keyword))) return 'News';
    
    return 'General';
  };

  const generateRecommendations = (trends, topCategory) => {
    const recommendations = [];
    
    // Top trend recommendation
    if (trends.length > 0) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        text: `Create content around "${trends[0].name || trends[0].title}" - it's currently trending with high engagement`
      });
    }
    
    // Category-based recommendation
    if (topCategory) {
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        text: `Focus on ${topCategory} topics - this category is dominating the conversation`
      });
    }
    
    // Sentiment-based recommendation
    const positiveTrends = trends.filter(t => t.sentiment === 'positive').length;
    const negativeTrends = trends.filter(t => t.sentiment === 'negative').length;
    
    if (positiveTrends > negativeTrends) {
      recommendations.push({
        type: 'tone',
        priority: 'medium',
        text: 'The mood is positive - create uplifting and informative content'
      });
    } else if (negativeTrends > positiveTrends) {
      recommendations.push({
        type: 'tone',
        priority: 'medium',
        text: 'The mood is negative - consider providing solutions and positive perspectives'
      });
    }
    
    // Timing recommendation
    recommendations.push({
      type: 'timing',
      priority: 'low',
      text: `Best time to post: ${getOptimalPostTime()} based on current trend activity`
    });
    
    return recommendations;
  };

  const getOptimalPostTime = () => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 10) return 'Morning (8-10 AM)';
    if (hour >= 12 && hour <= 14) return 'Afternoon (12-2 PM)';
    if (hour >= 17 && hour <= 19) return 'Evening (5-7 PM)';
    return 'Any time - check platform analytics for optimal timing';
  };

  const handleCreatePost = (trend) => {
    // Navigate to post generator with trend as topic
    window.location.href = `/post-generator?topic=${encodeURIComponent(trend.name || trend.title)}`;
  };

  const filteredTrends = trends.filter(trend => {
    // Filter out low-score trends
    return trend.score > 10;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trending Topics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTrends}
            disabled={loading}
          >
            Refresh Trends
          </Button>
        </Box>
      </Box>

      {/* Platform Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  label="Platform"
                >
                  <MenuItem value="twitter">Twitter</MenuItem>
                  <MenuItem value="linkedin">LinkedIn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="1h">Last Hour</MenuItem>
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                {authState[selectedPlatform] ? 
                  `Monitoring ${selectedPlatform.toUpperCase()} trends` : 
                  `Please connect to ${selectedPlatform.toUpperCase()} first`
                }
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      {analysis && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Trends
                    </Typography>
                    <Typography variant="h4">{analysis.totalTrends}</Typography>
                  </Box>
                  <TrendingIcon color="primary" sx={{ fontSize: 40 }} />
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
                      Top Category
                    </Typography>
                    <Typography variant="h6">{analysis.topCategory}</Typography>
                  </Box>
                  <ChartIcon color="secondary" sx={{ fontSize: 40 }} />
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
                      Positive Sentiment
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {analysis.sentimentBreakdown.positive}
                    </Typography>
                  </Box>
                  <TwitterIcon color="success" sx={{ fontSize: 40 }} />
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
                      Negative Sentiment
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {analysis.sentimentBreakdown.negative}
                    </Typography>
                  </Box>
                  <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Status Alert */}
      {(!authState.twitter && !authState.linkedin) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your social media accounts in Settings to view trending topics.
        </Alert>
      )}

      {/* Recommendations */}
      {analysis && analysis.recommendations.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Recommendations
            </Typography>
            <List>
              {analysis.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={rec.type.toUpperCase()} 
                          size="small" 
                          color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                        />
                        <Chip 
                          label={rec.priority.toUpperCase()} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={rec.text}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Trends Display */}
      <Grid container spacing={3}>
        {loading && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Analyzing trends...</Typography>
            </Box>
          </Grid>
        )}

        {filteredTrends.length === 0 && !loading && (
          <Grid item xs={12}>
            <Alert severity="info">
              No significant trends detected in the selected time range. Try a longer time range or check back later.
            </Alert>
          </Grid>
        )}

        {filteredTrends.map((trend, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {trend.platform === 'twitter' ? (
                      <TwitterIcon color="primary" />
                    ) : (
                      <LinkedInIcon color="primary" />
                    )}
                    <Typography variant="subtitle2" color="textSecondary">
                      {trend.platform.toUpperCase()}
                    </Typography>
                    <Chip
                      label={`Score: ${trend.score.toFixed(1)}`}
                      color={trend.score > 50 ? "success" : trend.score > 20 ? "warning" : "default"}
                      size="small"
                    />
                    <Chip
                      label={trend.sentiment.toUpperCase()}
                      color={trend.sentiment === 'positive' ? "success" : trend.sentiment === 'negative' ? "error" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {trend.name || trend.title}
                </Typography>
                
                {trend.description && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {trend.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {trend.tweet_volume && (
                      <Chip
                        label={`Volume: ${trend.tweet_volume}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={categorizeTrend(trend.name || trend.title)}
                      size="small"
                      color="info"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleCreatePost(trend)}
                    >
                      Create Post
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.electronAPI.openExternal(trend.url)}
                    >
                      View Trend
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

export default TrendingTopics;