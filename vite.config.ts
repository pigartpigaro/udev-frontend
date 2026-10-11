import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Docker Desktop may not forward Windows bind-mount filesystem events.
      usePolling: true,
      interval: 300,
    },
  },
})
