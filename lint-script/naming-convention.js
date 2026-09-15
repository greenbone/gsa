/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import allowedSnakeCase from './allowedSnakeCase.js';

const allowedNames = new Set(allowedSnakeCase);
const camelCase = /^[a-z][A-Za-z0-9]*$/;
const pascalCase = /^[A-Z][A-Za-z0-9]*$/;
const upperCase = /^[A-Z][A-Z0-9_]*$/;

const isProperty = node => {
  const parent = node.parent;

  return (
    ((parent.type === 'MemberExpression' ||
      parent.type === 'OptionalMemberExpression') &&
      parent.property === node &&
      !parent.computed) ||
    ((parent.type === 'Property' ||
      parent.type === 'MethodDefinition' ||
      parent.type === 'PropertyDefinition' ||
      parent.type === 'TSPropertySignature' ||
      parent.type === 'TSMethodSignature') &&
      parent.key === node &&
      !parent.computed)
  );
};

const isImport = node => {
  let parent = node.parent;
  while (parent) {
    if (parent.type === 'ImportDeclaration') {
      return true;
    }
    if (
      parent.type !== 'ImportSpecifier' &&
      parent.type !== 'ImportDefaultSpecifier'
    ) {
      break;
    }
    parent = parent.parent;
  }
  return false;
};

const reportName = (context, node, formats, allowUnderscore = false) => {
  if (allowedNames.has(node.name)) {
    return;
  }

  let name = node.name;
  if (allowUnderscore) {
    while (name.startsWith('_')) {
      name = name.slice(1);
    }
    while (name.endsWith('_')) {
      name = name.slice(0, -1);
    }
  }
  const valid =
    name.length === 0 ||
    formats.some(format => {
      if (format === 'camelCase') {
        return camelCase.test(name);
      }
      if (format === 'PascalCase') {
        return pascalCase.test(name);
      }
      return upperCase.test(name);
    });
  if (!valid) {
    context.report({
      node,
      message: `Identifier "${node.name}" should use ${formats.join(' or ')}.`,
    });
  }
};

const isParameter = node =>
  node.parent.type === 'FunctionDeclaration' ||
  node.parent.type === 'FunctionExpression' ||
  node.parent.type === 'ArrowFunctionExpression';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the TypeScript naming conventions from ESLint.',
    },
    schema: [],
  },
  create(context) {
    return {
      Identifier(node) {
        if (isProperty(node) || isImport(node) || allowedNames.has(node.name)) {
          return;
        }

        const parent = node.parent;
        if (
          parent.type === 'TSInterfaceDeclaration' ||
          parent.type === 'TSTypeAliasDeclaration' ||
          parent.type === 'ClassDeclaration' ||
          parent.type === 'ClassExpression'
        ) {
          reportName(context, node, ['PascalCase']);
        } else if (parent.type === 'TSEnumDeclaration') {
          reportName(context, node, ['PascalCase']);
        } else if (parent.type === 'TSEnumMember') {
          reportName(context, node, ['UPPER_CASE', 'PascalCase']);
        } else if (
          (parent.type === 'FunctionDeclaration' ||
            parent.type === 'FunctionExpression') &&
          parent.id === node
        ) {
          reportName(context, node, ['camelCase', 'PascalCase'], true);
        } else if (isParameter(node)) {
          reportName(context, node, ['camelCase', 'PascalCase'], true);
        } else if (parent.type === 'VariableDeclarator' && parent.id === node) {
          reportName(
            context,
            node,
            ['camelCase', 'UPPER_CASE', 'PascalCase'],
            true,
          );
        }
      },
    };
  },
};
