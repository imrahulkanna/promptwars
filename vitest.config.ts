import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate vitest config to avoid type conflicts with vite 8 + rolldown
// vite.config.ts handles the production build
export default defineConfig({
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/services/**', 'src/components/**'],
    },
  },
})
