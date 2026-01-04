import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Bias Mate",
    description: "Analyze YouTube videos for political bias",
    version: "0.1.0",
    permissions: ["activeTab", "storage", "scripting"],
    host_permissions: ["*://*.youtube.com/*"],
  },
  webExt: {
    chromiumProfile: resolve(
      "C:/Users/karan/Documents/GitHub/Bias-Meter-Prototype/youtube-video-bias-checker/apps/biasMateExension/chrome-data"
    ),
    keepProfileChanges: true,
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
