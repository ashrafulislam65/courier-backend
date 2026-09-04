import app from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`🚀 Courier API running on port ${env.port} [${env.nodeEnv}]`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});