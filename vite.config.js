import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html"),
        main: resolve(__dirname, "src/windows/main/index.html"),
        help: resolve(__dirname, "src/windows/help/help.html"),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
