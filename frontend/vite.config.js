import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // No source maps in production (security)
    // Split chunks for better caching and load performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: stable libraries that rarely change
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-ui": ["lucide-react", "react-hot-toast"],
          "vendor-export": ["jspdf", "html2canvas"],
          "vendor-markdown": ["react-markdown", "remark-gfm"],
        },
      },
    },
    // Warn if a single chunk exceeds 500KB (down from default 1000KB)
    chunkSizeWarningLimit: 500,
  },
});
