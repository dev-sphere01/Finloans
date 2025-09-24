const mongoose = require('mongoose');
const config = require('./index');

const connectDatabase = async () => {
    try {
        const connection = await mongoose.connect(config.DB_URI);

        console.log(`MongoDB connected: ${connection.connection.host}`);

        // Log database name in development mode
        if (config.isDevelopment) {
            console.log(`Database: ${connection.connection.name}`);
        }

        return connection;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1); // Exit with failure
    }
}


module.exports = connectDatabase;