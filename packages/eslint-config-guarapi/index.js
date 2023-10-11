module.exports = {
	env: {
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:prettier/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:import/recommended',
		'plugin:import/typescript'
	],
	plugins: ['@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	ignorePatterns: ['dist', 'node_modules'],
	rules: {
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/semi': ['error', 'always'],
		'@typescript-eslint/member-delimiter-style': 'error',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/no-use-before-define': ['error'],
		'@typescript-eslint/no-shadow': ['error'],
		'@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
		'no-use-before-define': 'off',
		'arrow-body-style': 'off',
		'no-underscore-dangle': 'off',
		'import/no-dynamic-require': 'off',
		'import/no-extraneous-dependencies': 0,
		'import/prefer-default-export': 'off',
		'import/extensions': ['error', 'ignorePackages', { js: 'never', ts: 'never' }],
		'prettier/prettier': ['error', { 'parser': 'typescript' }],
	},
	overrides: [
		{
			files: ['*.js'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts']
		}
	},
};
