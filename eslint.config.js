import pluginJs from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import pluginHeader from 'eslint-plugin-header';
import * as importPlugin from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import allowedSnakeCase from './allowedSnakeCase.js';
pluginHeader.rules.header.meta.schema = false; // https://github.com/Stuk/eslint-plugin-header/issues/57

const year = new Date().getFullYear();

// Common rules for both JS and TS files
const commonRules = {
  ...pluginReactHooks.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off',
  'react/display-name': 'off',
  'no-class-assign': 'off',
  'no-prototype-builtins': 'off',
  'no-case-declarations': 'off',
  'no-duplicate-imports': 'warn',
  'react-hooks/exhaustive-deps': 'warn',
  eqeqeq: ['warn', 'always'],
  'no-console': [
    'warn',
    {
      allow: ['warn', 'error', 'info'],
    },
  ],
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
  'no-restricted-imports': [
    'warn',
    {
      patterns: [
        {
          group: ['./', '../'],
          message: 'Relative imports are not allowed.',
        },
      ],
    },
  ],
};

export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat?.recommended,
  {
    ignores: ['build', 'eslint.config.js'],
  },
  // JavaScript configuration
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: {
      ...commonRules,
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
    },
  },
  // TypeScript-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...commonRules,

      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      camelcase: 'off',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
          filter: {
            regex: `^(${allowedSnakeCase.join('|')})$`,
            match: false,
          },
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
          filter: {
            regex: `^(${allowedSnakeCase.join('|')})$`,
            match: false,
          },
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'property',
          format: null,
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'import',
          format: null,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
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
        React: 'readonly',
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
  // Test files configuration
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
