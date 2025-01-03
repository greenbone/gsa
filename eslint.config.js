import pluginJs from '@eslint/js';
import pluginHeader from 'eslint-plugin-header';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import * as importPlugin from 'eslint-plugin-import';
import vitest from '@vitest/eslint-plugin';
import allowedSnakeCase from './allowedSnakeCase.js';

pluginHeader.rules.header.meta.schema = false; // https://github.com/Stuk/eslint-plugin-header/issues/57

const year = new Date().getFullYear();

export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat?.recommended,
  {
    ignores: ['build', 'eslint.config.js'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
  },
  {
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      vitest,
      import: importPlugin,
      header: pluginHeader,
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  },
  {
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': [
        'warn',
        {
          ignore: ['children', 'className', 'location'],
        },
      ],
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      camelcase: [
        'warn',
        {
          allow: allowedSnakeCase,
          properties: 'always',
        },
      ],
      'react/display-name': 'off',
      'no-class-assign': 'off',
      'no-prototype-builtins': 'off',
      'no-case-declarations': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'header/header': [
        2,
        'block',
        [
          {
            pattern: ' SPDX-FileCopyrightText: \\d{4} Greenbone AG',
            template: ` SPDX-FileCopyrightText: ${year} Greenbone AG`,
          },
          ' *',
          ' * SPDX-License-Identifier: AGPL-3.0-or-later',
          ' ',
        ],
        2,
      ],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: false,
          reservedFirst: true,
          noSortAlphabetically: false,
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: {vitest},
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-identical-title': 'error',
      'react/prop-types': 'off',
    },
  },
];
