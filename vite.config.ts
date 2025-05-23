import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // Keep or change as needed
    port: 5173, // Default Vite port, or keep 8080 if preferred
    proxy: {
      // Proxy requests starting with /api to the backend server
      '/api': {
        target: 'http://localhost:3001', // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites
        // secure: false, // Uncomment if backend uses self-signed HTTPS cert
        // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
