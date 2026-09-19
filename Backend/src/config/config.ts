import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    MISTRALAI_API_KEY: process.env.MISTRALAI_API_KEY || '',
    COHERE_API_KEY: process.env.COHERE_API_KEY || '',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    PORT: Number(process.env.PORT || 3000),
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export default config;
