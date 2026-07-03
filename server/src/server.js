import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

app.listen(env.PORT, () => {
  logger.info(`HealSpace API running on port ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});