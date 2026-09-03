/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as path from 'path';

/**
 * @param {string} str
 * @returns {boolean}
 */
function isKebabCase(str) {
  return /^[a-z]([a-z0-9-]*[a-z0-9])?$/.test(str);
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function isCamelCaseWithUsePrefix(str) {
  return /^use[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function isCamelCaseWithWithPrefix(str) {
  return /^with[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function isCamelCaseWithCreatePrefix(str) {
  return /^create[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * @param {string} str
 * @returns {boolean}
 */
function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

/**
 * @param {any} context
 * @param {any} sourceCode
 * @returns {boolean}
 */
function isReactComponent(context, sourceCode) {
  // Check if file exports a React component (function or class that returns JSX)
  const text = sourceCode.getText();

  // Must have JSX syntax to be considered a React component
  const hasJSX =
    /<[A-Z]/.test(text) ||
    /<\/[A-Z]/.test(text) ||
    /jsx/.test(text) ||
    /React\.createElement/.test(text) ||
    /return\s*\(\s*</.test(text);

  // If no JSX, it's definitely not a React component
  if (!hasJSX) {
    return false;
  }

  // Additional check: must import React or use JSX
  const hasReactImport =
    /import.*React/.test(text) || /from\s+['"]react['"]/.test(text);

  // Must have either React import or clear JSX usage
  if (!hasReactImport && !/<\//.test(text)) {
    return false;
  }

  // Look for component export patterns (only if JSX is present)
  const hasComponentExport =
    /export\s+(default\s+)?(function|const)\s+[A-Z]/.test(text) ||
    /export\s+default\s+[A-Z]/.test(text) ||
    /export\s+.*function.*[A-Z]/.test(text);

  // Extra validation: must actually export a component, not just utility functions
  const hasCapitalizedExport = /export\s+(default\s+)?[A-Z]/.test(text);

  return hasJSX && hasComponentExport && hasCapitalizedExport;
}

/**
 * @param {any} context
 * @param {any} sourceCode
 * @returns {boolean}
 */
function isHOC(context, sourceCode) {
  // Check if file exports a Higher-Order Component
  const text = sourceCode.getText();
  const filename = context.getFilename();
  const basename = path.basename(filename);

  // Check filename pattern first - this is the most reliable indicator
  if (/^with[A-Z]/.test(basename)) {
    return true;
  }

  // Only do content-based detection for files that DON'T start with obvious component patterns
  if (/^[A-Z]/.test(basename)) {
    // If filename starts with capital letter, it's likely a component, not HOC
    return false;
  }

  // Look for HOC patterns in code (only for non-component filenames)
  const hasHOCExport =
    /export\s+(default\s+)?(function\s+with[A-Z]|const\s+with[A-Z])/.test(
      text,
    ) || /const\s+with[A-Z][a-zA-Z]*\s*=/.test(text);
  const hasHOCComment = /Higher-Order Component|HOC/i.test(text);

  return hasHOCExport || hasHOCComment;
}

/**
 * @param {any} context
 * @param {any} sourceCode
 * @returns {boolean}
 */
function isReactHook(context, sourceCode) {
  // Check if file exports a single hook (function starting with 'use')
  const text = sourceCode.getText();
  const filename = context.getFilename();
  const basename = path.basename(filename);

  // Files in use-query directories should always be kebab-case (multiple hooks)
  if (filename.includes('/use-query/')) {
    return false;
  }

  // Check filename pattern first - hooks can be in any JS/TS/JSX/TSX file
  if (/^use[A-Z]/.test(basename)) {
    return true;
  }

  // Don't do content-based detection for JSX/TSX files unless they start with 'use'
  if (/\.(jsx|tsx)$/.test(filename) && !/^use[A-Z]/.test(basename)) {
    return false;
  }

  // Look for hook patterns in code - must actually export a hook function
  const hookExportMatches = text.match(
    /export\s+(default\s+)?(function\s+use[A-Z]|const\s+use[A-Z])/g,
  );
  const defaultHookExport = /export\s+default\s+use[A-Z]/.test(text);

  // Count total hook exports
  const hookExportCount =
    (hookExportMatches ? hookExportMatches.length : 0) +
    (defaultHookExport ? 1 : 0);

  // Only consider it a hook file if it exports exactly ONE hook
  // Files with multiple hooks should be kebab-case
  return hookExportCount === 1;
}
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce filename conventions for JavaScript/TypeScript files',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      kebabCase: 'Filename "{{filename}}" should be in kebab-case.',
      pascalCase:
        'React component filename "{{filename}}" should be in PascalCase.',
      hookCase:
        'React hook filename "{{filename}}" should be in camelCase with "use" prefix.',
      hocCase:
        'HOC filename "{{filename}}" should be in camelCase with "with" prefix.',
      createCase:
        'Factory function filename "{{filename}}" should be in camelCase with "create" prefix.',
    },
  },

  /**
   * @param {any} context
   * @returns {any}
   */
  create(context) {
    return {
      /**
       * @param {any} node
       */
      Program(node) {
        const filename = context.getFilename();
        const sourceCode = context.getSourceCode();

        // Skip if not a JS/TS file or if it's a config/test file
        if (!/\.(js|jsx|ts|tsx)$/.test(filename)) {
          return;
        }

        const basename = path.basename(filename);
        const nameWithoutExt = basename.replace(/\.(js|jsx|ts|tsx)$/, '');

        // Skip special files
        const specialFiles = [
          'index',
          'setup',
          'config',
          'vite-env.d',
          '__tests__',
          'testing',
          'setupTests',
        ];

        if (specialFiles.some(special => nameWithoutExt.includes(special))) {
          return;
        }

        // Handle test files - they should follow the same naming as the file they test
        let actualNameToCheck = nameWithoutExt;
        let isTestFile = false;

        if (
          /\.(test|spec)$/.test(nameWithoutExt) ||
          basename.includes('__tests__')
        ) {
          if (/\.(test|spec)$/.test(nameWithoutExt)) {
            // Remove .test or .spec suffix to get the actual component name
            actualNameToCheck = nameWithoutExt.replace(/\.(test|spec)$/, '');
            isTestFile = true;
          } else {
            // Skip files in __tests__ directory for now
            return;
          }
        }

        // Determine file type and apply appropriate rule
        // Check for HOCs first (regardless of file extension)
        if (isHOC(context, sourceCode)) {
          // HOC files should use camelCase with 'with' prefix
          if (!isCamelCaseWithWithPrefix(actualNameToCheck)) {
            context.report({
              node,
              messageId: 'hocCase',
              data: {
                filename: basename,
              },
            });
          }
        } else if (isReactHook(context, sourceCode)) {
          // React hook files should use camelCase with 'use' prefix
          if (!isCamelCaseWithUsePrefix(actualNameToCheck)) {
            context.report({
              node,
              messageId: 'hookCase',
              data: {
                filename: basename,
              },
            });
          }
        } else if (/^create[A-Z]/.test(actualNameToCheck)) {
          // Factory function files should use camelCase with 'create' prefix
          if (!isCamelCaseWithCreatePrefix(actualNameToCheck)) {
            context.report({
              node,
              messageId: 'createCase',
              data: {
                filename: basename,
              },
            });
          }
        } else if (/\.(jsx|tsx)$/.test(filename)) {
          // JSX/TSX files should always use PascalCase (React components)
          if (!isPascalCase(actualNameToCheck)) {
            context.report({
              node,
              messageId: 'pascalCase',
              data: {
                filename: basename,
              },
            });
          }
        } else if (!isTestFile && isReactComponent(context, sourceCode)) {
          // React component files should use PascalCase
          if (!isPascalCase(actualNameToCheck)) {
            context.report({
              node,
              messageId: 'pascalCase',
              data: {
                filename: basename,
              },
            });
          }
        } else {
          // All other JS/TS files should use kebab-case
          if (!isKebabCase(actualNameToCheck)) {
            context.report({
              node,
              messageId: 'kebabCase',
              data: {
                filename: basename,
              },
            });
          }
        }
      },
    };
  },
};
