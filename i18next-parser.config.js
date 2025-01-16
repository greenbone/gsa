/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const jsLexer = [{lexer: 'JavascriptLexer', functions: ['_', '_l']}];
const jsxLexer = [{lexer: 'JsxLexer', functions: ['_', '_l']}];

export default {
  contextSeparator: null,
  defaultNamespace: 'gsa',
  input: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
  keepRemoved: false,
  keySeparator: false,
  lexers: {
    mjs: jsLexer,
    js: jsLexer,
    ts: jsLexer,
    jsx: jsxLexer,
    tsx: jsxLexer,

    default: jsLexer,
  },
  locales: ['en', 'de', 'zh_TW', 'zh_CN'],
  namespaceSeparator: false,
  output: 'public/locales/gsa-$LOCALE.json',
  pluralSeparator: false,
  resetDefaultValueLocale: 'en',
  sort: true,
};
