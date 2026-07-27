import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/mosaic-hobby-learning/" : "/",
  plugins: [react()],
  build: {
    target: "es2022",
    modulePreload: { polyfill: false },
  },
  server: { proxy: { "/api": "http://127.0.0.1:8787" } },
  preview: { proxy: { "/api": "http://127.0.0.1:8787" } },
});
