import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Divider, IconButton } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Feed as FeedIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Work as WorkflowsIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const { authState, handleLogout } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Feed Monitor', icon: <FeedIcon />, path: '/feed-monitor' },
    { text: 'Post Generator', icon: <EditIcon />, path: '/post-generator' },
    { text: 'N8N Workflows', icon: <WorkflowsIcon />, path: '/workflows' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          SocialBoost AI
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Connected Platforms
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TwitterIcon sx={{ color: '#1DA1F2', mr: 1 }} />
              <Typography variant="body2">Twitter</Typography>
            </Box>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: authState.twitter ? 'success.main' : 'error.main',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LinkedInIcon sx={{ color: '#0A66C2', mr: 1 }} />
              <Typography variant="body2">LinkedIn</Typography>
            </Box>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: authState.linkedin ? 'success.main' : 'error.main',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Actions
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {authState.twitter && (
            <IconButton
              size="small"
              onClick={() => handleLogout('twitter')}
              sx={{ justifyContent: 'flex-start' }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Disconnect Twitter</Typography>
            </IconButton>
          )}
          
          {authState.linkedin && (
            <IconButton
              size="small"
              onClick={() => handleLogout('linkedin')}
              sx={{ justifyContent: 'flex-start' }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Disconnect LinkedIn</Typography>
            </IconButton>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;