import app from './app';
import { env } from './config/env';


if (env.nodeEnv !== 'production') {
  app.listen(env.port, () => {
    console.log(`🚀 Courier API running on port ${env.port} [${env.nodeEnv}]`);
  });
}

export default app;