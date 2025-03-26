
import { createRoot } from 'react-dom/client'
import React from 'react'
import App from './App.tsx'
import './index.css'
import './i18n' // Import i18n configuration

// Wait for i18n to initialize before rendering the app
// This prevents the "Cannot read properties of null" error
import i18next from 'i18next'

const renderApp = () => {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Initialize i18next and then render the app
i18next
  .init()
  .then(() => {
    renderApp();
  })
  .catch(error => {
    console.error('i18next initialization error:', error);
    // Render the app anyway to avoid a blank screen
    renderApp();
  });
