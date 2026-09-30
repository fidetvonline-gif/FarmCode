import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically register PWA service worker for offline support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New farm PWA content available, refreshing...');
  },
  onOfflineReady() {
    console.log('U & E Grace Farm PWA is ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
