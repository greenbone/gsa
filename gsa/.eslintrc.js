/*
 * ESLint config for gsa js code
 *
 * - Syntax rules should be errors
 * - Coding style should be warnings
 */

module.exports = {
  extends: ['react-app', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'accessor-pairs': 'error', // require get xyz if set xyz is defined
    'block-scoped-var': 'error', // require var usage and definition at the same block
    'callback-return': 'error',
    camelcase: 'off', // don't require camelCase for functions and properties
    'class-methods-use-this': 'off', // don't enforce that class methods always utilize this
    'consistent-this': 'off',
    curly: 'error', // always require braces if (a) foo() is not allowed
    'dot-notation': [
      // require dot notation for object: abc.def instead of abc['def']
      'warn',
      {
        allowKeywords: true,
      },
    ],
    'func-names': [
      // disallow named function expressions
      'warn',
      'never',
    ],
    'func-style': [
      // enforce function expression instead of declaration
      'warn',
      'declaration',
      {
        allowArrowFunctions: true, // allow arrow functions
      },
    ],
    'global-require': 'warn', // enforce using require() on the top-level module scope
    'guard-for-in': 'off', // don't require hasOwnProperty call in for-in loops
    'handle-callback-err': 'error', // enforce callback error handling if callback has an error parameter
    indent: 'off',
    'init-declarations': 'off',
    'linebreak-style': [
      // require unix line endings (only \n)
      'error',
      'unix',
    ],
    'max-depth': [
      // enforce a maximum depth of 4 that blocks can be nested
      'warn',
      4,
    ],
    'max-lines': [
      'warn',
      {
        max: 5000,
        skipBlankLines: true,
      },
    ],
    'max-nested-callbacks': 'error',
    'max-params': [
      // allow only max 6 params
      'warn',
      6,
    ],
    'max-statements': 'off',
    'max-statements-per-line': [
      'warn',
      {
        max: 2,
      },
    ],
    'multiline-ternary': 'off',
    'newline-after-var': 'off',
    'newline-before-return': 'off',
    'no-alert': 'error',
    'no-bitwise': [
      // disallow bitwise operators. most of the time it's a typo for && and ||
      'warn',
      {
        allow: ['~', '<<', '>>'],
      },
    ],
    'no-catch-shadow': 'error',
    'no-console': 'warn',
    'no-div-regex': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'warn',
    'no-eq-null': 'error', // disallow foo == null, require foo === null
    'no-global-assign': 'error', // disallow assignment to native objects or read-only global variables
    'no-implicit-coercion': [
      // disallow the type conversion with shorter notations
      'warn',
      {
        allow: [
          '+', // includes +value and '' + value
          '!!',
          '*',
        ],
      },
    ],
    'no-implicit-globals': 'error', // disallow variable and function declarations in the global scope
    'no-lonely-if': 'warn', // disallow if statements as the only statement in else blocks
    'no-mixed-requires': 'warn', // disallow require calls to be mixed with regular variable declarations
    'no-negated-condition': 'warn',
    'no-new-require': 'error', // disallow new require: var appHeader = new require('app-header');
    'no-path-concat': 'error',
    'no-proto': 'error', // disallow use of __proto__
    // disable no-return-assign until there is an option for disabling this rule
    // for arrow functions. it's causing warning for all react refs currently
    // https://github.com/eslint/eslint/issues/5150
    // 'no-return-assign': 'warn', // disallow assignment in return Statement
    'no-shadow': 'warn', // disallow variable declarations from shadowing variables declared in the outer scope
    'no-shadow-restricted-names': 'error', // disallow shadowing of restricted names e.g. var undefined = 'foo';
    'no-undef-init': 'warn', // disallow initializing to undefined: var foo = undefined;

    'no-unmodified-loop-condition': 'warn', // disallow loops where the break condition is never valid
    'no-unneeded-ternary': 'warn', // disallow ternary operators when simpler alternatives exist
    'no-unsafe-negation': 'error', // disallow negating the left operand of relational operators: if (!key in object)
    'no-useless-call': 'error', // disallow unnecessary .call() and .apply()
    'no-var': 'warn', // disallow usage of var for variables. use let or const instead
    'no-void': 'error',
    'object-shorthand': 'off', // don't require {a} instead of {a: a}
    'one-var': [
      // require every variable to be declared on separate statement
      'warn',
      'never',
    ],
    'padded-blocks': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-const': [
      // enforce using const instead of let (and var)
      'warn',
      {
        destructuring: 'all', // enforce const for destruction only if all vars can be const
        ignoreReadBeforeAssign: false,
      },
    ],
    'prefer-destructuring': [
      // prefer destucturing for objects
      'warn',
      {
        VariableDeclarator: {
          object: true,
          array: true,
        },
        AssignmentExpression: {},
      },
    ],
    'prefer-reflect': 'off',
    'prefer-rest-params': 'error', // require using the rest parameters instead of arguments
    'prefer-spread': 'warn', // prefer spread operator Xyz.func(...args) instead of Xyz.func.apply(Xyz, args)
    'prefer-template': 'off',
    'sort-imports': 'off',
    'sort-keys': 'off',
    'spaced-comment': [
      // require whitespace at the beginning and end of a comment
      'warn',
      'always',
    ],
    'symbol-description': 'error', // require symbol description: Symbol('some description')
    yoda: [
      // disallow yoda conditions: if (1 === b)
      'error',
      'never',
    ],
    'react/prop-types': [
      // warn if not proptypes are defined for a component
      'warn',
      {
        ignore: ['children', 'className', 'location', 'params'],
      },
    ],
    'react/prefer-es6-class': 'warn', // prefer ES6 class over React.createReactClass
    'react/prefer-stateless-function': [
      'warn',
      {
        ignorePureComponents: true,
      },
    ],
    'react/sort-prop-types': [
      // warn if proptypes are not sorted
      'warn',
      {
        callbacksLast: true,
      },
    ],
    'react/jsx-key': 'warn', // Warn if an element that likely requires a key prop
    'react/jsx-no-bind': [
      // No .bind() in JSX Props
      'warn',
      {
        ignoreRefs: true,
        allowArrowFunctions: true,
      },
    ],
    'react/jsx-no-duplicate-props': 'error', // prevent duplicate props in JSX
  },
};

// vim: set ts=2 sw=2 tw=80:
