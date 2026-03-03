import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: { host: "::", port: 8080 },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      includeAssets: ["favicon.png", "og-image.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: "Recargas Brasil",
        short_name: "Recargas",
        description: "Sistema de recargas de celular para revendedores",
        theme_color: "#10b981",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/favicon.png", sizes: "192x192", type: "image/png" },
          { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
