const express = require('express');
const cors = require('cors');
const config = require('./config');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: "*",
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Add request logger in development mode
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}


// Route Imports

// const userRoutes = require('./routes/userRoutes'); // Import user routes
// const securityQuestionRoutes = require('./routes/securityQuestionRoute'); // Import security question routes
// const enquiryRoute = require('./routes/enquiryRoute')
// const studentDetailsRoute = require('./routes/studentDetailsRoutes')
// const feeDetails = require('./routes/feeRoute')

// Use the routes


const baseRouter = express.Router();


// baseRouter.use("/user", userRoutes); // Use user routes under the / path
// baseRouter.use("/createSecurityQuestion", securityQuestionRoutes); // Use security question routes under the //security-questions path
// baseRouter.use("/enquiry", enquiryRoute); // Use security question routes under the //security-questions path
// baseRouter.use("/studentDetails", studentDetailsRoute);
// baseRouter.use("/fee", feeDetails);


// Use baseRouter once under /api/v1
app.use('/api/v1', baseRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in development mode
  if (config.isDevelopment) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: config.isDevelopment ? err.stack : undefined
  });
});

// Export the app
module.exports = app;
