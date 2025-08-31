import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const {
    CLOUD_NAME,
    API_KEY,
    API_SECRET_KEY,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    MONGODB_URL,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    RESET_PASSWORD_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    NODE_ENV,
    REDIS_HOST
} = process.env;