import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [ react() ],
  build: {
    rollupOptions: {
      // Tells Vite to completely ignore your backend script during compilation
      external: [ './server.js' ]
    }
  }
});