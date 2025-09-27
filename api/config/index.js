const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Environment
const NODE_STAGE = process.env.NODE_STAGE || "development";
const isProduction = NODE_STAGE === "production";
const isDevelopment = NODE_STAGE === "development";
const isTest = NODE_STAGE === "test";

// Server configuration
const PORT = isProduction
  ? process.env.PORT_LIVE
  : process.env.PORT_LOCAL;

// Database configuration
const DB_URI = isProduction
  ? process.env.DB_URI_LIVE
  : process.env.DB_URI_LOCAL;

// CORS configuration
const CORS_ORIGIN = isProduction
  ? process.env.CORS_ORIGIN_APP_LIVE
  : process.env.CORS_ORIGIN_APP_LOCAL;

const CORS_PORT = isProduction
  ? process.env.CORS_PORT_APP_LIVE
  : process.env.CORS_PORT_APP_LOCAL

// Email configuration (same in all envs)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Authentication
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

// Password Hashing
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

// Rate Limiting
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);

// Cookie Configuration
const COOKIE_EXPIRE = parseInt(process.env.COOKIE_EXPIRE || "5", 10);

// Export configuration
module.exports = {
  NODE_STAGE,
  isProduction,
  isDevelopment,
  isTest,

  PORT,
  DB_URI,
  EMAIL_USER,
  EMAIL_PASS,

  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_ISSUER,
  JWT_AUDIENCE,

  BCRYPT_ROUNDS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,

  COOKIE_EXPIRE,
  CORS_ORIGIN,
  CORS_PORT
};
