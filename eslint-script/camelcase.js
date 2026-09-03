/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import allowedSnakeCase from './allowedSnakeCase.js';

const allowedNames = new Set(allowedSnakeCase);
const snakeCase = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/;

const isPropertyName = node => {
  const {parent} = node;

  if (
    (parent.type === 'MemberExpression' ||
      parent.type === 'OptionalMemberExpression') &&
    parent.property === node &&
    !parent.computed
  ) {
    return true;
  }

  if (
    (parent.type === 'Property' ||
      parent.type === 'MethodDefinition' ||
      parent.type === 'PropertyDefinition' ||
      parent.type === 'TSPropertySignature' ||
      parent.type === 'TSMethodSignature') &&
    parent.key === node &&
    !parent.computed
  ) {
    return true;
  }

  return parent.type === 'LabeledStatement' && parent.label === node;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unapproved snake_case identifiers.',
    },
    schema: [],
    messages: {
      invalid: 'Identifier "{{name}}" should use camelCase.',
    },
  },
  create(context) {
    return {
      Identifier(node) {
        if (
          !isPropertyName(node) &&
          snakeCase.test(node.name) &&
          !allowedNames.has(node.name)
        ) {
          context.report({
            node,
            messageId: 'invalid',
            data: {name: node.name},
          });
        }
      },
    };
  },
};