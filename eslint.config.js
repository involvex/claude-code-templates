module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'docs/**',
      'docu/**',
      'api/**',
      'cli-tool/components/**',
      'cli-tool/templates/**',
      '.vercel/**',
      '.next/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // Prettier compatibility - turn off conflicting rules
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',

      // Custom rules
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'warn',
    },
  },
];
