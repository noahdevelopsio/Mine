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

module.exports = {
  app,
  BrowserWindow
};