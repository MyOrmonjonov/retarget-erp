import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isTelegram = mode === 'telegram' || mode === 'telegram-debug';
  const isDebug = mode === 'telegram-debug';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/features': path.resolve(__dirname, './src/features'),
        '@/app': path.resolve(__dirname, './src/app'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      allowedHosts: true,
      hmr: {
        port: 5173,
        host: 'localhost',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
        },
      },
    },
    build: {
      outDir: isTelegram ? 'dist-telegram' : 'dist',
      sourcemap: true,
      minify: isDebug ? false : true,
      // Telegram's own in-app webview (Desktop's Qt WebEngine, some mobile clients) can lag
      // behind desktop Chrome - targeting a broader browser baseline makes esbuild downlevel
      // newer syntax instead of assuming it's natively supported everywhere the Mini App runs.
      target: ['chrome80', 'edge80', 'firefox78', 'safari13'],
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            state: ['zustand'],
            ui: ['lucide-react', 'recharts', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            utils: ['axios', 'date-fns', '@date-fns/tz', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
    define: {
      'import.meta.env.VITE_TELEGRAM_MODE': JSON.stringify(isTelegram),
      ...(isDebug ? { 'process.env.NODE_ENV': JSON.stringify('development') } : {}),
    },
  };
});