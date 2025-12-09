import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-plugin-prettier';
import next from 'eslint-config-next';

export default [
    {
        ignores: [
            '**/.next/**',
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
        ],
    },

    ...tseslint.configs.recommended,

    {
        files: ['**/app/*.{ts,tsx}'],

        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 2020,
            sourceType: 'module',
        },

        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
            unicorn,
            prettier,
        },

        settings: {
            react: { version: 'detect' },
        },

        rules: {
            ...next.rules,
            ...react.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,

            'prettier/prettier': 'warn',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],

            'react/self-closing-comp': 'error',
            'no-console': 'warn',
            'unicorn/filename-case': [
                'warn',
                {
                    cases: { pascalCase: true },
                },
            ],
        },
    },
];
