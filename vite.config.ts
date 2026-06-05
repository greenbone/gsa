import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import eslintPlugin from 'vite-plugin-eslint2';
import svgrPlugin from 'vite-plugin-svgr';

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
    eslintPlugin({
      cache: true,
      cacheLocation: '.eslintcache',
    }),
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
        replacement: path.resolve(projectRootDir, 'src', 'version.ts'),
      },
      {
        find: '@gsa/testing',
        replacement: path.resolve(projectRootDir, 'src', 'testing.ts'),
      },
    ],
  },
  server: {
    port: 8080,
    host: '127.0.0.1',
    fs: {
      strict: true,
      allow: ['index.html', 'src', 'node_modules'],
    },
  },
  preview: {
    port: 8080,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'build',
    rolldownOptions: {
      output: {
        minify: {
          compress: true,
          mangle: false,
        },
        codeSplitting: {
          groups: [
            {
              name: 'greenbone-ui-lib',
              test: /greenbone[/\\]ui-lib/,
            },
          ],
        },
      },
    },
  },
});
