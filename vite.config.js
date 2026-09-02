import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

function copyApkPlugin() {
  const copy = () => {
    mkdirSync("public", { recursive: true });
    if (existsSync("beeradviser.apk")) {
      copyFileSync("beeradviser.apk", "public/beeradviser.apk");
    }
  };
  return {
    name: "copy-apk",
    buildStart: copy,
    configureServer: copy,
  };
}

export default defineConfig({
  plugins: [react(), copyApkPlugin()],
  base: "./",
  server: {
    host: true,
    port: 5173,
  },
});
