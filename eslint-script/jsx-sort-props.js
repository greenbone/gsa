/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const reservedProps = new Set(['key', 'ref']);

const getName = attribute => {
  if (attribute.type !== 'JSXAttribute') return '';
  return attribute.name.name;
};

const compareAttributes = (left, right) => {
  const leftName = getName(left);
  const rightName = getName(right);
  const leftReserved = reservedProps.has(leftName);
  const rightReserved = reservedProps.has(rightName);
  if (leftReserved !== rightReserved) return leftReserved ? -1 : 1;

  const leftCallback = /^on[A-Z]/.test(leftName);
  const rightCallback = /^on[A-Z]/.test(rightName);
  if (leftCallback !== rightCallback) return leftCallback ? 1 : -1;

  const leftShorthand = left.type === 'JSXAttribute' && !left.value;
  const rightShorthand = right.type === 'JSXAttribute' && !right.value;
  if (leftShorthand !== rightShorthand) return leftShorthand ? -1 : 1;

  if (leftName < rightName) return -1;
  if (leftName > rightName) return 1;
  return 0;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require JSX properties to use the project ordering.',
    },
    schema: [],
    messages: {
      unsorted: 'JSX properties should be sorted.',
    },
  },
  create(/** @type {any} */ context) {
    return {
      JSXOpeningElement(/** @type {any} */ node) {
        const attributes = node.attributes ?? [];
        for (let index = 1; index < attributes.length; index += 1) {
          if (compareAttributes(attributes[index - 1], attributes[index]) > 0) {
            context.report({
              node: attributes[index],
              messageId: 'unsorted',
            });
            break;
          }
        }
      },
    };
  },
};