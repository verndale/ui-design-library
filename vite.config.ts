import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Storybook is the only consumer of this config — the library itself ships as
// source and is compiled by whatever project imports it.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
