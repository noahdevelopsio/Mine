import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Switch, FormControlLabel, Alert, Chip, List, ListItem,
  ListItemText, ListItemIcon, Divider, LinearProgress, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Slider, Accordion,
  AccordionSummary, AccordionDetails, Badge
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  ModelTraining as ModelIcon,
  Speed as SpeedIcon,
  Thermostat as TemperatureIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const AISettings = () => {
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  
  // AI Configuration
  const [config, setConfig] = useState({
    ollamaHost: 'localhost',
    ollamaPort: '11434',
    defaultModel: 'llama3.2',
    fallbackModel: 'mistral',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    timeout: 60,
    cacheEnabled: true,
    autoFallback: true,
    streamingEnabled: false
  });

  // Available models (would be fetched from Ollama)
  const [availableModels, setAvailableModels] = useState([
    { name: 'llama3.2', description: 'Meta Llama 3.2 - Balanced performance', size: '2.0 GB' },
    { name: 'mistral', description: 'Mistral - Fast and efficient', size: '4.1 GB' },
    { name: 'gemma2', description: 'Google Gemma 2 - High quality', size: '5.2 GB' },
    { name: 'codellama', description: 'Code Llama - Technical content', size: '3.8 GB' }
  ]);

  useEffect(() => {
    checkOllamaStatus();
    loadConfig();
    loadPerformanceHistory();
  }, []);

  const checkOllamaStatus = async () => {
    setLoading(true);
    try {
      const status = await window.electronAPI.checkOllamaStatus();
      setOllamaStatus(status);
      
      if (status.availableModels) {
        setAvailableModels(status.availableModels.map(name => ({
          name,
          description: getModelDescription(name),
          size: 'Unknown'
        })));
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaStatus({ available: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getModelDescription = (modelName) => {
    const descriptions = {
      'llama3.2': 'Meta Llama 3.2 - Balanced performance and quality',
      'mistral': 'Mistral - Fast and efficient for most tasks',
      'gemma2': 'Google Gemma 2 - High quality outputs',
      'codellama': 'Code Llama - Optimized for technical content',
      'phi3': 'Microsoft Phi-3 - Compact and fast'
    };
    return descriptions[modelName] || `${modelName} - AI Model`;
  };

  const loadConfig = async () => {
    try {
      const savedConfig = await window.electronAPI.getUserPreferences('ai_config');
      if (savedConfig) {
        setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await window.electronAPI.setUserPreferences('ai_config', JSON.stringify(config));
      await window.electronAPI.showNotification('Settings Saved', 'AI configuration has been updated');
    } catch (error) {
      console.error('Error saving AI config:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadPerformanceHistory = () => {
    // Mock performance history - in real app would load from database
    const mockHistory = [
      { time: '10:00', responseTime: 2.3, tokensPerSecond: 45 },
      { time: '10:05', responseTime: 1.8, tokensPerSecond: 52 },
      { time: '10:10', responseTime: 2.1, tokensPerSecond: 48 },
      { time: '10:15', responseTime: 1.9, tokensPerSecond: 50 },
      { time: '10:20', responseTime: 2.0, tokensPerSecond: 49 }
    ];
    setPerformanceHistory(mockHistory);
  };

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const status = await window.electronAPI.checkOllamaStatus();
      if (status.available) {
        setTestResult({ success: true, message: `Connected to Ollama (${status.defaultModel})` });
      } else {
        setTestResult({ success: false, message: status.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = () => {
    if (!ollamaStatus) {
      return <Chip icon={<RefreshIcon className="spin" />} label="Checking..." color="default" />;
    }
    
    if (ollamaStatus.available) {
      return (
        <Chip 
          icon={<CheckCircleIcon />} 
          label={`Online - ${ollamaStatus.defaultModel}`} 
          color="success" 
        />
      );
    }
    
    return (
      <Chip 
        icon={<ErrorIcon />} 
        label="Offline" 
        color="error" 
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              AI Settings
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configure Ollama AI integration
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {getStatusChip()}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={checkOllamaStatus}
            disabled={loading}
          >
            Refresh Status
          </Button>
        </Box>
      </Box>

      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Connection Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StorageIcon color="primary" />
                <Typography variant="h6">Ollama Connection</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Host"
                    value={config.ollamaHost}
                    onChange={(e) => setConfig(prev => ({ ...prev, ollamaHost: e.target.value }))}
                    placeholder="localhost"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Port"
                    value={config.ollamaPort}
                    onChange={(e) => setConfig(prev => ({ ...prev, ollamaPort: e.target.value }))}
                    placeholder="11434"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={testConnection}
                  disabled={loading}
                  fullWidth
                >
                  Test Connection
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveConfig}
                  disabled={saving}
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Model Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ModelIcon color="primary" />
                <Typography variant="h6">Model Configuration</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Model</InputLabel>
                    <Select
                      value={config.defaultModel}
                      onChange={(e) => setConfig(prev => ({ ...prev, defaultModel: e.target.value }))}
                      label="Default Model"
                    >
                      {availableModels.map((model) => (
                        <MenuItem key={model.name} value={model.name}>
                          <Box>
                            <Typography variant="body2">{model.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {model.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fallback Model</InputLabel>
                    <Select
                      value={config.fallbackModel}
                      onChange={(e) => setConfig(prev => ({ ...prev, fallbackModel: e.target.value }))}
                      label="Fallback Model"
                    >
                      {availableModels.map((model) => (
                        <MenuItem key={model.name} value={model.name}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <FormControlLabel
                control={
                  <Switch
                    checked={config.autoFallback}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoFallback: e.target.checked }))}
                  />
                }
                label="Enable Auto-Fallback on Failure"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Generation Parameters */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Generation Parameters</Typography>
              </Box>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Temperature: {config.temperature}
                    <Tooltip title="Higher values make output more random, lower values more deterministic">
                      <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Typography>
                  <Slider
                    value={config.temperature}
                    onChange={(e, v) => setConfig(prev => ({ ...prev, temperature: v }))}
                    min={0}
                    max={2}
                    step={0.1}
                    marks={[
                      { value: 0, label: 'Precise' },
                      { value: 1, label: 'Balanced' },
                      { value: 2, label: 'Creative' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Top P: {config.topP}
                    <Tooltip title="Nucleus sampling parameter">
                      <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Typography>
                  <Slider
                    value={config.topP}
                    onChange={(e, v) => setConfig(prev => ({ ...prev, topP: v }))}
                    min={0}
                    max={1}
                    step={0.05}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>
                    Max Tokens: {config.maxTokens}
                  </Typography>
                  <Slider
                    value={config.maxTokens}
                    onChange={(e, v) => setConfig(prev => ({ ...prev, maxTokens: v }))}
                    min={256}
                    max={4096}
                    step={256}
                    marks={[
                      { value: 256, label: '256' },
                      { value: 2048, label: '2K' },
                      { value: 4096, label: '4K' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Timeout (seconds)"
                    type="number"
                    value={config.timeout}
                    onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                    helperText="Maximum time to wait for AI response"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.cacheEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, cacheEnabled: e.target.checked }))}
                    />
                  }
                  label="Enable Response Caching"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.streamingEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, streamingEnabled: e.target.checked }))}
                    />
                  }
                  label="Enable Streaming Responses (Experimental)"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        {ollamaStatus?.available && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon color="primary" />
                  <Typography variant="h6">Performance Metrics</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Response Time (seconds)
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="responseTime" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tokens Per Second
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="tokensPerSecond" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Available Models Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Models
              </Typography>
              <List>
                {availableModels.map((model, index) => (
                  <React.Fragment key={model.name}>
                    <ListItem>
                      <ListItemIcon>
                        <ModelIcon color={model.name === config.defaultModel ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {model.name}
                            {model.name === config.defaultModel && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                            {model.name === config.fallbackModel && (
                              <Chip label="Fallback" size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={`${model.description} • ${model.size}`}
                      />
                    </ListItem>
                    {index < availableModels.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AISettings;