import React, { useState, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Chip, Alert,
  CircularProgress, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  AutoFixHigh as AutoFixIcon,
  Hashtag as HashtagIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const PostGenerator = () => {
  const { authState } = useAuth();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [improvedDraft, setImprovedDraft] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [scheduledTime, setScheduledTime] = useState('');

  const generatePost = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.generatePost(topic, platform, {
        tone,
        length,
        includeHashtags: true
      });
      
      setGeneratedPosts([result]);
    } catch (error) {
      console.error('Error generating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const improveDraft = async () => {
    if (!draft.trim()) {
      alert('Please enter your draft');
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.improveDraft(draft, platform);
      setImprovedDraft(result);
    } catch (error) {
      console.error('Error improving draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!topic.trim() && !draft.trim()) {
      alert('Please enter a topic or draft');
      return;
    }

    setLoading(true);
    try {
      const content = topic || draft;
      const result = await window.electronAPI.suggestHashtags(content, platform);
      setHashtags(result);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const postToPlatform = async (postContent) => {
    try {
      await window.electronAPI.postContent(postContent, platform);
      alert('Post published successfully!');
    } catch (error) {
      console.error('Error posting to platform:', error);
      alert('Failed to post. Please try again.');
    }
  };

  const schedulePost = async (postContent) => {
    if (!scheduledTime) {
      alert('Please select a scheduled time');
      return;
    }

    try {
      await window.electronAPI.schedulePost(postContent, platform, scheduledTime);
      alert('Post scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          AI Post Generator
        </Typography>
      </Box>

      {/* Status Alert */}
      {(!authState.twitter && !authState.linkedin) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your social media accounts in Settings to generate and publish posts.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Topic Input Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate from Topic
              </Typography>
              <TextField
                fullWidth
                label="Enter your topic or idea"
                multiline
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in social media marketing, new product launch, industry insights..."
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      label="Platform"
                    >
                      <MenuItem value="twitter">Twitter</MenuItem>
                      <MenuItem value="linkedin">LinkedIn</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Length</InputLabel>
                    <Select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      label="Length"
                    >
                      <MenuItem value="short">Short (1-2 sentences)</MenuItem>
                      <MenuItem value="medium">Medium (3-5 sentences)</MenuItem>
                      <MenuItem value="long">Long (paragraph)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Scheduled Time"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AutoFixIcon />}
                  onClick={generatePost}
                  disabled={loading || !topic.trim()}
                  fullWidth
                >
                  Generate Post
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HashtagIcon />}
                  onClick={getSuggestions}
                  disabled={loading || (!topic.trim() && !draft.trim())}
                >
                  Get Suggestions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Draft Improvement Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Improve Your Draft
              </Typography>
              <TextField
                fullWidth
                label="Your draft content"
                multiline
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste your rough draft here..."
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={improveDraft}
                  disabled={loading || !draft.trim()}
                  fullWidth
                >
                  Improve Draft
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HashtagIcon />}
                  onClick={getSuggestions}
                  disabled={loading || (!topic.trim() && !draft.trim())}
                >
                  Get Suggestions
                </Button>
              </Box>

              {improvedDraft && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Improved Draft:
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1">
                        {improvedDraft}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Posts */}
        {generatedPosts.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Generated Posts
            </Typography>
            <Grid container spacing={2}>
              {generatedPosts.map((post, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip label={platform.toUpperCase()} size="small" color="primary" />
                        <Chip label={tone} size="small" variant="outlined" />
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {post.content}
                      </Typography>

                      {post.hashtags && post.hashtags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {post.hashtags.map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={() => postToPlatform(post.content)}
                          disabled={!authState[platform]}
                          size="small"
                        >
                          Post Now
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ScheduleIcon />}
                          onClick={() => schedulePost(post.content)}
                          disabled={!authState[platform]}
                          size="small"
                        >
                          Schedule
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setDraft(post.content)}
                          size="small"
                        >
                          Edit Draft
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {/* Hashtag Suggestions */}
        {hashtags.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hashtag Suggestions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {hashtags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      clickable
                      onClick={() => setTopic(prev => prev + ' ' + tag)}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Loading Overlay */}
        {loading && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Generating content with AI...</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PostGenerator;