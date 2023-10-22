# @guarapi/create-guarapi-app

[![npm version](https://badge.fury.io/js/%40guarapi%2Fcreate-guarapi-app.svg)](https://www.npmjs.com/package/@guarapi/create-guarapi-app)

**@guarapi/create-guarapi-app** is a package to quickly generate a Guarapi web application. It helps you set up a new Guarapi project with a basic file structure, development server, and configuration, making it easy to start building your Guarapi application.

## Installation
You can install **@guarapi/create-guarapi-app** globally using npm:

```bash
pnpm i -g @guarapi/create-guarapi-app
```

## Usage

To create a new Guarapi application, run the following command:

```shell
create-guarapi-app [options]
```

Here are the available options:

- `-n, --name <string:name>` (default: my-project): Specifies the project name.
- `-e, --example <string:example>` (default: basic-api): Specifies the example folder name, which you can pick from the [Guarapi examples](https://github.com/guarapi/guarapi/tree/main/examples).
- `-y, --yes`: Create the app automatically and answer "yes" to any prompts.
- `-v, --version`: Print the package version.
- `-h, --help`: Print this usage information.

For example, to create a new Guarapi application named "my-app" using the "basic-api" example, you can run:

```shell
create-guarapi-app -n my-app -e basic-api
```

This command will generate a new Guarapi application with the specified options. You can then customize it to match your project's specific requirements.

## Contributing
Contributions to **@guarapi/create-guarapi-app** are welcome! If you encounter issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/guarapi/create-guarapi-app).

If you'd like to contribute to the package, please follow the [Contribution Guidelines](/CONTRIBUTING.md) outlined in the repository.

## License
**@guarapi/create-guarapi-app** is open-source software licensed under the [MIT License](/LICENSE).

## Code of Conduct
Please note that this project has a [Code of Conduct](/CODE_OF_CONDUCT.md). We expect all contributors and users to follow it to ensure a welcoming and inclusive community.

## About Guarapi
**Guarapi** is a framework for building web applications with Node.js. It provides a simple and elegant way to create fast and scalable web apps, without sacrificing functionality or performance. If you're interested in learning more about Guarapi, visit the [Guarapi repo](https://github.com/guarapi/guarapi).

Happy coding with Guarapi!
