/// <reference types="vitest" />
import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import svgrPlugin from 'vite-plugin-svgr';
import eslintPlugin from 'vite-plugin-eslint';

const projectRootDir = path.resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  define: {global: 'window'},
  plugins: [
    react({include: /\.(mdx|js|jsx|ts|tsx)$/}),
    legacy(),
    svgrPlugin({
      svgrOptions: {
        // https://react-svgr.com/docs/options/
        icon: true,
      },
      include: ['**/*.svg?react', '**/*.svg'],
    }),
    eslintPlugin(),
  ],
  resolve: {
    alias: [
      {
        find: 'gmp',
        replacement: path.resolve(projectRootDir, 'src', 'gmp'),
      },
      {
        find: 'web',
        replacement: path.resolve(projectRootDir, 'src', 'web'),
      },
      {
        find: 'version',
        replacement: path.resolve(projectRootDir, 'src', 'version.js'),
      },
    ],
  },
  server: {
    port: 8080,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: [
      'src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'src/**/__tests__/*.?(c|m)[jt]s?(x)',
    ],
  },
});
