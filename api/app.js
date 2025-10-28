const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// const autoSwagger = require("express-auto-swagger");


// Import config
const config = require("./config");

const app = express();

// autoSwagger(app);

// Your routes...

app.get("/api/test", (req, res) => {
    res.json({ 
        message: "Test endpoint",
        baseUrl: config.BASE_URL,
        nodeStage: config.NODE_STAGE
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

// Log CORS configuration for debugging
console.log('CORS Origins:', [config.CORS_ORIGIN, config.CORS_PORT]);

app.use(
  cors({

    origin: [config.CORS_ORIGIN, config.CORS_PORT],

    // origin: function (origin, callback) {
    //   // Allow requests with no origin (like mobile apps or curl requests)
    //   if (!origin) return callback(null, true);
      
    //   const allowedOrigins = [
    //     config.CORS_ORIGIN, 
    //     config.CORS_PORT,
    //     'http://localhost:5173', // Vite default
    //     'http://localhost:5174', // Alternative Vite port
    //     'http://localhost:3000', // React default
    //     'http://localhost:3001'  // Alternative React port
    //   ].filter(Boolean); // Remove any undefined values
      
    //   if (allowedOrigins.indexOf(origin) !== -1) {
    //     callback(null, true);
    //   } else {
    //     console.log('CORS blocked origin:', origin);
    //     callback(new Error('Not allowed by CORS'));
    //   }
    // },

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
    preflightContinue: false
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
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
