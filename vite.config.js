import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({

  base: "/home-workout/",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "나의 홈트",
        short_name: "홈트",

        description: "개인 홈트 운동 기록 앱",

        theme_color: "#397b57",
        background_color: "#f5f6f7",

        display: "standalone",

        start_url: ".",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});