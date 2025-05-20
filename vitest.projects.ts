/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    test: {
      name: 'web',
      environment: 'jsdom',
      setupFiles: './src/web/setupTests.ts',
      include: [
        'src/web/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/web/**/__tests__/*.?(c|m)[jt]s?(x)',
      ],
      exclude: ['src/web/store/**'],
      css: {
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
    },
  },
  {
    extends: './vite.config.ts',
    test: {
      name: 'gmp',
      environment: 'node',
      setupFiles: './src/gmp/setupTests.ts',
      include: [
        'src/gmp/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/gmp/**/__tests__/*.?(c|m)[jt]s?(x)',
        'src/__tests__/*.?(c|m)[jt]s?(x)',
      ],
    },
  },
  {
    extends: './vite.config.ts',
    test: {
      name: 'store',
      environment: 'node',
      include: [
        'src/web/store/**/*.{test,spec}.?(c|m)[jt]s?(x)',
        'src/web/store/**/__tests__/*.?(c|m)[jt]s?(x)',
      ],
    },
  },
]);
