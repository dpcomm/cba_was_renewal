import dotenv from "dotenv";
import path from "path";
import logger from "@utils/logger";

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.prod' 
  : '.env.dev';

const envPath = path.resolve(process.cwd(), envFile);

logger.info(`[Config] NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`[Config] Loading env file: ${envPath}`);

const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  logger.error(`[Config] Error loading .env file:`, result.error);
}

logger.info(`[Config] REDIS_URL: ${process.env.REDIS_URL}`);
logger.info(`[Config] DATABASE_URL: ${process.env.DATABASE_URL}`);
