import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Select, MenuItem, FormControl, InputLabel,
  Alert, CircularProgress, Chip, List, ListItem, ListItemText, ListItemIcon,
  Tabs, Tab, Button, IconButton, Tooltip, Badge, Divider, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Switch, FormControlLabel
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
  GetApp as GetAppIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const Analytics = () => {
  const { authState } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('both');
  const [activeTab, setActiveTab] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchScheduledPosts();
    fetchPerformanceData();
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

  const fetchScheduledPosts = async () => {
    try {
      // Mock scheduled posts - would fetch from database
      const mockScheduled = [
        {
          id: 1,
          content: 'Excited to share our latest insights on AI...',
          platform: 'twitter',
          scheduledTime: new Date(Date.now() + 3600000).toISOString(),
          status: 'scheduled'
        },
        {
          id: 2,
          content: 'New blog post: The Future of Social Media...',
          platform: 'linkedin',
          scheduledTime: new Date(Date.now() + 7200000).toISOString(),
          status: 'scheduled'
        }
      ];
      setScheduledPosts(mockScheduled);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      // Mock performance data with time series
      const data = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        data.push({
          date: format(date, 'MMM dd'),
          twitter: Math.floor(Math.random() * 100) + 50,
          linkedin: Math.floor(Math.random() * 80) + 30,
          total: Math.floor(Math.random() * 150) + 80
        });
      }
      setPerformanceData(data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    await fetchPerformanceData();
    setRefreshing(false);
  };

  const exportData = async (format) => {
    try {
      const data = await window.electronAPI.getAnalytics({
        timeRange,
        platform: selectedPlatform
      });
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
      } else if (format === 'csv') {
        // Convert to CSV
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
      }
      
      setExportDialogOpen(false);
      await window.electronAPI.showNotification('Export Complete', `Analytics data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const convertToCSV = (data) => {
    // Simple CSV conversion
    const headers = ['Metric', 'Value', 'Platform', 'Date'];
    const rows = [];
    
    if (data.contentPerformance) {
      data.contentPerformance.forEach(item => {
        rows.push([item.title, item.engagement, item.platform, format(new Date(), 'yyyy-MM-dd')]);
      });
    }
    
    return [headers, ...rows].map(row => row.join(',')).join('\\n');
  };

  const getEngagementTrend = () => {
    if (!analytics || !analytics.engagementHistory || analytics.engagementHistory.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }
    
    const current = analytics.engagementHistory[analytics.engagementHistory.length - 1];
    const previous = analytics.engagementHistory[analytics.engagementHistory.length - 2];
    
    if (previous === 0) return { direction: 'stable', percentage: 0 };
    
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const trend = getEngagementTrend();

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Analytics & Insights
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track your social media performance
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon className={refreshing ? 'spin' : ''} />}
            onClick={refreshData}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
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
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Platform</InputLabel>
                <Select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  label="Platform"
                >
                  <MenuItem value="both">All Platforms</MenuItem>
                  <MenuItem value="twitter">Twitter/X</MenuItem>
                  <MenuItem value="linkedin">LinkedIn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  icon={<DateRangeIcon />} 
                  label={`${timeRange === '1d' ? '24h' : timeRange}`} 
                  variant="outlined" 
                />
                <Chip 
                  icon={trend.direction === 'up' ? <TrendingUpIcon /> : trend.direction === 'down' ? <TrendingDownIcon /> : <TimelineIcon />}
                  label={`${trend.direction === 'up' ? '+' : ''}${trend.percentage}%`}
                  color={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'default'}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Loading analytics data...
          </Typography>
        </Box>
      )}

      {/* Key Metrics */}
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
                  <ThumbUpIcon color="success" sx={{ fontSize: 40 }} />
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
                      Reach
                    </Typography>
                    <Typography variant="h4">{analytics.totalEngagement * 10}</Typography>
                  </Box>
                  <PeopleIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<TimelineIcon />} label="Performance" />
        <Tab icon={<BarChartIcon />} label="Content" />
        <Tab icon={<ThumbUpIcon />} label="Engagement" />
        <Tab icon={<ScheduleIcon />} label="Scheduled" />
      </Tabs>

      {/* Tab 1: Performance */}
      {activeTab === 0 && analytics && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Engagement Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="twitter" stackId="1" stroke="#1DA1F2" fill="#1DA1F2" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="linkedin" stackId="1" stroke="#0A66C2" fill="#0A66C2" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Platform Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Twitter', value: 65 },
                        { name: 'LinkedIn', value: 35 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Engagement by Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { type: 'Likes', twitter: 450, linkedin: 320 },
                    { type: 'Comments', twitter: 120, linkedin: 180 },
                    { type: 'Shares', twitter: 85, linkedin: 95 },
                    { type: 'Clicks', twitter: 200, linkedin: 150 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="twitter" fill="#1DA1F2" />
                    <Bar dataKey="linkedin" fill="#0A66C2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Content Performance */}
      {activeTab === 1 && analytics && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Content
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Content</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell align="right">Engagement</TableCell>
                        <TableCell align="right">Reach</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.contentPerformance.map((content, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {content.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={content.platform.toUpperCase()} 
                              size="small" 
                              color={content.platform === 'twitter' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell align="right">{content.engagement.toLocaleString()}</TableCell>
                          <TableCell align="right">{(content.engagement * 8).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Hashtags
                </Typography>
                <List>
                  {analytics.hashtagPerformance.map((hashtag, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip label={`#${index + 1}`} size="small" color="primary" />
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
        </Grid>
      )}

      {/* Tab 3: Engagement Insights */}
      {activeTab === 2 && analytics && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI-Powered Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {analytics.recommendations.map((rec, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip 
                              label={rec.type.toUpperCase()} 
                              size="small" 
                              color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'} 
                            />
                            <Chip 
                              label={rec.priority.toUpperCase()} 
                              size="small" 
                              variant="outlined" 
                            />
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

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Best Performing Times
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tuesday, 9:00 AM"
                      secondary="Highest engagement rate (12.5%)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Wednesday, 2:00 PM"
                      secondary="Second best (10.8%)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimelineIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Thursday, 11:00 AM"
                      secondary="Consistent performance (9.2%)"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Audience Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Top Locations
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="United States (45%)" size="small" />
                      <Chip label="United Kingdom (15%)" size="small" />
                      <Chip label="Canada (12%)" size="small" />
                      <Chip label="Germany (8%)" size="small" />
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Device Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="Mobile (65%)" size="small" color="primary" />
                      <Chip label="Desktop (30%)" size="small" color="secondary" />
                      <Chip label="Tablet (5%)" size="small" />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Scheduled Posts */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Scheduled Posts
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ScheduleIcon />}
                    onClick={() => window.location.href = '/post-generator'}
                  >
                    Schedule New
                  </Button>
                </Box>
                
                {scheduledPosts.length === 0 ? (
                  <Alert severity="info">
                    No scheduled posts. Create your first scheduled post in the Post Generator.
                  </Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Content</TableCell>
                          <TableCell>Platform</TableCell>
                          <TableCell>Scheduled Time</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {scheduledPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                {post.content}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={post.platform.toUpperCase()} 
                                size="small" 
                                color={post.platform === 'twitter' ? 'primary' : 'secondary'}
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(post.scheduledTime), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={post.status.toUpperCase()} 
                                size="small" 
                                color="warning"
                              />
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined" color="error">
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Analytics Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Choose your preferred export format:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<CsvIcon />}
                onClick={() => exportData('csv')}
                fullWidth
                sx={{ py: 2 }}
              >
                CSV Format
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<GetAppIcon />}
                onClick={() => exportData('json')}
                fullWidth
                sx={{ py: 2 }}
              >
                JSON Format
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Analytics;