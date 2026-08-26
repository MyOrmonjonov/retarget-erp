import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isTelegram = mode === 'telegram';

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
    },
  };
});