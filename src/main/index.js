const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { N8N } = require('n8n');

// Import API modules
const twitterAPI = require('./api/twitter');
const linkedinAPI = require('./api/linkedin');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Set up menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  // Initialize database
  initializeDatabase();

  // Initialize N8N
  initializeN8N();

  // Initialize API integrations
  initializeAPIs();

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Database initialization
function initializeDatabase() {
  const db = new sqlite3.Database(path.join(__dirname, '../data/socialbot.db'), (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      createTables(db);
    }
  });
}

function createTables(db) {
  // Create tables for storing user preferences, API tokens, and cached data
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS api_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT UNIQUE,
      access_token TEXT,
      refresh_token TEXT,
      expires_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cached_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT,
      post_id TEXT,
      content TEXT,
      author TEXT,
      timestamp INTEGER,
      engagement_score REAL,
      relevance_score REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS generated_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT,
      content TEXT,
      platform TEXT,
      scheduled_time INTEGER,
      status TEXT,
      created_at INTEGER
    )
  `);
}

// N8N initialization
async function initializeN8N() {
  try {
    console.log('Initializing N8N...');
    // N8N will be configured as a workflow engine for our automation
    // This will be expanded in later phases
  } catch (error) {
    console.error('Error initializing N8N:', error);
  }
}

// API initialization
function initializeAPIs() {
  console.log('Initializing API integrations...');
  // Twitter and LinkedIn API initialization will be handled here
  // OAuth flows and token management
}

// IPC handlers for renderer process communication
ipcMain.handle('get-user-preferences', async (event, key) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, '../data/socialbot.db'));
    db.get('SELECT value FROM user_preferences WHERE key = ?', [key], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.value : null);
      }
      db.close();
    });
  });
});

ipcMain.handle('set-user-preferences', async (event, key, value) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, '../data/socialbot.db'));
    db.run('INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)', [key, value], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
      db.close();
    });
  });
});

// N8N Integration
ipcMain.handle('get-workflows', async () => {
  try {
    // Mock workflows for now - will integrate with actual N8N in Phase 3
    return [
      {
        id: '1',
        name: 'Daily Feed Monitor',
        description: 'Monitor feeds every hour and suggest high-engagement posts',
        trigger: 'schedule',
        schedule: '0 */1 * * *',
        actions: ['fetch_twitter_feed', 'fetch_linkedin_feed', 'calculate_engagement_scores'],
        enabled: true,
        executions: 24
      },
      {
        id: '2',
        name: 'Trending Topic Alert',
        description: 'Get notified when new trends emerge in your industry',
        trigger: 'schedule',
        schedule: '0 */2 * * *',
        actions: ['fetch_trends', 'analyze_sentiment', 'send_email_alert'],
        enabled: true,
        executions: 12
      }
    ];
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }
});

ipcMain.handle('create-workflow', async (event, workflow) => {
  try {
    // Mock workflow creation
    return {
      ...workflow,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
});

ipcMain.handle('run-workflow', async (event, workflowId) => {
  try {
    // Mock workflow execution
    return {
      workflowId,
      status: 'completed',
      executionTime: Date.now(),
      result: 'Workflow executed successfully'
    };
  } catch (error) {
    console.error('Error running workflow:', error);
    throw error;
  }
});

ipcMain.handle('toggle-workflow', async (event, workflowId, enabled) => {
  try {
    // Mock workflow toggle
    return {
      workflowId,
      enabled,
      status: enabled ? 'active' : 'paused'
    };
  } catch (error) {
    console.error('Error toggling workflow:', error);
    throw error;
  }
});

ipcMain.handle('delete-workflow', async (event, workflowId) => {
  try {
    // Mock workflow deletion
    return { success: true };
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
});

// Feed Monitoring
ipcMain.handle('get-feed', async (event, platform, limit) => {
  try {
    if (platform === 'twitter') {
      return await twitterAPI.getFeed(limit);
    } else if (platform === 'linkedin') {
      return await linkedinAPI.getFeed(limit);
    }
    return [];
  } catch (error) {
    console.error('Error getting feed:', error);
    return [];
  }
});

ipcMain.handle('like-post', async (event, platform, postId) => {
  try {
    if (platform === 'twitter') {
      return await twitterAPI.likePost(postId);
    } else if (platform === 'linkedin') {
      return await linkedinAPI.likePost(postId);
    }
    return false;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
});

ipcMain.handle('get-trends', async (event, platform, timeRange) => {
  try {
    if (platform === 'twitter') {
      return await twitterAPI.getTrends(timeRange);
    } else if (platform === 'linkedin') {
      return await linkedinAPI.getTrends(timeRange);
    }
    return [];
  } catch (error) {
    console.error('Error getting trends:', error);
    return [];
  }
});

// AI Post Generation
ipcMain.handle('generate-post', async (event, topic, platform, options = {}) => {
  try {
    // Mock AI post generation
    const content = `Generated post about ${topic} for ${platform}. This is a sample AI-generated content optimized for engagement and platform-specific formatting.`;
    
    return {
      content,
      hashtags: options.includeHashtags ? [`#${topic.replace(/\s+/g, '')}`, '#AI', '#SocialMedia'] : []
    };
  } catch (error) {
    console.error('Error generating post:', error);
    throw error;
  }
});

ipcMain.handle('improve-draft', async (event, draft, platform) => {
  try {
    // Mock draft improvement
    return `Improved version of: "${draft}". This version is more engaging and optimized for ${platform} audience.`;
  } catch (error) {
    console.error('Error improving draft:', error);
    throw error;
  }
});

ipcMain.handle('suggest-hashtags', async (event, content, platform) => {
  try {
    // Mock hashtag suggestions
    return ['#AI', '#SocialMedia', '#Marketing', '#ContentCreation', '#Automation'];
  } catch (error) {
    console.error('Error suggesting hashtags:', error);
    return [];
  }
});

ipcMain.handle('post-content', async (event, content, platform) => {
  try {
    if (platform === 'twitter') {
      return await twitterAPI.postTweet(content);
    } else if (platform === 'linkedin') {
      return await linkedinAPI.postContent(content);
    }
    return false;
  } catch (error) {
    console.error('Error posting content:', error);
    throw error;
  }
});

ipcMain.handle('schedule-post', async (event, content, platform, time) => {
  try {
    // Store scheduled post in database
    const db = new sqlite3.Database(path.join(__dirname, '../data/socialbot.db'));
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO generated_posts (topic, content, platform, scheduled_time, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [content, content, platform, time, 'scheduled', Date.now()],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true });
          }
          db.close();
        }
      );
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    throw error;
  }
});

// Analytics
ipcMain.handle('get-analytics', async (event, options) => {
  try {
    const db = new sqlite3.Database(path.join(__dirname, '../data/socialbot.db'));
    
    return new Promise((resolve, reject) => {
      // Get basic metrics
      db.get(
        `SELECT COUNT(*) as count FROM generated_posts WHERE status = 'scheduled'`,
        [],
        (err, totalPosts) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.get(
            `SELECT COUNT(*) as count FROM cached_posts`,
            [],
            (err, cachedPosts) => {
              if (err) {
                reject(err);
                return;
              }
              
              resolve({
                totalPosts: totalPosts.count,
                totalEngagement: cachedPosts.count * 100, // Mock calculation
                avgEngagementRate: 5.2,
                engagementHistory: [120, 150, 180, 200, 220, 250, 280],
                contentPerformance: [
                  { title: 'AI Content Generation', engagement: 280, platform: 'twitter' },
                  { title: 'Social Media Automation', engagement: 250, platform: 'linkedin' },
                  { title: 'Marketing Trends', engagement: 220, platform: 'twitter' }
                ],
                hashtagPerformance: [
                  { tag: 'AI', usage: 15, reach: 5000 },
                  { tag: 'SocialMedia', usage: 12, reach: 4500 },
                  { tag: 'Marketing', usage: 10, reach: 4000 }
                ],
                recommendations: [
                  {
                    type: 'content',
                    priority: 'high',
                    text: 'Focus on AI-related content as it shows highest engagement'
                  },
                  {
                    type: 'timing',
                    priority: 'medium',
                    text: 'Post between 9-11 AM for optimal engagement'
                  },
                  {
                    type: 'platform',
                    priority: 'low',
                    text: 'LinkedIn shows higher engagement for professional content'
                  }
                ]
              });
              
              db.close();
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
});

module.exports = {
  app,
  BrowserWindow
};
