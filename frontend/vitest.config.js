import { defineConfig, mergeConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      exclude: [...configDefaults.exclude, 'e2e/**'],
    },
  })
);
