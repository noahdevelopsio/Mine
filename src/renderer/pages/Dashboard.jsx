import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Button, Alert } from '@mui/material';
import { Dashboard as DashboardIcon, Feed as FeedIcon, Edit as EditIcon, Work as WorkflowsIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { authState } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    activeWorkflows: 0,
    lastUpdated: null
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats for now - will be implemented in later phases
      setStats({
        totalPosts: 42,
        scheduledPosts: 8,
        activeWorkflows: 3,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Monitor Feeds',
      description: 'Check your social media feeds for engagement opportunities',
      icon: <FeedIcon />,
      color: 'primary',
      action: '/feed-monitor'
    },
    {
      title: 'Generate Post',
      description: 'Create engaging content with AI assistance',
      icon: <EditIcon />,
      color: 'secondary',
      action: '/post-generator'
    },
    {
      title: 'Manage Workflows',
      description: 'Configure automation workflows with N8N',
      icon: <WorkflowsIcon />,
      color: 'info',
      action: '/workflows'
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Last updated: {stats.lastUpdated}
        </Typography>
      </Box>

      {/* Authentication Status */}
      {!authState.twitter && !authState.linkedin && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your social media accounts to get started. Go to Settings to authenticate.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Posts
                  </Typography>
                  <Typography variant="h4">{stats.totalPosts}</Typography>
                </Box>
                <DashboardIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Scheduled Posts
                  </Typography>
                  <Typography variant="h4">{stats.scheduledPosts}</Typography>
                </Box>
                <EditIcon color="secondary" sx={{ fontSize: 40 }} />
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
                    Active Workflows
                  </Typography>
                  <Typography variant="h4">{stats.activeWorkflows}</Typography>
                </Box>
                <WorkflowsIcon color="info" sx={{ fontSize: 40 }} />
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
                    Connected Platforms
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      label="Twitter" 
                      color={authState.twitter ? "success" : "default"} 
                      size="small"
                    />
                    <Chip 
                      label="LinkedIn" 
                      color={authState.linkedin ? "success" : "default"} 
                      size="small"
                    />
                  </Box>
                </Box>
                <FeedIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" component="h3">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {action.description}
                        </Typography>
                      </Box>
                      <Box sx={{ color: `${action.color}.main` }}>
                        {action.icon}
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      color={action.color}
                      href={action.action}
                      fullWidth
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    AI Analytics
                  </Typography>
                  <Typography variant="body2">
                    Advanced analytics and insights powered by AI
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Content Calendar
                  </Typography>
                  <Typography variant="body2">
                    Visual calendar for planning and scheduling content
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Team Collaboration
                  </Typography>
                  <Typography variant="body2">
                    Collaborate with team members on content creation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;