
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced error handling for React root
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found. Make sure there's a div with id='root' in your HTML.");
}

const root = createRoot(container);

// Wrap the App in an additional try-catch for debugging
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render React app:", error);
  
  // Fallback rendering in case of critical errors
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif;">
      <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
      <p style="color: #6b7280; text-align: center; max-width: 400px;">
        The application failed to load. Please check the console for more details and refresh the page.
      </p>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
        Refresh Page
      </button>
    </div>
  `;
}
