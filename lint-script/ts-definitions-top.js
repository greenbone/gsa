/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// ESLint rule: ts-definitions-top
// Ensures type and interface definitions follow imports and precede runtime code.

const isTypeDefinition = node => {
  const declaration =
    node.type === 'ExportNamedDeclaration' ? node.declaration : node;

  return (
    declaration?.type === 'TSInterfaceDeclaration' ||
    declaration?.type === 'TSTypeAliasDeclaration'
  );
};

export default {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'TypeScript type/interface definitions must be after imports and before the rest of the code',
      category: 'Stylistic Issues',
      recommended: false,
    },
    schema: [],
    messages: {
      misplaced:
        'All type/interface definitions must be after imports and before the rest of the code.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const body = node.body;
        let foundNonDefinition = false;
        const misplaced = [];

        for (const [index, child] of body.entries()) {
          if (child.type === 'ImportDeclaration') continue;

          if (isTypeDefinition(child)) {
            if (foundNonDefinition) misplaced.push(index);
            continue;
          }

          foundNonDefinition = true;
        }

        if (misplaced.length === 0) return;

        const definitions = body.filter(isTypeDefinition);
        const lastImport = body.reduce(
          (last, child, index) =>
            child.type === 'ImportDeclaration' ? index : last,
          -1,
        );

        // Keep the fix conservative when comments occur in the moved region.
        // Oxlint's fixer ranges cover AST nodes, so moving this region as raw
        // text could otherwise strand or reorder comments unexpectedly.
        const source = context.getSourceCode();
        const moveStart = definitions[0].range[0];
        const moveEnd = definitions.at(-1).range[1];
        const hasComments = source
          .getAllComments()
          .some(
            comment =>
              comment.range[0] >= moveStart && comment.range[1] <= moveEnd,
          );

        context.report({
          node: body[misplaced[0]],
          messageId: 'misplaced',
          fix: hasComments
            ? null
            : fixer => {
                let text = source.text;
                for (const definition of [...definitions].reverse()) {
                  text =
                    text.slice(0, definition.range[0]) +
                    text.slice(definition.range[1]);
                }

                const insertionOffset =
                  lastImport >= 0
                    ? body[lastImport].range[1]
                    : body[0].range[0];
                const removedBeforeInsertion = definitions
                  .filter(definition => definition.range[1] <= insertionOffset)
                  .reduce(
                    (length, definition) =>
                      length + definition.range[1] - definition.range[0],
                    0,
                  );
                const adjustedOffset = insertionOffset - removedBeforeInsertion;
                const definitionText = definitions
                  .map(definition => source.getText(definition))
                  .join('\n\n');
                const prefix = lastImport >= 0 ? '\n\n' : '';
                const suffix = '\n';
                text =
                  text.slice(0, adjustedOffset) +
                  prefix +
                  definitionText +
                  suffix +
                  text.slice(adjustedOffset);

                return fixer.replaceTextRange([0, source.text.length], text);
              },
        });
      },
    };
  },
};
