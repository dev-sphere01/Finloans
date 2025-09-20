// layouts/OuterLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import LoginImage from "@/assets/images/login-image.svg";

// component imports


const OuterLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 flex items-center justify-center px-2 lg:px-6 relative overflow-hidden">
      {/* Animated SVG Grid + Dots */}
      <div className="absolute inset-0 opacity-30 z-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="rgb(34, 197, 94)" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="floating-shape absolute top-20 left-10 w-20 h-20 bg-slate-200 rounded-full opacity-20"></div>
        <div className="floating-shape-reverse absolute top-40 right-20 w-16 h-16 bg-gray-300 rounded-lg opacity-15 rotate-45"></div>
        <div className="floating-shape absolute bottom-32 left-1/4 w-12 h-12 bg-slate-300 rounded-full opacity-25"></div>
        <div className="floating-shape-reverse absolute bottom-20 right-1/3 w-24 h-24 bg-gray-200 rounded-lg opacity-20"></div>
        <div className="floating-shape absolute top-1/3 right-10 w-8 h-8 bg-slate-400 rounded-full opacity-30"></div>
      </div>

      {/* Layout Container */}
      <div className="relative z-10 w-full max-w-[1600px] h-[100vh] overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-4 items-center ">
        {/* Image Section */}
        <div className="hidden lg:flex col-span-3 items-center justify-center p-4 pointer-events-none z-10">
          <div className="relative w-full h-full max-w-2xl max-h-[80vh] flex items-center justify-center">
            {/* SVG Image */}
            <img
              src={LoginImage}
              alt="Welcome illustration"
              className="w-full h-full object-contain max-w-full max-h-full pointer-events-none select-none"
              draggable="false"
            />
          </div>
        </div>


        {/* Auth Section */}
        <div className="w-full col-span-2 px-4 overflow-y-auto h-full">
          <div className="max-w-md mx-auto h-full flex items-center justify-center">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Floating Animation Styles */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(20px) rotate(50deg); }
        }
        .floating-shape {
          animation: float 6s ease-in-out infinite;
        }
        .floating-shape-reverse {
          animation: floatReverse 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OuterLayout;
