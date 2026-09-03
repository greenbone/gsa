/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const headerPattern = /^\/\* SPDX-FileCopyrightText: \d{4} Greenbone AG\n \*\n \* SPDX-License-Identifier: AGPL-3\.0-or-later\n \*\//;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require the Greenbone SPDX file header.',
    },
    schema: [],
    messages: {
      missing: 'Files must start with the Greenbone SPDX header.',
    },
  },
  create(/** @type {any} */ context) {
    return {
      Program(/** @type {any} */ node) {
        const source = context.getSourceCode().text;
        if (!headerPattern.test(source) && !/header\/header/.test(source)) {
          context.report({node, messageId: 'missing'});
        }
      },
    };
  },
};