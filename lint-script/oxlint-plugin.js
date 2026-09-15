/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import allowedSnakeCase from './allowedSnakeCase.js';
import camelcase from './camelcase.js';
import filenameConvention from './filename-convention.js';
import header from './header.js';
import jsxSortProps from './jsx-sort-props.js';
import namingConvention from './naming-convention.js';
import noDynamicI18n from './no-dynamic-i18n.js';
import noRestrictedImports from './no-restricted-imports.js';
import propTypes from './prop-types.js';
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
    'naming-convention': namingConvention,
    'no-dynamic-i18n': noDynamicI18n,
    'no-restricted-imports': noRestrictedImports,
    'prop-types': propTypes,
    'ts-definitions-top': tsDefinitionsTop,
  },
  allowedSnakeCase,
};
