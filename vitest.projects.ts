import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    test: {
      name: 'jsdom',
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/web/setupTests.js',
      include: [
        'src/web/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/web/**/__tests__/*.?(c|m)[jt]s?(x)',
      ],
    },
  },
  {
    extends: './vite.config.ts',
    test: {
      name: 'node',
      environment: 'node',
      globals: true,
      setupFiles: './src/gmp/setupTests.js',
      include: [
        'src/gmp/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/gmp/**/__tests__/*.?(c|m)[jt]s?(x)',
      ],
    },
  },
]);
