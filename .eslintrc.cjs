module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:node/recommended', 'plugin:jsx-a11y/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
    'node/no-unsupported-features/es-syntax': 'off'
  },
  settings: {
    'import/resolver': {
      node: true
    }
  }
};
