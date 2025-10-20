// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
  node: true,
  es2023: true,
},
parserOptions: {
  ecmaVersion: 2023, // ECMAScript 2023
  sourceType: 'module',
  ecmaFeatures: {
    jsx: false,
  },
},

  extends: [
    'eslint:recommended',
    // Agregar mejores prácticas modernas
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript', // si usas TS opcional
  ],
  plugins: [
    'import',
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // permite variables con _ prefijo
    'no-console': 'off', // activo para debugging
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }], // permite evitar escapes innecesarios
    'import/no-unresolved': 'error',
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
    }],
    'no-undef': 'error',
    'prefer-const': 'warn', // promueve const cuando sea posible
    'eqeqeq': ['error', 'always'], // usa === en vez de ==
    'curly': ['error', 'all'], // siempre usa llaves en bloques
    'max-len': ['warn', { code: 120 }], // límite recomendando en línea
    'no-var': 'error', // prohíbe var, usa let/const
    'arrow-spacing': ['error', { before: true, after: true }],
    'block-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
};

