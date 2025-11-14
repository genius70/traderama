import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

console.log('main.tsx loading...');

// Enhanced error handling for React root
const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found!");
  throw new Error("Root element not found. Make sure there's a div with id='root' in your HTML.");
}

console.log('Root container found:', container);

const root = createRoot(container);
console.log('React root created');

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Wrap the App in an additional try-catch for debugging
try {
  console.log('Rendering React app...');
  
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="auto">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
  
  console.log('React app rendered successfully');
  
  // Remove loading fallback after React renders
  setTimeout(() => {
    const fallback = document.getElementById('fallback-loading');
    if (fallback) {
      fallback.style.display = 'none';
      console.log('Fallback loading removed');
    }
  }, 2000);
  
} catch (error) {
  console.error("Failed to render React app:", error);
  
  // Fallback rendering in case of critical errors
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif; padding: 2rem;">
      <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
      <p style="color: #6b7280; text-align: center; max-width: 500px; margin-bottom: 1rem;">
        The Traderama application failed to load. Please check the console for more details and try refreshing the page.
      </p>
      <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">
        Error: ${error instanceof Error ? error.message : 'Unknown error'}
      </p>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
        Refresh Page
      </button>
    </div>
  `;
}
