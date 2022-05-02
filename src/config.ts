/*
USAGE:
- A variable can be accessed through Config if its default value is define here
- A variable will be casted using its default value type

IMPORTANT NOTES:
- Secret values MUST NOT be stored in this file
*/
/* eslint-disable max-len */
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

export type Optional<T> = {
  [K in keyof T]?: T[K];
};

dotenv.config();

const defaultConfig = {
  PORT: 3000,
  MONGO_URI: '',

  // Cost factor to compute password salt
  SALT_ROUNDS: 10,

  JWT_SECRET: '',
  JWT_EXPIRATION_DURATION: '7d',
};

type IConfig = Optional<typeof defaultConfig>;

export class EnvConfig {
  private mapping: IConfig = {};

  constructor() {
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

export default new EnvConfig();
