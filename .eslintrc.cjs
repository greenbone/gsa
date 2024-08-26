const allowedSnakeCase = require('./allowedSnakeCase.cjs');

module.exports = {
  ignorePatterns: ['build', '.eslintrc.cjs'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:vitest-globals/recommended',
  ],
  plugins: ['react', 'react-hooks', 'header'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2020: true,
    'vitest-globals/env': true,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/prop-types': [
      'warn',
      {ignore: ['children', 'className', 'location']},
    ],
    camelcase: [
      'warn',
      {
        allow: allowedSnakeCase,
        properties: 'always',
      },
    ],
    'no-case-declarations': 'off',
    'no-unused-vars': [
      'warn',
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    'no-class-assign': 'off',
    'no-prototype-builtins': 'off',
    'header/header': [
      2,
      'block',
      [
        {
          pattern: ' SPDX-FileCopyrightText: \\d{4} Greenbone AG',
          template: ' SPDX-FileCopyrightText: 2024 Greenbone AG',
        },
        ' *',
        ' * SPDX-License-Identifier: AGPL-3.0-or-later',
        ' ',
      ],
      2,
    ],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      plugins: ['vitest'],
      rules: {
        'vitest/expect-expect': 'off',
        'vitest/no-disabled-tests': 'warn',
        'vitest/no-focused-tests': 'error',
        'vitest/no-identical-title': 'error',
      },
    },
    {
      files: ['vite-env.d.ts'],
      rules: {
        'header/header': 'off',
      },
    },
  ],
};
