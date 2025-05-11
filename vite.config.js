import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//& https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '')
      },
      //~ proxy CoinGecko thru local func
      '/.netlify/functions/coingecko-proxy': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/\.netlify\/functions\/coingecko-proxy/, '')
      },
      //~ proxy Football req to Netlify func
      '/.netlify/functions/football-proxy': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        rewrite: path => path
      }
    }
  }
})