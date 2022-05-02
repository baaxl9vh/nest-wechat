module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 13,
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'camelcase': ['error'],
    'no-multi-spaces': ['error', {
      'ignoreEOLComments': true,
    }],
    'space-before-blocks': ['error'],
    'keyword-spacing': ['error'],
    'space-before-function-paren': ['error', 'always'],
    'comma-spacing': ['error', {
      'after': true,
    }],
    'comma-dangle': ['error', {
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'functions': 'always-multiline',
    }],
    'eqeqeq': ['error', 'always'],
    'complexity': ['error', { max: 12 }],
  },
};