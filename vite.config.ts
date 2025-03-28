import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: "127.0.0.1", // Devcontainer workaround https://github.com/vitejs/vite/issues/16522#issuecomment-2084322973
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "BrickGame",
        short_name: "BrickGame",
        description: "Tile-matching Puzzle Game",
        theme_color: "#111111",
        background_color: "#111111",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
        screenshots: [
          {
            src: "screenshots/narrow.png",
            sizes: "750x1334",
            form_factor: "narrow",
          },
          {
            src: "screenshots/wide.png",
            sizes: "3840x2160",
            form_factor: "wide",
          },
        ],
      },
    }),
  ],
});
