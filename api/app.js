const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");


// Import config
const config = require("./config");

const app = express();


// Your routes...

app.get("/api/test", (req, res) => {
res.json({
message: "Test endpoint",
baseUrl: config.BASE_URL,
nodeStage: config.NODE_STAGE,
corsOrigin: config.CORS_ORIGIN,
corsPort: config.CORS_PORT,
timestamp: new Date().toISOString(),
origin: req.headers.origin || 'No origin header'
});
});

// CORS test endpoint
app.options("/api/cors-test", (req, res) => {
res.status(200).end();
});

app.get("/api/cors-test", (req, res) => {
res.json({
message: "CORS test successful",
origin: req.headers.origin || 'No origin header',
timestamp: new Date().toISOString()
});
});


// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const creditCardRoutes = require("./routes/creditCardRoutes");
const insuranceRoutes = require("./routes/insuranceRoutes");
const loanRoutes = require("./routes/loanRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const callingRoutes = require("./routes/callingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Rate limiting (use config)
const limiter = rateLimit({
windowMs: config.RATE_LIMIT_WINDOW_MS,
max: config.RATE_LIMIT_MAX_REQUESTS,
message: "Too many requests from this IP, please try again later.",
standardHeaders: true,
legacyHeaders: false,
});

// Middleware
app.use(limiter);

// Debug middleware to log all requests
app.use((req, res, next) => {
console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
next();
});

app.use(
cors({
origin: function (origin, callback) {
// Allow requests with no origin (like mobile apps or curl requests)
if (!origin) return callback(null, true);

const allowedOrigins = [
config.CORS_ORIGIN,
config.CORS_PORT,
'https://app.finloansfinancialservices.com',
'https://finloansfinancialservices.com',
'http://localhost:5173', // Vite default
'http://localhost:5174', // Alternative Vite port
'http://localhost:3000', // React default
'http://localhost:3001' // Alternative React port
].filter(Boolean); // Remove any undefined values

console.log('CORS check - Origin:', origin, 'Allowed origins:', allowedOrigins);

if (allowedOrigins.indexOf(origin) !== -1) {
callback(null, true);
} else {
console.log('CORS blocked origin:', origin);
// For now, allow all origins to debug the issue
callback(null, true);
}
},
credentials: true,
methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
allowedHeaders: [
"Content-Type",
"Authorization",
"X-Requested-With",
"Accept",
"Origin",
"X-CSRF-Token"
],
exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
optionsSuccessStatus: 200,
preflightContinue: false
})
);

app.use(bodyParser.json({ limit: "1024mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/credit-cards", creditCardRoutes);
app.use("/api/insurances", insuranceRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/calling", callingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/api/health", (req, res) => {
res.status(200).json({
status: "OK",
timestamp: new Date().toISOString(),
environment: config.NODE_STAGE,
});
});

// Error handling middleware
app.use((err, req, res, next) => {
console.error("Error:", err);

if (err.name === "ValidationError") {
return res.status(400).json({
error: "Validation Error",
details: Object.values(err.errors).map((e) => e.message),
});
}

if (err.name === "JsonWebTokenError") {
return res.status(401).json({ error: "Invalid token" });
}

if (err.name === "TokenExpiredError") {
return res.status(401).json({ error: "Token expired" });
}

res.status(err.status || 500).json({
error: err.message || "Internal server error",
});
});

// 404 handler
app.use((req, res) => {
res.status(404).json({ error: "Route not found" });
});

module.exports = app;