import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Bias Mate',
    description: 'Analyze YouTube videos for political bias',
    version: '0.1.0',
    permissions: ['activeTab', 'storage', 'scripting'],
    host_permissions: ['*://*.youtube.com/*'],
    
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
