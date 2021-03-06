/*
USAGE:
- All environment variables will be loaded from .env to config object
- A variable can be accessed through Config if its default value is define here
- A variable will be casted using its default value type

IMPORTANT NOTES:
- Secret values MUST NOT be stored in this file
*/
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

export type Optional<T> = {
  [K in keyof T]?: T[K];
};

dotenv.config({
  path: process.env.NODE_ENV === 'e2e-test' ? '.env.e2e-test' : '.env',
});

export const defaultConfig = {
  PORT: 3000,
  MONGO_URI: '',

  // Cost factor to compute password salt
  SALT_ROUNDS: 10,

  JWT_SECRET: '',
  JWT_EXPIRATION_DURATION: '7d',

  LOGIN_RATE_LIMITER_MAX_ATTEMPTS: 3,
  LOGIN_RATE_LIMITER_WINDOW_MS: 3 * 1000,

  BASE_API_URL: 'http://localhost:3000',

  TEST_DATABASE_URL: 'mongodb://localhost:27018/',
  TEST_DATABASE_NAME: 'test-login',
};

type IConfig = Optional<typeof defaultConfig>;

export class Config {
  private mapping: IConfig = {};

  constructor(defaultConfig) {
    // Parsing config from .env file.
    Object.entries(defaultConfig).forEach(([key, defaultValue]: any[]) => {
      let value = process.env[key] != null ? process.env[key] : defaultValue;
      const defaultValueType = typeof defaultValue;
      try {
        // Cast types based on default value's type
        if (defaultValueType === 'number') {
          value = parseInt(value, 10);
        }
      } catch (e) {
        Logger.log(
          `Config: Cannot cast type ${defaultValueType} for env "${key}" with value "${value}"`,
        );
      }
      this.mapping[key] = value;
    });
    Logger.log('Config: Initialized');
  }

  get(key: keyof IConfig): any {
    const value = this.mapping[key];
    if (value == null || value === '') {
      Logger.warn(`Config: Value is not set for ${key}`);
    }
    return value;
  }
}

export default new Config(defaultConfig);
