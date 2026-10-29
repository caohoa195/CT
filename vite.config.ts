import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/ollama': {
            target: 'http://127.0.0.1:11434',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
            configure: (proxy) => {
              proxy.on('error', (_err, _req, res) => {
                if (res && 'writeHead' in res && !res.headersSent) {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Ollama cục bộ chưa khởi động trên 127.0.0.1:11434' }));
                }
              });
            },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
