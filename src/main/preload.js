const { contextBridge, ipcRenderer } = require('electron');

// Securely expose IPC methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getUserPreferences: (key) => ipcRenderer.invoke('get-user-preferences', key),
  setUserPreferences: (key, value) => ipcRenderer.invoke('set-user-preferences', key, value),
  
  // API operations
  authenticateTwitter: () => ipcRenderer.invoke('authenticate-twitter'),
  authenticateLinkedIn: () => ipcRenderer.invoke('authenticate-linkedin'),
  getFeed: (platform, limit) => ipcRenderer.invoke('get-feed', platform, limit),
  
  // AI operations
  generatePost: (topic, platform) => ipcRenderer.invoke('generate-post', topic, platform),
  improveDraft: (draft, platform) => ipcRenderer.invoke('improve-draft', draft, platform),
  suggestHashtags: (content, platform) => ipcRenderer.invoke('suggest-hashtags', content, platform),
  
  // N8N operations
  getWorkflows: () => ipcRenderer.invoke('get-workflows'),
  createWorkflow: (workflow) => ipcRenderer.invoke('create-workflow', workflow),
  runWorkflow: (workflowId) => ipcRenderer.invoke('run-workflow', workflowId),
  toggleWorkflow: (workflowId, enabled) => ipcRenderer.invoke('toggle-workflow', workflowId, enabled),
  deleteWorkflow: (workflowId) => ipcRenderer.invoke('delete-workflow', workflowId),

  // Feed Monitoring
  getFeed: (platform, limit) => ipcRenderer.invoke('get-feed', platform, limit),
  likePost: (platform, postId) => ipcRenderer.invoke('like-post', platform, postId),
  getTrends: (platform, timeRange) => ipcRenderer.invoke('get-trends', platform, timeRange),

  // AI Post Generation
  generatePost: (topic, platform, options) => ipcRenderer.invoke('generate-post', topic, platform, options),
  improveDraft: (draft, platform) => ipcRenderer.invoke('improve-draft', draft, platform),
  suggestHashtags: (content, platform) => ipcRenderer.invoke('suggest-hashtags', content, platform),
  postContent: (content, platform) => ipcRenderer.invoke('post-content', content, platform),
  schedulePost: (content, platform, time) => ipcRenderer.invoke('schedule-post', content, platform, time),

  // Analytics
  getAnalytics: (options) => ipcRenderer.invoke('get-analytics', options),
  
  // System operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
});

// Listen for events from main process
contextBridge.exposeInMainWorld('electronEvents', {
  onFeedUpdate: (callback) => ipcRenderer.on('feed-update', callback),
  onWorkflowComplete: (callback) => ipcRenderer.on('workflow-complete', callback),
  onAuthComplete: (callback) => ipcRenderer.on('auth-complete', callback),
});