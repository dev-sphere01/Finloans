import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { loginUser } from "@/services/authService";
import notification from "@/services/NotificationService"; // Changed import
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const notify = notification(); // Changed usage

    try {
      const response = await loginUser(username, password);
      
      if (response.success) {
        // Login successful, store user data
        login(response.data);
        
        // Check if user needs to change password (first time login with auto-generated password)
        if (response.data.isAutoGenPass) {
          notify.info("Welcome! Please change your temporary password to continue.");
          navigate("/welcome");
        } else {
          notify.success("Login successful! Welcome back.");
          navigate("/dashboard");
        }
      } else {
        // Login failed, show error from API response
        const errorMessage = response.message || "Login failed. Please check your credentials.";
        setError(errorMessage);
        notify.error(errorMessage);
      }
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Network error. Please check your connection and try again.";
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-serif-regular">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaSignInAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your office account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-shake">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Login Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(""); // Clear error when user starts typing
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(""); // Clear error when user starts typing
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
              <input type="checkbox" className="mr-2 h-4 w-4 text-slate-600 border-gray-300 rounded" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-slate-600 hover:text-slate-500 font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-700 hover:to-gray-700 disabled:from-slate-300 disabled:to-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt className="mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Google Auth */}
        {/* <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FcGoogle className="text-xl" />
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>
        </div> */}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-slate-600 hover:text-slate-500 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          © 2025 FinLoans. All rights reserved.
        </p>
      </div>
      </div>

    </div>
  );
};

export default Login;