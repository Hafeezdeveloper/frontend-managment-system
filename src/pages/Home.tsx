import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Home as HomeIcon,
  Wrench,
  Briefcase,
  ArrowRight,
  Building2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UserTypeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  shadow: string;
  route: string;
  isPasswordProtected?: boolean;
}

const userTypes: UserTypeOption[] = [
  {
    id: "admin",
    title: "Admin",
    description: "System administration and oversight",
    icon: Shield,
    gradient: "bg-admin-gradient",
    shadow: "shadow-admin",
    route: "/admin/login",
    isPasswordProtected: true,
  },
  {
    id: "resident",
    title: "Resident",
    description: "Property owners and tenants",
    icon: HomeIcon,
    gradient: "bg-resident-gradient",
    shadow: "shadow-resident",
    route: "/resident/auth",
  },
  {
    id: "service-provider",
    title: "Service Provider",
    description: "Maintenance and service professionals",
    icon: Wrench,
    gradient: "bg-service-gradient",
    shadow: "shadow-service",
    route: "/service-provider/auth",
  },
  {
    id: "employee",
    title: "Employee",
    description: "Society staff and workers",
    icon: Briefcase,
    gradient: "bg-employee-gradient",
    shadow: "shadow-employee",
    route: "/employee/auth",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = (userType: UserTypeOption) => {
    navigate(userType.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-society-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-success-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-society-300 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-society-gradient p-4 rounded-2xl shadow-society">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
              Welcome to AI Drivin Digital Integrated Society management System
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Advanced Digital Society Management
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-6xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Are you a...
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your role to access your personalized dashboard and
              features designed specifically for your needs.
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userTypes.map((userType, index) => {
              const Icon = userType.icon;
              const isHovered = hoveredCard === userType.id;

              return (
                <Card
                  key={userType.id}
                  className={`group relative overflow-hidden border-0 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                    userType.shadow
                  } ${
                    isHovered ? "shadow-2xl" : "shadow-lg"
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setHoveredCard(userType.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleCardClick(userType)}
                >
                  <CardContent className="p-0 relative h-80">
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 ${userType.gradient} opacity-90`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                      {/* Icon and Title */}
                      <div className="text-center">
                        <div className="mb-6 relative">
                          <div
                            className={`bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-auto w-20 h-20 flex items-center justify-center transition-transform duration-300 ${
                              isHovered ? "scale-110" : ""
                            }`}
                          >
                            <Icon className="w-10 h-10" />
                          </div>
                          {userType.isPasswordProtected && (
                            <div className="absolute -top-2 -right-2 bg-white/30 rounded-full p-1.5">
                              <Lock className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-2xl font-display font-bold mb-3">
                          {userType.title}
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {userType.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className={`bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 ${
                            isHovered
                              ? "transform translate-y-0 opacity-100"
                              : "transform translate-y-2 opacity-80"
                          }`}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div
                      className={`absolute inset-0 bg-white/10 backdrop-blur-sm transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    ></div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-12 h-12 border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-full"></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Secure • Reliable • User-Friendly Society Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
