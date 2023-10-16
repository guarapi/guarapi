import guarapi, { middlewarePlugin, Router, bodyParserPlugin, MiddlewareError } from 'guarapi';

const app = guarapi();
const router = Router();

app.plugin(bodyParserPlugin);
app.plugin(middlewarePlugin);

router.get('/', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/', router);

app.use<MiddlewareError>((error, _req, res, _next) => {
  res.status((error as Error)?.message === 'Not Found' ? 404 : 500);
  res.json({ error: (error as Error)?.message || 'Internal Server Error' });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('> Running: http://localhost:3000');
});
