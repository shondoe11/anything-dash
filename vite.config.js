import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//& https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //~ treat HTML files as assets to avoid import-analysis errors
  assetsInclude: ['**/*.html'],
})
