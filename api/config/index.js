const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
// First try to load from backend/.env, then fallback to backend/config/config.env
dotenv.config({ path: path.resolve(__dirname, '../.env') }) || 
dotenv.config({ path: path.resolve(__dirname, './config.env') });

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server configuration
const PORT = process.env.PORT || 4000;

// Database configuration
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/Fino';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Authentication
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '5d';
const COOKIE_EXPIRE = parseInt(process.env.COOKIE_EXPIRE || '5', 10);

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Export configuration
module.exports = {
  NODE_ENV,
  PORT,
  DB_URI,
  EMAIL_USER,
  EMAIL_PASS,
  JWT_SECRET,
  JWT_EXPIRE,
  COOKIE_EXPIRE,
  CORS_ORIGIN,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',
};
