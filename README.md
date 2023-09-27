# Guarapi

![CI](https://github.com/joaoneto/guarapi/actions/workflows/ci.yml/badge.svg?branch=main)
[![Coverage Status](https://coveralls.io/repos/github/joaoneto/guarapi/badge.svg?branch=main)](https://coveralls.io/github/joaoneto/guarapi?branch=main)

Guarapi is a framework for building web applications with nodejs. It aims to provide a simple and elegant way to create fast and scalable web apps, without sacrificing functionality or performance. Guarapi offers a minimalist and expressive syntax, a flexible routing engine, and a rich set of built-in features. Guarapi is designed to be easy to learn, use, and extend, making it a great choice for beginners and experts alike.

## Installation
npm i guarapi --save

## Example
```typescript
import guarapi, {
  middlewarePlugin,
  loggerPlugin,
  Router,
  MiddlewareError,
} from 'guarapi';

const app = guarapi();
const router = Router();

app.plugin(middlewarePlugin);
app.plugin(loggerPlugin);

router.get('/', (req, res) => {
  res.end('ok');
});

router.get('/respond-with-json', (req, res) => {
  res.json({ ok: true });
});

app.use(router);

app.use<MiddlewareError>((error, _req, res, _next) => {
  res.status((error as Error)?.message === 'Not Found' ? 404 : 500);
  res.json({ error: (error as Error)?.message || 'Internal Server Error' });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('> Running: http://localhost:3000');
});
```

## API Design
Guarapi adopts an elegant and intuitive API design approach, allowing developers to write clean and maintainable code. The framework's main handler provides `pre`, `post`, and `error` hooks for plugins, enabling you to efficiently manage various aspects of request handling.

- **`pre` Hook**: This hook allows you to execute actions before the main request handler processes the request. It's useful for tasks like request validation or authentication checks.
- **`post` Hook**: The `post` hook lets you perform actions after the main request handler has processed the request. You can use it for tasks such as response formatting or logging.
- **`error` Hook**: When an error occurs during request processing, the `error` hook comes into play. It allows you to handle errors gracefully, whether by logging them or returning appropriate error responses.

## Routing
Guarapi provides a flexible routing engine that simplifies the process of defining routes for your web application. With Guarapi's routing system, you can effortlessly handle various HTTP methods and URL patterns.

### Route Parameters
Guarapi's routing system supports powerful route parameters, making it versatile for different use cases:

- **Basic Route Parameter**: You can define simple route parameters using a colon notation, e.g., `/user/:id`. This notation allows you to capture dynamic values from the URL.
- **Wildcard Route Parameter**: When a route parameter ends with a wildcard symbol (`*`), it captures the entire path as an array. For example, `/profile/:path*` captures all path segments as an array in `req.params.path`.
- **Pattern Matching**: Guarapi also supports pattern matching in route parameters. For instance, `/user/t(es)?t` matches both `tt` and `test`.

## Plugins
Guarapi comes equipped with a collection of built-in plugins, including `middlewarePlugin` and `loggerPlugin`, designed to simplify common development tasks and enhance the overall development experience. However, the extensibility of Guarapi goes beyond these built-in plugins.

You can create your custom plugins to extend the functionality of Guarapi. These plugins can handle various tasks such as observability, instrumentation, custom authentication, or any other specialized functionality tailored to your project's needs. The flexibility to create custom plugins empowers you to craft web applications that align precisely with your requirements.

## Contributing
We enthusiastically welcome contributions from the Guarapi community. If you're interested in contributing to the project, please follow the steps outlined in our [Contribution Guidelines](CONTRIBUTING.md). Your contributions can include bug fixes, new features, documentation improvements, or any other enhancements that benefit the Guarapi framework.

## Code of Conduct
To maintain a friendly and inclusive environment, we expect all contributors and community members to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). This code sets the standard for respectful and collaborative interactions within the Guarapi community.

Feel free to explore the Guarapi documentation for more details on effectively and efficiently utilizing the framework in your projects. If you have any questions or require further assistance, don't hesitate to reach out to our vibrant and supportive community.

Happy coding with Guarapi!
