/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const defaultIgnoredProps = ['children', 'className', 'location'];

const isComponentName = name => /^[A-Z]/.test(name);

const getComponentName = node => {
  if (node.type === 'FunctionDeclaration' && node.id) {
    return node.id.name;
  }
  if (
    (node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionExpression') &&
    node.parent?.type === 'VariableDeclarator' &&
    node.parent.id.type === 'Identifier'
  ) {
    return node.parent.id.name;
  }
  return undefined;
};

const getPropertyName = node => {
  if (!node.computed) {
    return node.property.name;
  }
  return node.property.type === 'Literal' ? node.property.value : undefined;
};

const collectPatternNames = (pattern, parameters, used) => {
  if (pattern.type === 'Identifier') {
    parameters.add(pattern.name);
  } else if (pattern.type === 'ObjectPattern') {
    pattern.properties.forEach(property => {
      if (property.type === 'Property') {
        used.add(property.key.name ?? property.key.value);
      }
    });
  }
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require JavaScript component props to be declared.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {type: 'string'},
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missing: 'Prop "{{name}}" is used but is not declared in propTypes.',
    },
  },
  create(context) {
    const ignoredProps = new Set(
      context.options[0]?.ignore ?? defaultIgnoredProps,
    );
    const declarations = new Map();
    const components = [];
    const componentStack = [];

    return {
      AssignmentExpression(node) {
        if (
          node.left.type !== 'MemberExpression' ||
          node.left.object.type !== 'Identifier' ||
          getPropertyName(node.left) !== 'propTypes' ||
          node.right.type !== 'ObjectExpression'
        ) {
          return;
        }

        const names = new Set();
        node.right.properties.forEach(property => {
          if (property.type === 'Property') {
            names.add(property.key.name ?? property.key.value);
          }
        });
        declarations.set(node.left.object.name, names);
      },
      FunctionDeclaration(node) {
        const name = getComponentName(node);
        if (!name || !isComponentName(name)) {
          return;
        }
        const parameters = new Set();
        const used = new Set();
        if (node.params[0]) {
          collectPatternNames(node.params[0], parameters, used);
        }
        const component = {name, node, parameters, used};
        components.push(component);
        componentStack.push(component);
      },
      'FunctionDeclaration:exit'() {
        componentStack.pop();
      },
      'FunctionExpression'(node) {
        const name = getComponentName(node);
        if (!name || !isComponentName(name)) {
          return;
        }
        const parameters = new Set();
        const used = new Set();
        if (node.params[0]) {
          collectPatternNames(node.params[0], parameters, used);
        }
        const component = {name, node, parameters, used};
        components.push(component);
        componentStack.push(component);
      },
      'FunctionExpression:exit'(node) {
        if (getComponentName(node)) {
          componentStack.pop();
        }
      },
      ArrowFunctionExpression(node) {
        const name = getComponentName(node);
        if (!name || !isComponentName(name)) {
          return;
        }
        const parameters = new Set();
        const used = new Set();
        if (node.params[0]) {
          collectPatternNames(node.params[0], parameters, used);
        }
        const component = {name, node, parameters, used};
        components.push(component);
        componentStack.push(component);
      },
      'ArrowFunctionExpression:exit'(node) {
        if (getComponentName(node)) {
          componentStack.pop();
        }
      },
      MemberExpression(node) {
        const component = componentStack.at(-1);
        if (
          !component ||
          node.object.type !== 'Identifier' ||
          !component.parameters.has(node.object.name)
        ) {
          return;
        }
        const name = getPropertyName(node);
        if (name) {
          component.used.add(name);
        }
      },
      'Program:exit'() {
        components.forEach(component => {
          const declared = declarations.get(component.name) ?? new Set();
          component.used.forEach(name => {
            if (
              typeof name === 'string' &&
              !ignoredProps.has(name) &&
              !declared.has(name)
            ) {
              context.report({
                node: component.node,
                messageId: 'missing',
                data: {name},
              });
            }
          });
        });
      },
    };
  },
};