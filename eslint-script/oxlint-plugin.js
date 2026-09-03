/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import allowedSnakeCase from './allowedSnakeCase.js';
import camelcase from './camelcase.js';
import filenameConvention from './filename-convention.js';
import header from './header.js';
import jsxSortProps from './jsx-sort-props.js';
import noDynamicI18n from './no-dynamic-i18n.js';
import noRestrictedImports from './no-restricted-imports.js';
import tsDefinitionsTop from './ts-definitions-top.js';

export default {
  meta: {
    name: 'gsa',
  },
  rules: {
    camelcase,
    'filename-convention': filenameConvention,
    header,
    'jsx-sort-props': jsxSortProps,
    'no-dynamic-i18n': noDynamicI18n,
    'no-restricted-imports': noRestrictedImports,
    'ts-definitions-top': tsDefinitionsTop,
  },
  allowedSnakeCase,
};