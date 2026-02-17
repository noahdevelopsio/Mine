import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Grid, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, CircularProgress, IconButton, List, ListItem, ListItemText,
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Work as WorkflowsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const N8NWorkflows = () => {
  const { authState } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    trigger: 'schedule',
    schedule: '0 */1 * * *', // Every hour
    actions: [],
    enabled: true
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await window.electronAPI.getWorkflows();
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    try {
      const newWorkflow = {
        ...workflowForm,
        id: Date.now().toString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        executions: 0
      };
      
      await window.electronAPI.createWorkflow(newWorkflow);
      setWorkflows(prev => [...prev, newWorkflow]);
      setWorkflowDialogOpen(false);
      setWorkflowForm({
        name: '',
        description: '',
        trigger: 'schedule',
        schedule: '0 */1 * * *',
        actions: [],
        enabled: true
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const runWorkflow = async (workflowId) => {
    try {
      await window.electronAPI.runWorkflow(workflowId);
      // Update workflow status
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, lastRun: new Date().toISOString(), status: 'running' } : w
      ));
    } catch (error) {
      console.error('Error running workflow:', error);
    }
  };

  const toggleWorkflow = async (workflowId, enabled) => {
    try {
      await window.electronAPI.toggleWorkflow(workflowId, enabled);
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, enabled } : w
      ));
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId) => {
    try {
      await window.electronAPI.deleteWorkflow(workflowId);
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const getWorkflowStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'running': return 'info';
      case 'paused': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getWorkflowTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'schedule': return <TrendingIcon />;
      case 'feed_update': return <WorkflowsIcon />;
      case 'manual': return <SettingsIcon />;
      default: return <WorkflowsIcon />;
    }
  };

  // Pre-built workflow templates
  const workflowTemplates = [
    {
      name: 'Daily Feed Monitor',
      description: 'Monitor feeds every hour and suggest high-engagement posts',
      trigger: 'schedule',
      schedule: '0 */1 * * *',
      actions: ['fetch_twitter_feed', 'fetch_linkedin_feed', 'calculate_engagement_scores', 'send_notifications'],
      category: 'Monitoring'
    },
    {
      name: 'Trending Topic Alert',
      description: 'Get notified when new trends emerge in your industry',
      trigger: 'schedule',
      schedule: '0 */2 * * *',
      actions: ['fetch_trends', 'analyze_sentiment', 'send_email_alert'],
      category: 'Analytics'
    },
    {
      name: 'Auto-Engagement',
      description: 'Automatically like and comment on high-value posts',
      trigger: 'feed_update',
      actions: ['filter_high_value_posts', 'auto_like', 'auto_comment'],
      category: 'Engagement'
    },
    {
      name: 'Content Scheduler',
      description: 'Schedule posts during optimal times for maximum reach',
      trigger: 'schedule',
      schedule: '0 9,12,17 * * *',
      actions: ['generate_content', 'optimize_hashtags', 'schedule_post'],
      category: 'Content'
    }
  ];

  const applyTemplate = (template) => {
    setWorkflowForm({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      schedule: template.schedule || '0 */1 * * *',
      actions: template.actions,
      enabled: true
    });
    setWorkflowDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          N8N Workflows
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchWorkflows}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setWorkflowDialogOpen(true)}
          >
            Create Workflow
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      {(!authState.twitter && !authState.linkedin) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your social media accounts in Settings to use workflows.
        </Alert>
      )}

      {/* Workflow Templates */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pre-built Workflow Templates
          </Typography>
          <Grid container spacing={2}>
            {workflowTemplates.map((template, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1">{template.name}</Typography>
                      <Chip label={template.category} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {template.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => applyTemplate(template)}
                      fullWidth
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Grid container spacing={3}>
        {loading && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading workflows...</Typography>
            </Box>
          </Grid>
        )}

        {workflows.length === 0 && !loading && (
          <Grid item xs={12}>
            <Alert severity="info">
              No workflows created yet. Create your first workflow using the button above or choose from pre-built templates.
            </Alert>
          </Grid>
        )}

        {workflows.map((workflow, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {workflow.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {workflow.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={workflow.enabled ? 'Active' : 'Paused'}
                    color={workflow.enabled ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={getWorkflowTriggerIcon(workflow.trigger)}
                    label={`Trigger: ${workflow.trigger}`}
                    size="small"
                    variant="outlined"
                  />
                  {workflow.schedule && (
                    <Chip
                      label={`Schedule: ${workflow.schedule}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={`Executions: ${workflow.executions || 0}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {workflow.actions?.map((action, actionIndex) => (
                    <Chip
                      key={actionIndex}
                      label={action}
                      size="small"
                      color="primary"
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayIcon />}
                    onClick={() => runWorkflow(workflow.id)}
                    disabled={!workflow.enabled}
                  >
                    Run Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setWorkflowForm(workflow);
                      setWorkflowDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={workflow.enabled ? <PauseIcon /> : <PlayIcon />}
                    onClick={() => toggleWorkflow(workflow.id, !workflow.enabled)}
                  >
                    {workflow.enabled ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => deleteWorkflow(workflow.id)}
                  >
                    Delete
                  </Button>
                </Box>

                {workflow.lastRun && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Last run: {new Date(workflow.lastRun).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Workflow Creation Dialog */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{workflowForm.id ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workflow Name"
                value={workflowForm.name}
                onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trigger Type</InputLabel>
                <Select
                  value={workflowForm.trigger}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, trigger: e.target.value }))}
                  label="Trigger Type"
                >
                  <MenuItem value="schedule">Schedule</MenuItem>
                  <MenuItem value="feed_update">Feed Update</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cron Schedule"
                value={workflowForm.schedule}
                onChange={(e) => setWorkflowForm(prev => ({ ...prev, schedule: e.target.value }))}
                helperText="Format: minute hour day month dayOfWeek (e.g., 0 */1 * * * for every hour)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Actions (comma-separated)"
                value={workflowForm.actions.join(', ')}
                onChange={(e) => setWorkflowForm(prev => ({ 
                  ...prev, 
                  actions: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                }))}
                helperText="List of actions to execute (e.g., fetch_feed, analyze_content, send_notification)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={workflowForm.enabled}
                    onChange={(e) => setWorkflowForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                }
                label="Enable Workflow"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createWorkflow}>
            {workflowForm.id ? 'Update' : 'Create'} Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default N8NWorkflows;