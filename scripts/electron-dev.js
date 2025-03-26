import { spawn } from 'child_process';
import { kill } from 'process';
import electron from 'electron';
import waitOn from 'wait-on';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, ELECTRON: 'true' }
});

// Wait for Vite dev server to be ready
waitOn({ resources: ['http-get://localhost:8080'], timeout: 30000 })
  .then(() => {
    console.log('Vite dev server is ready');
    // Start Electron with proper path handling
    const electronPath = path.join(__dirname, '../electron/main.js');
    const electronProcess = spawn(electron, [electronPath], {
      shell: true,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development', ELECTRON: 'true' },
      windowsHide: true
    });

    electronProcess.on('close', () => {
      viteProcess.kill();
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('Error waiting for dev server:', err);
    viteProcess.kill();
    process.exit(1);
  });

// Handle termination
process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit(0);
});
