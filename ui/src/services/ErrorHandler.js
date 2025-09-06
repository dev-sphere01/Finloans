/**
 * @fileOverview This service provides centralized error handling for the application.
 * It offers a consistent way to handle errors, reducing the need for repetitive try-catch blocks.
 *
 * @uses handle - Handles async operations with automatic try-catch.
 * @uses handleSync - Handles sync operations with automatic try-catch.
 * @uses handleWithRetry - Handles API calls with built-in retry logic.
 * @uses handleMultiple - Wraps multiple async operations and handles them collectively.
 * @uses handleWithTimeout - Handles operations with timeout.
 * @uses parseJSON - Safe JSON parsing with error handling.
 * @uses getFromStorage - Safe localStorage operations.
 * @uses setToStorage - Safe localStorage set operation.
 */
// Error Handler Service
// This service provides centralized error handling to avoid repetitive try-catch blocks
// Usage: const result = await ErrorHandler.handle(asyncFunction, fallbackValue, customErrorHandler)

class ErrorHandler {
    /**
     * Handle async operations with automatic try-catch
     * @param {Function} asyncFunction - The async function to execute
     * @param {any} fallbackValue - Default value to return on error (optional)
     * @param {Function} onError - Custom error handler function (optional)
     * @returns {Promise<any>} Result of the function or fallback value
     */
    static async handle(asyncFunction, fallbackValue = null, onError = null) {
        try {
            const result = await asyncFunction();
            return result;
        } catch (error) {
            // Use custom error handler if provided
            if (onError && typeof onError === 'function') {
                onError(error);
            } else {
                // Default error handling
                this.logError(error);
            }

            return fallbackValue;
        }
    }

    /**
     * Handle sync operations with automatic try-catch
     * @param {Function} syncFunction - The sync function to execute
     * @param {any} fallbackValue - Default value to return on error (optional)
     * @param {Function} onError - Custom error handler function (optional)
     * @returns {any} Result of the function or fallback value
     */
    static handleSync(syncFunction, fallbackValue = null, onError = null) {
        try {
            const result = syncFunction();
            return result;
        } catch (error) {
            // Use custom error handler if provided
            if (onError && typeof onError === 'function') {
                onError(error);
            } else {
                // Default error handling
                this.logError(error);
            }

            return fallbackValue;
        }
    }

    /**
     * Handle API calls with built-in retry logic
     * @param {Function} apiCall - The API function to execute
     * @param {number} retries - Number of retry attempts (default: 3)
     * @param {number} delay - Delay between retries in ms (default: 1000)
     * @param {any} fallbackValue - Default value to return on final failure
     * @returns {Promise<any>} API response or fallback value
     */
    static async handleWithRetry(apiCall, retries = 3, delay = 1000, fallbackValue = null) {
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const result = await apiCall();
                return result;
            } catch (error) {
                lastError = error;

                // Don't retry on client errors (4xx)
                if (error.response && error.response.status >= 400 && error.response.status < 500) {
                    this.logError(error, `API call failed with client error (${error.response.status})`);
                    return fallbackValue;
                }

                if (attempt < retries) {
                    console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error.message);
                    await this.delay(delay);
                    delay *= 1.5; // Exponential backoff
                }
            }
        }

        this.logError(lastError, `API call failed after ${retries} attempts`);
        return fallbackValue;
    }

    /**
     * Wrap multiple async operations and handle them collectively
     * @param {Array<Function>} operations - Array of async functions
     * @param {boolean} stopOnError - Whether to stop execution on first error (default: false)
     * @returns {Promise<Array>} Array of results (successful results and null for errors)
     */
    static async handleMultiple(operations, stopOnError = false) {
        const results = [];

        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];

            try {
                const result = await operation();
                results.push(result);
            } catch (error) {
                this.logError(error, `Operation ${i + 1} failed`);
                results.push(null);

                if (stopOnError) {
                    break;
                }
            }
        }

        return results;
    }

    /**
     * Handle operations with timeout
     * @param {Function} asyncFunction - The async function to execute
     * @param {number} timeout - Timeout in milliseconds
     * @param {any} fallbackValue - Default value to return on timeout/error
     * @returns {Promise<any>} Result or fallback value
     */
    static async handleWithTimeout(asyncFunction, timeout = 5000, fallbackValue = null) {
        try {
            const result = await Promise.race([
                asyncFunction(),
                this.timeoutPromise(timeout)
            ]);
            return result;
        } catch (error) {
            if (error.message === 'Operation timed out') {
                console.error(`Operation timed out after ${timeout}ms`);
            } else {
                this.logError(error);
            }
            return fallbackValue;
        }
    }

    /**
     * Safe JSON parsing with error handling
     * @param {string} jsonString - JSON string to parse
     * @param {any} fallbackValue - Default value to return on parse error
     * @returns {any} Parsed object or fallback value
     */
    static parseJSON(jsonString, fallbackValue = {}) {
        return this.handleSync(
            () => JSON.parse(jsonString),
            fallbackValue,
            (error) => console.error('JSON parsing failed:', error.message)
        );
    }

    /**
     * Safe localStorage operations
     * @param {string} key - localStorage key
     * @param {any} defaultValue - Default value if key doesn't exist or error occurs
     * @returns {any} Value from localStorage or default value
     */
    static getFromStorage(key, defaultValue = null) {
        return this.handleSync(
            () => {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            },
            defaultValue,
            (error) => console.error(`Failed to get ${key} from localStorage:`, error.message)
        );
    }

    /**
     * Safe localStorage set operation
     * @param {string} key - localStorage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    static setToStorage(key, value) {
        return this.handleSync(
            () => {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            },
            false,
            (error) => console.error(`Failed to set ${key} to localStorage:`, error.message)
        );
    }

    // Private helper methods
    static logError(error, customMessage = null) {
        const message = customMessage || 'An error occurred';

        if (process.env.NODE_ENV === 'development') {
            console.group(`🚨 ${message}`);
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            console.groupEnd();
        } else {
            // In production, log to external service
            console.error(message, error.message);
            // You can integrate with error tracking services like Sentry here
            // Sentry.captureException(error);
        }
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static timeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), timeout);
        });
    }
}

export default ErrorHandler;


// -----------------------------Example Usage (with API service)--------------------------------------

/* 
import ErrorHandler from '@/services/ErrorHandler';
import API from '@/services/API';

// 1. Simple async operation
const fetchUsers = async () => {
  const users = await ErrorHandler.handle(
    () => API.get('/users'), 
    [] // fallback to empty array on error
  );
  return users;
};

// 2. With custom error handling
const createUser = async (userData) => {
  const result = await ErrorHandler.handle(
    () => API.post('/users', userData),
    null,
    (error) => {
      // Custom error handling
      notify.error('Failed to create user: ' + error.message);
    }
  );
  return result;
};

// 3. API calls with automatic retry
const fetchWithRetry = async () => {
  const data = await ErrorHandler.handleWithRetry(
    () => API.get('/important-data'),
    3, // retry 3 times
    1000, // 1 second delay
    { message: 'Failed to load' } // fallback value
  );
  return data;
};

// 4. Multiple operations
const loadDashboard = async () => {
  const [users, posts, comments] = await ErrorHandler.handleMultiple([
    () => API.get('/users'),
    () => API.get('/posts'), 
    () => API.get('/comments')
  ]);
  
  return { users, posts, comments }; // nulls for failed requests
};

// 5. Operations with timeout
const quickFetch = async () => {
  const data = await ErrorHandler.handleWithTimeout(
    () => API.get('/slow-endpoint'),
    3000, // 3 second timeout
    { error: 'Request timed out' }
  );
  return data;
};
*/