import { FlatCompat } from '@eslint/eslintrc';
const compat = new FlatCompat({baseDirectory:import.meta.dirname});
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.next/**', 'coverage/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals'),
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);
