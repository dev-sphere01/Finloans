import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/services/authService";
import notification from "@/services/NotificationService";
import { FaEnvelope, FaPaperPlane, FaUnlockAlt, FaCheck, FaTimes } from "react-icons/fa";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const notify = notification();

    try {
      const response = await forgotPassword(username);
      
      if (response.success) {
        const successMsg = "Password reset email sent successfully! Please check your email.";
        setMessage(successMsg);
        notify.success(successMsg);
      }
    } catch (error) {
      console.error("Forgot password failed:", error);
      const errorMsg = error.message || "Failed to send reset email. Please try again.";
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaUnlockAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600">
            Enter your username to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaTimes className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 disabled:from-slate-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-500 font-medium"
            >
              Go to Login
            </Link>
          </p>
        </div>
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 CUPL. All rights reserved.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;
