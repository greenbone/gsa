/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow dynamic expressions inside i18n translation function and in JSX template literals.',
      category: 'Best Practices',
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Check if the function being called is '_'
        if (node.callee.name === '_') {
          const arg = node.arguments[0];

          // Only report non-string literals or template literals
          // Allow string concatenation with + operator
          if (
            arg &&
            arg.type !== 'Literal' &&
            arg.type !== 'BinaryExpression' &&
            arg.type !== 'TemplateLiteral'
          ) {
            context.report({
              node,
              message:
                'Dynamic expressions in i18n translation functions cannot be extracted by translation tools. This is OK if you know the values are already extracted. If this is a valid use case, disable with /* eslint-disable-next-line custom/no-dynamic-i18n */',
            });
          }

          // If it's a template literal, check if it contains expressions
          if (
            arg &&
            arg.type === 'TemplateLiteral' &&
            arg.expressions.length > 0
          ) {
            context.report({
              node,
              message:
                "Template literals with expressions in i18n functions cannot be statically analyzed. This is fine if you're using values that are already extracted elsewhere. For valid use cases, disable with /* eslint-disable-next-line custom/no-dynamic-i18n */",
            });
          }
        }
      },
    };
  },
};
