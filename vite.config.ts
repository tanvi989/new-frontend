import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load environment variables starting with VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const proxyTarget = env.VITE_API_TARGET || 'https://finalbackend.multifolks.com';
  const vtobTarget = env.VITE_GETMYFIT_API_BASE || 'https://vtob.multifolks.com';

  console.log("---------------------------------------------------");
  console.log("DEBUG: Using backend at:", proxyTarget);
  console.log("DEBUG: VTO backend (Get My Fit) at:", vtobTarget);
  console.log("---------------------------------------------------");

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',

      proxy: {
        // VTO / Get My Fit: proxy to vtob.multifolks.com so no CORS in dev (localhost:3000/3001)
        '/api-vtob': {
          target: vtobTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api-vtob/, ''),
        },
        // Proxy any API requests to the backend
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true, // HTTPS enabled
        },
        '/api/profile': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/api/health': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/retailer': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/accounts': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },

      fs: {
        allow: ['..'],
      },
    },

    // ✅ Updated preview: allow your production domain
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: [
        '82.112.238.249',
        'localhost',
        '127.0.0.1',
        'test.tanviparadkar.in',
        'test.multifolks.com',
        'finalbackend.multifolks.com', // <-- added your domain
        'final.multifolks.com'         // <-- also add main frontend domain
      ],
    },

    plugins: [react(), tailwindcss()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp'],
  };
});
