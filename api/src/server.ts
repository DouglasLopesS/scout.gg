import { createApp } from './app.js';
import { loadConfig } from './config/env.js';

try {
  const config = loadConfig();
  createApp(config).listen(config.port, () => {
    console.log(`scout.gg API disponível em http://localhost:${config.port}`);
  });
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
