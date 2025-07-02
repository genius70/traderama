import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature-based chunks
          'auth-pages': ['./src/pages/Auth.tsx', './src/pages/AdminAuth.tsx'],
          'trading-pages': [
            './src/pages/CreateStrategy.tsx', 
            './src/pages/AutoTrading.tsx',
            './src/pages/MarketTrends.tsx',
            './src/pages/TradePositions.tsx'
          ],
          'profile-pages': [
            './src/pages/Profile.tsx',
            './src/pages/Settings.tsx',
            './src/pages/Community.tsx'
          ],
          'misc-pages': [
            './src/pages/AirdropPage.tsx',
            './src/pages/ProductOffers.tsx',
            './src/pages/PaymentSuccess.tsx',
            './src/pages/PaymentCancel.tsx'
          ]
        }
      }
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
  },
  
  // Server configuration for development
  server: {
    port: 3000,
    open: true,
  },
  
  // Preview configuration for production builds
  preview: {
    port: 3000,
  },
});
