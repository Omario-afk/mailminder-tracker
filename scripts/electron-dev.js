
const { spawn } = require('child_process');
const { kill } = require('process');
const electron = require('electron');
const waitOn = require('wait-on');
const path = require('path');

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit',
  env: { ...process.env }
});

// Wait for Vite dev server to be ready
waitOn({ resources: ['http-get://localhost:8080'], timeout: 30000 })
  .then(() => {
    // Start Electron
    const electronProcess = spawn(electron, [path.join(__dirname, '../electron/main.js')], {
      shell: true,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
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
