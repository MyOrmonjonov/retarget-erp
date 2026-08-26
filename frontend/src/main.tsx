import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app/router';
import { initTelegramWebApp } from '@/shared/lib/telegram';
import './styles/globals.css';

initTelegramWebApp();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);