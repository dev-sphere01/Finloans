const app = require("./app");
const config = require("./config");
const connectDatabase = require("./config/database");
const dotenv = require('dotenv');


// Display environment information
console.log(`Environment: ${config.NODE_ENV}`);

const startServer = async () => {
    // Connecting to database
    await connectDatabase();

    // Start the server
    const server = app.listen(config.PORT, () => {
        console.log(`Server is running on http://localhost:${config.PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.log(`Error: ${err.message}`);
        console.log('Shutting down the server due to Unhandled Promise Rejection');

        server.close(() => {
            process.exit(1);
        });
    });
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Uncaught Exception');
    process.exit(1);
});

startServer();