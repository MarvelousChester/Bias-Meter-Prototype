import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Bias Mate',
    description: 'Analyze YouTube videos for political bias',
    version: '0.1.0',
    permissions: ['activeTab', 'storage'],
    host_permissions: ['*://*.youtube.com/*'],
  },
});
