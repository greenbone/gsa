/// <reference types="vitest" />
import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import svgrPlugin from 'vite-plugin-svgr';
import eslintPlugin from 'vite-plugin-eslint2';

const projectRootDir = path.resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'window',
    // avoid "You are loading @emotion/react when it is already loaded" warnings during tests
    // https://github.com/emotion-js/emotion/discussions/2795#discussioncomment-7885638
    vi: {},
  },
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
      {
        find: '@gsa/testing',
        replacement: path.resolve(projectRootDir, 'src', 'testing.js'),
      },
    ],
  },
  server: {
    port: 8080,
  },
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: false,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'opensight-ui': ['@greenbone/opensight-ui-components'],
        },
      },
    },
  },
});
