import React, { useState, useContext, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Alert, Chip, List, ListItem,
  ListItemText, ListItemIcon, Switch, FormControlLabel, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { authState, handleAuth, handleLogout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    autoEngage: false,
    dataRetention: '30d',
    theme: 'light',
    aiModel: 'llama3.2',
    n8nEnabled: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI.getUserPreferences('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await window.electronAPI.setUserPreferences('app_settings', JSON.stringify(settings));
      await window.electronAPI.showNotification('Settings Saved', 'Your preferences have been updated.');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (window.confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
      try {
        await window.electronAPI.clearCachedData();
        await window.electronAPI.showNotification('Data Cleared', 'All cached data has been removed.');
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  const refreshConnections = async () => {
    try {
      await window.electronAPI.refreshConnections();
      await window.electronAPI.showNotification('Connections Refreshed', 'API connections have been refreshed.');
    } catch (error) {
      console.error('Error refreshing connections:', error);
    }
  };

  const exportData = async () => {
    try {
      const data = await window.electronAPI.exportData();
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `socialboost-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshConnections}
          >
            Refresh Connections
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            disabled={loading}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Account Connections */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Account Connections</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TwitterIcon color={authState.twitter ? "primary" : "disabled"} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Twitter"
                    secondary={authState.twitter ? "Connected" : "Not connected"}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!authState.twitter ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAuth('twitter')}
                      >
                        Connect
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleLogout('twitter')}
                      >
                        Disconnect
                      </Button>
                    )}
                  </Box>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LinkedInIcon color={authState.linkedin ? "primary" : "disabled"} />
                  </ListItemIcon>
                  <ListItemText
                    primary="LinkedIn"
                    secondary={authState.linkedin ? "Connected" : "Not connected"}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!authState.linkedin ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAuth('linkedin')}
                      >
                        Connect
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleLogout('linkedin')}
                      >
                        Disconnect
                      </Button>
                    )}
                  </Box>
                </ListItem>
              </List>

              {authState.twitter || authState.linkedin ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  You have {authState.twitter + authState.linkedin} platform(s) connected
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Connect at least one platform to use all features
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Application Settings</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                      />
                    }
                    label="Enable Notifications"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoEngage}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoEngage: e.target.checked }))}
                      />
                    }
                    label="Auto-Engagement Mode"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Data Retention</InputLabel>
                    <Select
                      value={settings.dataRetention}
                      onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                      label="Data Retention"
                    >
                      <MenuItem value="7d">7 days</MenuItem>
                      <MenuItem value="30d">30 days</MenuItem>
                      <MenuItem value="90d">90 days</MenuItem>
                      <MenuItem value="1y">1 year</MenuItem>
                      <MenuItem value="indefinite">Keep indefinitely</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>AI Model</InputLabel>
                    <Select
                      value={settings.aiModel}
                      onChange={(e) => setSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                      label="AI Model"
                    >
                      <MenuItem value="llama3.2">Llama 3.2</MenuItem>
                      <MenuItem value="mistral">Mistral</MenuItem>
                      <MenuItem value="gemma2">Gemma 2</MenuItem>
                      <MenuItem value="custom">Custom Model</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.n8nEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, n8nEnabled: e.target.checked }))}
                      />
                    }
                    label="Enable N8N Workflows"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <StorageIcon color="primary" />
                <Typography variant="h6">Data Management</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={clearData}
                    color="error"
                    fullWidth
                  >
                    Clear Cached Data
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshConnections}
                    fullWidth
                  >
                    Refresh Connections
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={exportData}
                    fullWidth
                  >
                    Export Data
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                    onClick={() => window.electronAPI.showNotification('Test', 'This is a test notification')}
                    fullWidth
                  >
                    Test Notifications
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">System Information</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Application Version"
                    secondary="1.0.0"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Electron Version"
                    secondary={process.versions.electron}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Node.js Version"
                    secondary={process.versions.node}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Platform"
                    secondary={process.platform}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data Location"
                    secondary="Local SQLite Database"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Help & Support */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6">Help & Support</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Documentation"
                    secondary="View user guide and API documentation"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => window.electronAPI.openExternal('https://github.com/your-repo/docs')}
                  >
                    Open
                  </Button>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Report Issue"
                    secondary="Submit bug reports or feature requests"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => window.electronAPI.openExternal('https://github.com/your-repo/issues')}
                  >
                    Report
                  </Button>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Privacy Policy"
                    secondary="Learn about data handling and privacy"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => window.electronAPI.openExternal('https://github.com/your-repo/privacy')}
                  >
                    View
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;