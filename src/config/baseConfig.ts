'use strict';

import path from 'path';
import dotenv from 'dotenv';
import IBaseConfig from '../types/interfaces/IBaseConfig';

dotenv.config({ path: path.resolve('./.env') });

const baseConfig: IBaseConfig = Object.freeze({
  node_env: String(process.env.NODE_ENV),
  app_name: String(process.env.APP_NAME),
  isProd: process.env.NODE_ENV === 'production',
  server: {
    port: Number(process.env.PORT),
    base_url:
      process.env.NODE_ENV === 'production' ? String(process.env.BASE_URL_PROD) : String(process.env.BASE_URL_DEV),
    enabled_request_methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  auth: {
    salt_rounds: Number(process.env.SALT_ROUNDS),
    secret: String(process.env.SECRET),
    jwt_exp: String(process.env.JWT_EXP),
  },
  redis: {
    port: Number(process.env.REDIS_PORT),
    host: String(process.env.REDIS_HOST),
  },
  log: {
    log_period: String(process.env.LOG_PERIOD),
    log_dir_path: path.resolve('src', 'logs'),
    info_log_path: path.resolve('src', 'logs', 'info.log'),
    error_log_path: path.resolve('src', 'logs', 'error.log'),
    max_log_file_count: Number(process.env.MAX_LOG_FILE_COUNT),
  },
});

export default baseConfig;
