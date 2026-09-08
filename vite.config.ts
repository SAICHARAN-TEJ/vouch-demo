/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const base =
  process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? "/vouch-demo/" : "/");

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors so mobile fetches stream in parallel instead of
        // one ~800 kB blob: maplibre only downloads when the Map screen loads.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
          maplibre: ["maplibre-gl"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
