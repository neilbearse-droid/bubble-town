import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  // Browser game source.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '18.2' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // The automatic JSX runtime means React need not be in scope for JSX.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Plenty of friendly copy ("Let's play!", "I'm hungry") — apostrophes are fine.
      'react/no-unescaped-entities': 'off',
      // mkIcon is a small component factory; display names aren't worth it here.
      'react/display-name': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  // Node-side tooling: build config and scripts.
  {
    files: ['*.config.{js,mjs}', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];
