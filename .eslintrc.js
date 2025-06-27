// module.exports = {
//     env: {
//         browser: true,
//         es2021: true,
//         node: true,
//         jest: true
//     },
//     extends: [
//         'eslint:recommended',
//         'plugin:react/recommended',
//         'plugin:react-hooks/recommended',
//         'react-app',
//         'react-app/jest'
//     ],
//     parserOptions: {
//         ecmaFeatures: {
//             jsx: true
//         },
//         ecmaVersion: 12,
//         sourceType: 'module'
//     },
//     plugins: [
//         'react',
//         'react-hooks'
//     ],
//     rules: {
//         // React specific rules
//         'react/prop-types': 'warn',
//         'react/no-unused-prop-types': 'warn',
//         'react/no-array-index-key': 'warn',
//         'react/jsx-key': 'error',
//         'react/jsx-no-duplicate-props': 'error',
//         'react/jsx-no-undef': 'error',
//         'react/jsx-uses-react': 'off', // Not needed in React 17+
//         'react/react-in-jsx-scope': 'off', // Not needed in React 17+
//
//         // React Hooks rules
//         'react-hooks/rules-of-hooks': 'error',
//         'react-hooks/exhaustive-deps': 'warn',
//
//         // General JavaScript rules
//         'no-console': 'warn',
//         'no-debugger': 'error',
//         'no-unused-vars': 'warn',
//         'no-var': 'error',
//         'prefer-const': 'error',
//         'no-duplicate-imports': 'error',
//         'no-multiple-empty-lines': ['error', { max: 1 }],
//         'semi': ['error', 'always'],
//         'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
//         'jsx-quotes': ['warn', 'prefer-double'],
//         'comma-dangle': ['warn', 'never'],
//         'object-curly-spacing': ['warn', 'always'],
//         'array-bracket-spacing': ['warn', 'never'],
//         'indent': ['warn', 4, { SwitchCase: 1 }],
//         'linebreak-style': 'off',
//         'eol-last': 'warn',
//         'no-trailing-spaces': 'warn',
//
//         // Best practices
//         'eqeqeq': ['error', 'always'],
//         'curly': 'error',
//         'no-eval': 'error',
//         'no-implied-eval': 'error',
//         'no-new-func': 'error',
//         'no-return-assign': 'error',
//         'no-self-compare': 'error',
//         'no-throw-literal': 'error',
//         'no-unused-expressions': 'warn',
//         'radix': 'error',
//         'wrap-iife': 'error',
//         'yoda': 'error'
//     },
//     settings: {
//         react: {
//             version: 'detect'
//         }
//     },
//     ignorePatterns: [
//         'build/',
//         'public/',
//         'node_modules/',
//         '*.config.js'
//     ]
// };