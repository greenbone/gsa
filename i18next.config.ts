/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {defineConfig} from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de', 'zh_TW', 'zh_CN'],
  extract: {
    input: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
    ignore: ['src/**/__tests__/**'],
    output: 'public/locales/gsa-{{language}}.json',
    defaultNS: false,
    mergeNamespaces: true,
    keySeparator: false,
    nsSeparator: false,
    contextSeparator: undefined,
    disablePlurals: true,
    generateBasePluralForms: false,
    removeUnusedKeys: true,
    defaultValue: (locale, namespace, key, defaultValue) =>
      locale === 'en' ? key : '',
    functions: ['_', '_l'],
    useTranslationNames: ['useTranslation'],
  },
});
