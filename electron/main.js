
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  const appUrl = isDev 
    ? 'http://localhost:8080' // Vite dev server
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build
  
  mainWindow.loadURL(appUrl);

  // Open DevTools automatically in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();
  
  // On macOS, recreate window when dock icon is clicked
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
