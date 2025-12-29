import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000';
  
  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "src") }
      ],
    },
    define: {
      // Make environment variables available at build time
      __VITE_API_URL__: JSON.stringify(apiUrl),
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // Allow external connections
      open: false,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: apiUrl.startsWith('https'),
        },
      },
    },
    preview: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: apiUrl.startsWith('https'),
        },
      },
    },
    build: {
      // Optimize for production
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      },
    },
  };
});