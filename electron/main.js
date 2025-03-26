import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  console.log('Loading URL:', appUrl);
  
  mainWindow.loadURL(appUrl).catch(err => {
    console.error('Failed to load URL:', err);
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(err => {
      console.error('Failed to load file:', err);
    });
  });

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
