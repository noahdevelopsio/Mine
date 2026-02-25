import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Import components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FeedMonitor from './pages/FeedMonitor';
import TrendingTopics from './pages/TrendingTopics';
import PostGenerator from './pages/PostGenerator';
import N8NWorkflows from './pages/N8NWorkflows';
import Analytics from './pages/Analytics';
import AISettings from './pages/AISettings';
import Settings from './pages/Settings';

// Import context
import { AuthContext } from './context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1DA1F2', // Twitter blue
    },
    secondary: {
      main: '#0A66C2', // LinkedIn blue
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
});

function App() {
  const [authState, setAuthState] = useState({
    twitter: false,
    linkedin: false,
    loading: true
  });

  useEffect(() => {
    // Check authentication status on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const twitterAuth = await window.electronAPI.getUserPreferences('twitter_authenticated');
      const linkedinAuth = await window.electronAPI.getUserPreferences('linkedin_authenticated');
      
      setAuthState({
        twitter: twitterAuth === 'true',
        linkedin: linkedinAuth === 'true',
        loading: false
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAuth = async (platform) => {
    try {
      if (platform === 'twitter') {
        await window.electronAPI.authenticateTwitter();
        setAuthState(prev => ({ ...prev, twitter: true }));
      } else if (platform === 'linkedin') {
        await window.electronAPI.authenticateLinkedIn();
        setAuthState(prev => ({ ...prev, linkedin: true }));
      }
    } catch (error) {
      console.error(`Error authenticating ${platform}:`, error);
    }
  };

  const handleLogout = async (platform) => {
    try {
      await window.electronAPI.setUserPreferences(`${platform}_authenticated`, 'false');
      setAuthState(prev => ({ ...prev, [platform]: false }));
    } catch (error) {
      console.error(`Error logging out from ${platform}:`, error);
    }
  };

  if (authState.loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <div>Loading...</div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ authState, handleAuth, handleLogout }}>
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed-monitor" element={<FeedMonitor />} />
              <Route path="/trending-topics" element={<TrendingTopics />} />
              <Route path="/post-generator" element={<PostGenerator />} />
              <Route path="/workflows" element={<N8NWorkflows />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-settings" element={<AISettings />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;