import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        Handlebars: 'readonly',
      },
    },
    rules: {
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
