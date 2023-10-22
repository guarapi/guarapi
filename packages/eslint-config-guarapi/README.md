# @guarapi/eslint-config-guarapi

[![npm version](https://badge.fury.io/js/%40guarapi%2Feslint-config-guarapi.svg)](https://www.npmjs.com/package/@guarapi/eslint-config-guarapi)

**eslint-config-guarapi** is an ESLint configuration package for projects that use the Guarapi framework. This setting recommends code style guidelines and practices to ensure code consistency and maintainability. It is designed for use in Node.js and browser-based applications.

## Installation
You can install **eslint-config-guarapi** using npm:

```bash
npm install --save-dev @guarapi/eslint-config-guarapi
```

## Usage

To use **eslint-config-guarapi** in your project, extend it in your ESLint configuration file (e.g., `.eslintrc.json`):

```json
{
	"extends": ["guarapi"]
}
```

Also config prettier rules (e.g. `package.json`):
```json
{
  "name": "your-package-name",
  "prettier": "@guarapi/eslint-config-guarapi/prettierrc.js"
}
```

You can customize or override these rules to match your project's specific coding standards.

## License
**eslint-config-guarapi** is open-source software licensed under the [MIT License](/LICENSE).

## Contributing
Contributions to **eslint-config-guarapi** are welcome! If you encounter issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/seu-usuario/guarapi).

If you'd like to contribute to the package, please follow the [Contribution Guidelines](/CONTRIBUTING.md) outlined in the repository.

## Code of Conduct
Please note that this project has a [Code of Conduct](/CODE_OF_CONDUCT.md). We expect all contributors and users to follow it to ensure a welcoming and inclusive community.

## About Guarapi
**Guarapi** is a framework for building web applications with Node.js. It provides a simple and elegant way to create fast and scalable web apps, without sacrificing functionality or performance. If you're interested in learning more about Guarapi, visit the [Guarapi repo](https://github.com/seu-usuario/guarapi).

Happy coding with Guarapi!
