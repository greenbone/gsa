/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// ESLint rule: ts-definitions-top
// Ensures all TS type/interface definitions are after imports and before the rest of the code

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
        let lastImport = -1;
        const typeNodes = [];
        // Identify positions
        body.forEach((child, idx) => {
          if (child.type === 'ImportDeclaration') {
            lastImport = idx;
          } else if (
            child.type === 'TSInterfaceDeclaration' ||
            child.type === 'TSTypeAliasDeclaration' ||
            (child.type === 'ExportNamedDeclaration' &&
              child.declaration &&
              (child.declaration.type === 'TSInterfaceDeclaration' ||
                child.declaration.type === 'TSTypeAliasDeclaration'))
          ) {
            typeNodes.push(idx);
          }
        });

        // Group consecutive type/interface definitions
        let groups = [];
        let currentGroup = [];
        for (let i = 0; i < typeNodes.length; ++i) {
          if (
            currentGroup.length === 0 ||
            typeNodes[i] === typeNodes[i - 1] + 1
          ) {
            currentGroup.push(typeNodes[i]);
          } else {
            groups.push(currentGroup);
            currentGroup = [typeNodes[i]];
          }
        }
        if (currentGroup.length) groups.push(currentGroup);

        // Removed unused variables 'firstNonImport' and 'lastTypeIdx'

        // If any type/interface definition appears after non-type code, warn
        if (lastImport >= 0 && typeNodes.length > 0) {
          let foundNonType = false;
          for (let i = lastImport + 1; i < body.length; ++i) {
            if (
              body[i].type !== 'TSInterfaceDeclaration' &&
              body[i].type !== 'TSTypeAliasDeclaration' &&
              !(
                body[i].type === 'ExportNamedDeclaration' &&
                body[i].declaration &&
                (body[i].declaration.type === 'TSInterfaceDeclaration' ||
                  body[i].declaration.type === 'TSTypeAliasDeclaration')
              ) &&
              body[i].type !== 'EmptyStatement' &&
              body[i].type !== 'ExpressionStatement' &&
              body[i].type !== 'DebuggerStatement' &&
              body[i].type !== 'LabeledStatement' &&
              body[i].type !== 'WithStatement' &&
              body[i].type !== 'BlockStatement'
            ) {
              foundNonType = true;
            }
            if (
              foundNonType &&
              (body[i].type === 'TSInterfaceDeclaration' ||
                body[i].type === 'TSTypeAliasDeclaration' ||
                (body[i].type === 'ExportNamedDeclaration' &&
                  body[i].declaration &&
                  (body[i].declaration.type === 'TSInterfaceDeclaration' ||
                    body[i].declaration.type === 'TSTypeAliasDeclaration')))
            ) {
              // Move all type/interface groups to after imports
              context.report({
                node: body[i],
                messageId: 'misplaced',
                fix: fixer => {
                  const sourceCode = context.getSourceCode();
                  // Build the cleaned type block
                  const typeBlock = groups
                    .map(group =>
                      sourceCode.text
                        .slice(
                          body[group[0]].range[0],
                          body[group[group.length - 1]].range[1],
                        )
                        .trim(),
                    )
                    .join('\n\n');
                  // Remove all original type/interface nodes
                  const fixes = groups.flatMap(group =>
                    group.map(idx => fixer.remove(body[idx])),
                  );
                  // Insert the cleaned block after the last import
                  fixes.push(
                    fixer.insertTextAfter(
                      body[lastImport],
                      '\n\n' + typeBlock + '\n'
                    ),
                  );
                  return fixes;
                },
              });
              break;
            }
          }
        }
      },
    };
  },
};
