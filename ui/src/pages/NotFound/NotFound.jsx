import {useState} from "react";

function NotFound() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-full bg-gradient-to-br from-white via-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 border-2 border-slate-200 rounded-full opacity-30"></div>
      <div className="absolute bottom-32 right-32 w-24 h-24 bg-slate-100 transform rotate-45 opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-slate-300 transform rotate-12 opacity-50"></div>
      <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full opacity-30"></div>

      <div className="text-center max-w-3xl mx-auto relative z-10">
        {/* 404 Number with modern styling */}
        <div className="mb-8 relative">
          <h1
            className="text-8xl md:text-9xl lg:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 mb-4 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            404
          </h1>
          {/* Shadow effect */}
          <div className="absolute top-2 left-2 text-8xl md:text-9xl lg:text-[10rem] font-black text-slate-200/30 -z-10 select-none">
            404
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-slate-500 to-slate-700 mx-auto rounded-full"></div>
        </div>

        {/* Main heading with modern typography */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 tracking-tight">
          <span className="relative">
            Page Not Found
            <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-slate-500 to-transparent"></div>
          </span>
        </h2>

        {/* Description with better styling */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Modern action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => window.history.back()}
            className="group relative px-8 py-4 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-500/25 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <i className="fas fa-arrow-left relative z-10"></i>
            <span className="relative z-10">Go Back</span>
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="group px-8 py-4 border-2 border-slate-600 text-slate-600 font-semibold rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-500/25 flex items-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            <i className="fas fa-home relative z-10"></i>
            <span className="relative z-10">Home Page</span>
          </button>
        </div>

        {/* Status indicator */}
        {/* <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Error 404</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span>Client Error</span>
        </div> */}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(34, 197, 94, 0.2); }
          50% { border-color: rgba(34, 197, 94, 0.4); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .absolute.w-32.h-32 {
          animation: float 6s ease-in-out infinite;
        }
        
        .absolute.w-24.h-24 {
          animation: float 8s ease-in-out infinite reverse;
        }
        
        .absolute.w-16.h-16 {
          animation: pulse-border 4s ease-in-out infinite;
        }
        
        .absolute.w-20.h-20 {
          animation: float 7s ease-in-out infinite;
        }
        
        h1 {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default NotFound;