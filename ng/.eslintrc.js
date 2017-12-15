/*
 * ESLint config for gsa js code
 *
 * - Syntax rules should be errors
 * - Coding style should be warnings
 */

module.exports = {
  extends: 'react-app',
  rules: {
    'accessor-pairs': 'error', // require get xyz if set xyz is defined
    'array-bracket-spacing': [ // disallow spaces inside of arrays
      'warn',
      'never',
    ],
    'arrow-parens': [ // only require parens in arrow function arguments as needed
      'warn',
      'as-needed',
    ],
    'arrow-spacing': [ // spaces after and before an arrow: (a) => {}
      'warn', {
        after: true,
        before: true,
      },
    ],
    'block-scoped-var': 'error', // require var usage and definition at the same block
    'brace-style': [ // use Stroustrup brace style. else, if-else, ... must be on its own line after closing brace
      'warn',
      'stroustrup',
    ],
    'callback-return': 'error',
    camelcase: 'off', // don't require camelCase for functions and properties
    'class-methods-use-this': 'off', // don't enforce that class methods always utilize this
    'comma-dangle': [ // require or disallow trailing commas
      'warn', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
    'comma-spacing': [ // enforces space after commas, disallow space before commas
      'warn', {
        after: true,
        before: false,
      },
    ],
    'comma-style': [ // require a comma after and on the same line as an array element, object property, or variable declaration
      'warn',
      'last',
    ],
    'computed-property-spacing': [ // disallows spaces inside computed property brackets a[y], b['z']
      'warn',
      'never',
    ],
    'consistent-this': 'off',
    curly: 'error', // always require braces if (a) foo() is not allowed
    'dot-notation': [ // require dot notation for object: abc.def instead of abc['def']
      'warn', {
        allowKeywords: true,
      },
    ],
    'eol-last': [ // require newline at the end of files
      'warn',
      'always',
    ],
    'func-call-spacing': 'warn', // disallow spacing between function identifiers and their invocations
    'func-names': [ // disallow named function expressions
      'warn',
      'never',
    ],
    'func-style': [ // enforce function expression instead of declaration
      'warn',
      'declaration', {
        allowArrowFunctions: true, // allow arrow functions
      },
    ],
    'generator-star-spacing': 'warn',
    'global-require': 'warn', // enforce using require() on the top-level module scope
    'guard-for-in': 'off', // don't require hasOwnProperty call in for-in loops
    'handle-callback-err': 'error', // enforce callback error handling if callback has an error parameter
    indent: 'off',
    'init-declarations': 'off',
    'jsx-quotes': [ // prefer double quotes " for jsx props
      'warn',
      'prefer-double',
    ],
    'key-spacing': [ // enforce consistent spacing between keys and values in object literal properties
      'warn', {
        beforeColon: false, // no space before colon :
        afterColon: true, // require space after colon :
        mode: 'strict', // enforces exactly one space before or after colons in object literals not two or more
      },
    ],
    'keyword-spacing': [ // enforce consistent spacing before and after js keywords (function, if, ...)
      'warn', {
        after: true,
        before: true,
      },
    ],
    'linebreak-style': [ // require unix line endings (only \n)
      'error',
      'unix',
    ],
    'lines-around-comment': [ // require empty lines around comments
      'warn', {
        beforeBlockComment: true, // require an empty line before block comments
        allowBlockStart: true, // allow comments to appear at the start of block statements without empty line
        allowObjectStart: true, // allow comments to appear at the start of an object declaration without empty line

        allowArrayStart: true, // allow comments to appear at the start of an array declaration without empty line

      },
    ],
    'max-depth': [ // enforce a maximum depth of 4 that blocks can be nested
      'warn',
      4,
    ],
    'max-len': [
      'warn',
      80, {
        ignoreComments: true,
      },
    ],
    'max-lines': [
      'warn', {
        max: 5000,
        skipBlankLines: true,
      },
    ],
    'max-nested-callbacks': 'error',
    'max-params': [ // allow only max 6 params
      'warn',
      6,
    ],
    'max-statements': 'off',
    'max-statements-per-line': [
      'warn', {
        max: 2,
      },
    ],
    'multiline-ternary': 'off',
    'newline-after-var': 'off',
    'newline-before-return': 'off',
    'no-alert': 'error',
    'no-bitwise': [ // disallow bitwise operators. most of the time it's a typo for && and ||
      'warn', {
        allow: [
          '~',
          '<<',
          '>>',
        ],
      },
    ],
    'no-catch-shadow': 'error',
    'no-console': 'warn',
    'no-div-regex': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'warn',
    'no-eq-null': 'error', // disallow foo == null, require foo === null
    'no-extra-parens': [ // disallow unnecessary parentheses
      'warn',
      'all', {
        enforceForArrowConditionals: false, // allow b = a => (a ? 1 : 0)
        ignoreJSX: 'all', // allow MyComponent = props => (<div/>)
        nestedBinaryExpressions: false, // allow parens like (a * b) + c
      },
    ],
    'no-floating-decimal': 'error', // disallow floating decimals: disallow .5, 2., -.7
    'no-global-assign': 'error', // disallow assignment to native objects or read-only global variables
    'no-implicit-coercion': [ // disallow the type conversion with shorter notations
      'warn', {
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
    'no-multi-spaces': [ // don't allow multiple spaces: let a  = 1;
      'warn', {
        ignoreEOLComments: true, // allow multiple spaces at comments
      },
    ],
    'no-multiple-empty-lines': 'warn',
    'no-negated-condition': 'warn',
    'no-new-require': 'error', // disallow new require: var appHeader = new require('app-header');
    'no-path-concat': 'error',
    'no-proto': 'error', // disallow use of __proto__
    // disbale no-return-assign until there is an option for disabling this rule
    // for arrow functions. it's causing warning for all react refs currently
    // https://github.com/eslint/eslint/issues/5150
    // 'no-return-assign': 'warn', // disallow assignment in return Statement
    'no-shadow': 'warn', // disallow variable declarations from shadowing variables declared in the outer scope
    'no-shadow-restricted-names': 'error', // disallow shadowing of restricted names e.g. var undefined = 'foo';
    'no-tabs': 'warn', // disallow all tabs \n
    'no-trailing-spaces': 'warn',
    'no-undef-init': 'warn', // disallow initializing to undefined: var foo = undefined;

    'no-unmodified-loop-condition': 'warn', // disallow loops where the break condition is never valid
    'no-unneeded-ternary': 'warn', // disallow ternary operators when simpler alternatives exist
    'no-unsafe-negation': 'error', // disallow negating the left operand of relational operators: if (!key in object)
    'no-useless-call': 'error', // disallow unnecessary .call() and .apply()
    'no-void': 'error',
    'object-curly-newline': [
      'warn', {
        ObjectExpression: { // object literals
          minProperties: 3, // require newline if there are 3 or more properties
          consistent: true, // requires that either both curly braces, or neither, directly enclose newlines
          multiline: true, // requires line breaks if there are line breaks inside properties or between properties
        },
        ObjectPattern: { // destructuring assignment
          consistent: true,
          multiline: true,
        },
      },
    ],
    'object-curly-spacing': [ // disallow spaces after { and before } within objects
      'warn',
      'never',
    ],
    'object-shorthand': 'off', // don't require {a} instead of {a: a}
    'one-var': [ // require every variable to be declared on seperate statement
      'warn',
      'never',
    ],
    'operator-linebreak': [ // enforce consistent linebreak style for operators
      'warn',
      'after',
    ],
    'padded-blocks': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-const': [ // enforce using const instead of let (and var)
      'warn', {
        destructuring: 'all', // enforce const for destuction only if all vars can be const
        ignoreReadBeforeAssign: false,
      },
    ],
    'prefer-destructuring': [ // prefer destucturing for objects
      'warn', {
        VariableDeclarator: {
          object: true,
          array: true,
        },
        AssignmentExpression: {
        },
      },
    ],
    'prefer-reflect': 'off',
    'prefer-rest-params': 'error', // require using the rest parameters instead of arguments
    'prefer-spread': 'warn', // prefer spread operator Xyz.func(...args) instead of Xyz.func.apply(Xyz, args)
    'prefer-template': 'off',
    'quote-props': [ // allow quotes for object properties ony if required e.g. {'a-b': 1}
      'warn',
      'as-needed',
    ],
    quotes: [ // allow only single quotes
      'warn',
      'single', {
        avoidEscape: true, // allow let single = 'a string containing "double" quotes';
        allowTemplateLiterals: true,
      },
    ],
    'require-jsdoc': 'off',
    semi: 'error', // always require semicolons
    'semi-spacing': 'warn',
    'sort-imports': 'off',
    'sort-keys': 'off',
    'space-before-blocks': [ // require spaces before blocks: {...}
      'warn', {
        functions: 'always',
        keywords: 'always',
        classes: 'always',
      },
    ],
    'space-before-function-paren': [ // disallow a space before function parenthesis
      'warn', {
        anonymous: 'never', // disallow for anonymous function expressions (e.g. function () {})
        named: 'never', // disallow for named functions (including constructors)
        asyncArrow: 'always', // require for async arrow function expressions (e.g. async () => {})
      },
    ],
    'space-in-parens': [ // disallow space inside of parentheses: (1 + 2) * 3
      'warn',
      'never',
    ],
    'space-infix-ops': 'warn', // require space around infix operators: i++
    'space-unary-ops': [ // require or disallow spaces before/after unary operators
      'warn', {
        words: true, // require spaces around unary word operators such as: new, delete, typeof, void, yield
        nonwords: false, // disallow spaces around unary operators such as: -, +, --, ++, !, !!
      },
    ],
    'spaced-comment': [ // require whitespace at the beginning and end of a comment
      'warn',
      'always',
    ],
    'symbol-description': 'error', // require symbol description: Symbol('some description')
    'template-curly-spacing': [ // disallow spaces in template string variables: `hello, ${ people.name  }!`; => `hello, ${people.name}!`;
      'warn',
      'never',
    ],
    'valid-jsdoc': [
      'warn', {
        requireReturnType: false,
        requireReturn: false,
        requireParamDescription: false,
        requireReturnDescription: false,
      },
    ],
    'wrap-iife': ['error', 'inside'],
    'wrap-regex': 'error',
    'yield-star-spacing': 'error',
    yoda: [ // disallow yoda conditions: if (1 === b)
      'error',
      'never',
    ],
    'react/prop-types': [ // warn if not proptypes are defined for a component
      'warn', {
        ignore: [
          'children',
          'className',
          'location',
          'params',
        ],
      },
    ],
    'react/prefer-es6-class': 'warn', // prefer ES6 class over React.createReactClass
    'react/prefer-stateless-function': [
      'warn', {
        ignorePureComponents: true,
      },
    ],
    'react/sort-prop-types': [ // warn if proptypes are not sorted
      'warn', {
        callbacksLast: true,
      },
    ],
    'react/jsx-first-prop-new-line': [ // require first property to be on next line component spans multiple lines
      'warn',
      'multiline',
    ],
    'react/jsx-indent': ['warn', 2], // Validate JSX indentation
    'react/jsx-indent-props': ['warn', 2], // Validate JSX prop intentation
    'react/jsx-key': 'warn', // Warn if an element that likely requires a key prop
    'react/jsx-max-props-per-line': [ // Limit maximum of props on a single line in JSX to 2
      'warn', {
        maximum: 2,
      },
    ],
    'react/jsx-no-bind': [ // No .bind() in JSX Props
      'warn', {
        ignoreRefs: true,
        allowArrowFunctions: true,
      },
    ],
    'react/jsx-no-duplicate-props': 'error', // prevent duplicate props in JSX
    'react/jsx-wrap-multilines': 'warn', // prevent missing parentheses around multiline JSX
  },
};

// vim: set ts=2 sw=2 tw=80:
