# Contributing to Guarapi

Thank you for your interest in contributing to Guarapi! We appreciate your support and collaboration. Before you get started, please take a moment to review this guide to ensure that your contributions align with our project's goals and standards.

## Table of Contents
1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
2. [Development](#development)
   - [Project Structure](#project-structure)
   - [Core Plugins](#core-plugins)
3. [Testing](#testing)
   - [Creating Tests](#creating-tests)
   - [Running Tests](#running-tests)
4. [Local Linking](#local-linking)
   - [Linking Guarapi](#linking-guarapi)
   - [Linking with Example Project](#linking-with-example-project)
5. [Code of Conduct](#code-of-conduct)

## Getting Started

### Prerequisites

Before you start contributing to Guarapi, please ensure you have the following prerequisites installed on your system:

- Node.js and npm (Recommended package manager)
- Git

### Installation

1. Clone the Guarapi repository to your local machine:

   ```shell
   git clone https://github.com/your-username/guarapi.git
   ```

2. Navigate to the project directory:

   ```shell
   cd guarapi
   ```

3. Install project dependencies using npm:

   ```shell
   npm install
   ```

## Development

### Project Structure

The Guarapi project follows a specific structure:

- **Core Plugins**: Core plugins are located in the `src/plugins` directory. You can find the interface definition for plugins in `src/types.ts`. These plugins consist of a function that is executed during Guarapi initialization and can be used to patch the application.

### Core Plugins

If you plan to create or modify core plugins, please ensure that your changes align with the project's goals and adhere to the established plugin interface.

## Testing

### Creating Tests

When adding new features or making changes, it's crucial to create tests to maintain code quality. Test files should be placed in the `./test` folder. Please ensure your tests cover the functionality you're working on.

### Running Tests

You can run the tests using the following command:

```shell
npm run test
```

Make sure all tests pass before submitting your contributions.

## Local Linking

Local linking is a helpful way to develop and test Guarapi locally while working on other projects that depend on it.

### Linking Guarapi

To locally link Guarapi, follow these steps:

1. Navigate to the Guarapi directory:

   ```shell
   cd guarapi
   ```

2. Link Guarapi locally using npm:

   ```shell
   npm link
   ```

### Linking with Example Project

If you have an example project that depends on Guarapi and you want to link it locally for testing, follow these steps:

1. Navigate to your Guarapi example project's directory:

   ```shell
   cd guarapi-example-project
   ```

2. Link Guarapi to your example project:

   ```shell
   npm link guarapi
   ```

Now, your example project will use the locally linked Guarapi for development and testing.

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We expect all contributors to adhere to these guidelines to ensure a positive and inclusive environment for everyone involved in the Guarapi project.

Thank you for considering contributing to Guarapi. Your contributions are valuable, and we look forward to working with you!
