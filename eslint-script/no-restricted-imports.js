/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow relative imports outside e2e tests.',
    },
    schema: [],
    messages: {
      restricted: 'Relative imports are not allowed.',
    },
  },
  create(/** @type {any} */ context) {
    return {
      ImportDeclaration(/** @type {any} */ node) {
        const filename = context.getFilename();
        const source = context.getSourceCode().text;
        const previousLine = source
          .slice(0, node.start)
          .split('\n')
          .slice(0, -1)
          .at(-1)
          ?.trim();
        if (
          filename.includes('/e2e/') ||
          !/^\.\.?\//.test(node.source.value) ||
          /(?:eslint|oxlint)-disable-next-line\s+no-restricted-imports/.test(
            previousLine ?? '',
          )
        ) {
          return;
        }
        context.report({node, messageId: 'restricted'});
      },
    };
  },
};