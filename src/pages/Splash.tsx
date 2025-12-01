import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Home, Shield, Users } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-society-500 via-society-600 to-society-700 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 border border-white rounded-full animate-pulse-slow"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-16 h-16 border border-white rounded-full animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-40 w-20 h-20 border border-white rounded-full animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 animate-fade-in">
        {/* Logo Container */}
        <div className="relative mb-8 animate-bounce-in">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center mb-6">
            <Building2 className="w-16 h-16 text-white animate-float" />
          </div>

          {/* Decorative Icons */}
          <div
            className="absolute -top-4 -left-4 bg-white/10 rounded-full p-3 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <Home className="w-6 h-6 text-white" />
          </div>
          <div
            className="absolute -top-4 -right-4 bg-white/10 rounded-full p-3 animate-fade-in"
            style={{ animationDelay: "1s" }}
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 rounded-full p-3 animate-fade-in"
            style={{ animationDelay: "1.5s" }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Society Name */}
        <h1
          className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          AI Drivin Digital Integrated Society management System
        </h1>

        {/* Tagline */}
        <p
          className="text-xl md:text-2xl text-white/90 mb-8 font-light animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          Society Management System
        </p>

        {/* Loading Indicator */}
        {loading && (
          <div
            className="flex flex-col items-center space-y-4 animate-fade-in-up"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-white/80 text-sm font-medium">
              Loading your experience...
            </p>
          </div>
        )}
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default Splash;
