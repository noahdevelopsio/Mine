import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Chip, Alert,
  CircularProgress, Select, MenuItem, FormControl, InputLabel, Tabs, Tab,
  Accordion, AccordionSummary, AccordionDetails, Chip as MuiChip, Tooltip,
  LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Badge, Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  AutoFixHigh as AutoFixIcon,
  Hashtag as HashtagIcon,
  Schedule as ScheduleIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const PostGenerator = () => {
  const { authState } = useAuth();
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Form states
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [industry, setIndustry] = useState('technology');
  
  // Draft improvement
  const [draft, setDraft] = useState('');
  const [improvedDraft, setImprovedDraft] = useState('');
  
  // Generated content
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [variations, setVariations] = useState([]);
  const [contentIdeas, setContentIdeas] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [copySnackbar, setCopySnackbar] = useState(false);
  const [error, setError] = useState(null);

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const status = await window.electronAPI.checkOllamaStatus();
      setOllamaStatus(status);
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaStatus({ available: false, error: error.message });
    }
  };

  const generatePost = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setLoadingStage('Generating content with AI...');
    setError(null);

    try {
      const result = await window.electronAPI.generatePost(topic, platform, {
        tone,
        length,
        includeHashtags: true,
        temperature: 0.7
      });
      
      if (result.error) {
        setError(result.error);
      }
      
      setGeneratedPosts(prev => [result, ...prev]);
      
      // Generate hashtags
      setLoadingStage('Generating hashtags...');
      const hashtagResult = await window.electronAPI.suggestHashtags(result.content, platform);
      setHashtags(hashtagResult);
      
      // Generate variations
      setLoadingStage('Creating variations...');
      try {
        const variationsResult = await window.electronAPI.generateVariations(result.content, platform, 3);
        setVariations(variationsResult);
      } catch (e) {
        console.log('Variations generation skipped');
      }
      
    } catch (error) {
      console.error('Error generating post:', error);
      setError('Failed to generate post. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const improveDraftHandler = async () => {
    if (!draft.trim()) {
      setError('Please enter your draft');
      return;
    }

    setLoading(true);
    setLoadingStage('Improving your draft with AI...');
    setError(null);

    try {
      const result = await window.electronAPI.improveDraft(draft, platform);
      setImprovedDraft(result);
    } catch (error) {
      console.error('Error improving draft:', error);
      setError('Failed to improve draft. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const suggestHashtagsHandler = async () => {
    const content = topic || draft;
    if (!content.trim()) {
      setError('Please enter a topic or draft first');
      return;
    }

    setLoading(true);
    setLoadingStage('Suggesting hashtags...');
    setError(null);

    try {
      const result = await window.electronAPI.suggestHashtags(content, platform);
      setHashtags(result);
    } catch (error) {
      console.error('Error suggesting hashtags:', error);
      setError('Failed to suggest hashtags. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const generateContentIdeas = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setLoadingStage('Generating content ideas...');
    setError(null);

    try {
      const trends = [topic, 'trending', 'industry news'];
      const ideas = await window.electronAPI.generateContentIdeas(trends, industry, 5);
      setContentIdeas(ideas);
    } catch (error) {
      console.error('Error generating content ideas:', error);
      setError('Failed to generate content ideas. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const postToPlatform = async (postContent) => {
    try {
      await window.electronAPI.postContent(postContent, platform);
      await window.electronAPI.showNotification('Post Published', 'Your post has been published successfully!');
      setError(null);
    } catch (error) {
      console.error('Error posting to platform:', error);
      setError('Failed to post. Please try again.');
    }
  };

  const schedulePostHandler = async (postContent) => {
    if (!scheduledTime) {
      setError('Please select a scheduled time');
      return;
    }

    try {
      await window.electronAPI.schedulePost(postContent, platform, scheduledTime);
      await window.electronAPI.showNotification('Post Scheduled', 'Your post has been scheduled successfully!');
      setError(null);
    } catch (error) {
      console.error('Error scheduling post:', error);
      setError('Failed to schedule post. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySnackbar(true);
  };

  const getOllamaStatusChip = () => {
    if (!ollamaStatus) {
      return <Chip icon={<CircularProgress size={16} />} label="Checking AI..." size="small" />;
    }
    
    if (ollamaStatus.available) {
      return (
        <Tooltip title={`Using ${ollamaStatus.defaultModel} model`}>
          <Chip 
            icon={<CheckCircleIcon />} 
            label="AI Ready" 
            color="success" 
            size="small" 
          />
        </Tooltip>
      );
    }
    
    return (
      <Tooltip title={ollamaStatus.error || 'Ollama not available'}>
        <Chip 
          icon={<ErrorIcon />} 
          label="AI Offline" 
          color="error" 
          size="small" 
        />
      </Tooltip>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              AI Post Generator
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Powered by Ollama AI
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {getOllamaStatusChip()}
          <Button
            variant="outlined"
            size="small"
            onClick={checkOllamaStatus}
            startIcon={<RefreshIcon />}
          >
            Refresh AI
          </Button>
        </Box>
      </Box>

      {/* Ollama Status Alert */}
      {ollamaStatus && !ollamaStatus.available && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Ollama AI Not Available</AlertTitle>
          Make sure Ollama is running on localhost:11434. The app will use fallback content generation.
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading Progress */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            {loadingStage}
          </Typography>
        </Box>
      )}

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<AutoFixIcon />} label="Generate from Topic" />
        <Tab icon={<EditIcon />} label="Improve Draft" />
        <Tab icon={<LightbulbIcon />} label="Content Ideas" />
      </Tabs>

      {/* Tab 1: Generate from Topic */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  What would you like to post about?
                </Typography>
                
                <TextField
                  fullWidth
                  label="Enter your topic or idea"
                  multiline
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI in social media marketing, new product launch, industry insights..."
                  sx={{ mb: 3 }}
                />
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Platform</InputLabel>
                      <Select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        label="Platform"
                      >
                        <MenuItem value="twitter">Twitter/X</MenuItem>
                        <MenuItem value="linkedin">LinkedIn</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Tone</InputLabel>
                      <Select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        label="Tone"
                      >
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="casual">Casual</MenuItem>
                        <MenuItem value="educational">Educational</MenuItem>
                        <MenuItem value="inspirational">Inspirational</MenuItem>
                        <MenuItem value="humorous">Humorous</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Length</InputLabel>
                      <Select
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        label="Length"
                      >
                        <MenuItem value="short">Short</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="long">Long</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Schedule Time"
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={generatePost}
                    disabled={loading || !topic.trim()}
                    fullWidth
                    size="large"
                  >
                    Generate with AI
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HashtagIcon />}
                    onClick={suggestHashtagsHandler}
                    disabled={loading || !topic.trim()}
                  >
                    Get Hashtags
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip 
                    icon={<CheckCircleIcon color="success" />} 
                    label="Smart Content Generation" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<CheckCircleIcon color="success" />} 
                    label="Hashtag Optimization" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<CheckCircleIcon color="success" />} 
                    label="Platform-Specific Formatting" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<CheckCircleIcon color="success" />} 
                    label="Tone Customization" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<CheckCircleIcon color="success" />} 
                    label="Multiple Variations" 
                    variant="outlined" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Improve Draft */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Draft
                </Typography>
                <TextField
                  fullWidth
                  label="Paste your rough draft here"
                  multiline
                  rows={8}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Start writing your post..."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AutoFixIcon />}
                  onClick={improveDraftHandler}
                  disabled={loading || !draft.trim()}
                  fullWidth
                >
                  Improve with AI
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Improved Version
                </Typography>
                {improvedDraft ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={improvedDraft}
                      InputProps={{ readOnly: true }}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => postToPlatform(improvedDraft)}
                        disabled={!authState[platform]}
                      >
                        Post Now
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyToClipboard(improvedDraft)}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <AutoFixIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography>
                      Your improved draft will appear here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Content Ideas */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate Content Ideas
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Artificial Intelligence"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        label="Industry"
                      >
                        <MenuItem value="technology">Technology</MenuItem>
                        <MenuItem value="marketing">Marketing</MenuItem>
                        <MenuItem value="finance">Finance</MenuItem>
                        <MenuItem value="healthcare">Healthcare</MenuItem>
                        <MenuItem value="education">Education</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  startIcon={<LightbulbIcon />}
                  onClick={generateContentIdeas}
                  disabled={loading || !topic.trim()}
                >
                  Generate Ideas
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {contentIdeas.map((idea, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {idea.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {idea.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={idea.platform} size="small" color="primary" />
                    <Chip label={industry} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Generated Posts Section */}
      {generatedPosts.length > 0 && activeTab === 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Generated Content
          </Typography>
          
          {/* Main Generated Post */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Chip label={platform.toUpperCase()} color="primary" size="small" sx={{ mr: 1 }} />
                  <Chip label={tone} variant="outlined" size="small" />
                </Box>
                <Box>
                  {generatedPosts[0].fallback && (
                    <Chip label="Fallback" color="warning" size="small" sx={{ mr: 1 }} />
                  )}
                  <Tooltip title="Copy to clipboard">
                    <IconButton onClick={() => copyToClipboard(generatedPosts[0].content)} size="small">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                {generatedPosts[0].content}
              </Typography>

              {hashtags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {hashtags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" clickable />
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => postToPlatform(generatedPosts[0].content)}
                  disabled={!authState[platform]}
                >
                  Post Now
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => schedulePostHandler(generatedPosts[0].content)}
                  disabled={!authState[platform]}
                >
                  Schedule
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => copyToClipboard(generatedPosts[0].content)}
                >
                  Copy
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Variations */}
          {variations.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Alternative Variations ({variations.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {variations.map((variation, index) => (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Variation {index + 1}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {variation}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => postToPlatform(variation)}
                              disabled={!authState[platform]}
                            >
                              Use This
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => copyToClipboard(variation)}
                            >
                              Copy
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}

      {/* Copy Snackbar */}
      <Snackbar
        open={copySnackbar}
        autoHideDuration={2000}
        onClose={() => setCopySnackbar(false)}
        message="Copied to clipboard!"
      />
    </Box>
  );
};

export default PostGenerator;