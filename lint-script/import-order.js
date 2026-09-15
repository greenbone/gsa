/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const builtins = new Set([
  'assert',
  'buffer',
  'child_process',
  'crypto',
  'events',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'url',
  'util',
  'zlib',
]);

const isRelative = source => /^\.\.?\//.test(source);
const isBuiltin = source =>
  source.startsWith('node:') || builtins.has(source);

const getImportRank = source => {
  if (source === 'react' || source === '@gsa/testing' || source === 'web/testing') {
    return 0;
  }
  if (
    source === '@open-sight/ui-components-mantinev7' ||
    source === '@mantine/core' ||
    source === '@mantine/notifications'
  ) {
    return 1;
  }
  if (
    isBuiltin(source) ||
    (!isRelative(source) &&
      !source.startsWith('gmp/') &&
      !source.startsWith('web/'))
  ) {
    return 2;
  }
  if (source.startsWith('gmp/') || source.startsWith('web/')) {
    return 3;
  }
  return 4;
};

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the project import ordering convention.',
    },
    schema: [],
    messages: {
      order: 'Imports should be ordered according to the project convention.',
    },
  },
  create(context) {
    let previousImport;

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        const rank = getImportRank(source);
        const previousSource = previousImport?.source.value;
        const previousRank = previousImport
          ? getImportRank(previousSource)
          : undefined;

        if (
          previousImport &&
          (rank < previousRank ||
            (rank === previousRank &&
              source.localeCompare(previousSource, undefined, {
                sensitivity: 'base',
              }) < 0))
        ) {
          context.report({node, messageId: 'order'});
        }

        previousImport = node;
      },
    };
  },
};