import { useNavigate } from "react-router-dom";
import { Briefcase, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmployeeAuth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-orange-500 rounded-full animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 border border-orange-500 rounded-full animate-pulse-slow"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-16 h-16 border border-orange-500 rounded-full animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6 text-orange-600 hover:text-orange-800 hover:bg-orange-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-employee-gradient p-4 rounded-2xl shadow-employee">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display font-bold text-gray-900">
              Employee Portal
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Staff management and task coordination system
            </p>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">
                Under Development
              </h3>
              <p className="text-orange-700 text-sm">
                Employee authentication and dashboard features are being
                developed. This will include task management, shift scheduling,
                and administrative communications.
              </p>
            </div>

            <Button
              onClick={() => navigate("/home")}
              className="w-full bg-employee-gradient hover:opacity-90 text-white shadow-employee"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center text-gray-500 text-sm">
            <Building2 className="w-4 h-4 mr-2" />
            AI Drivin Digital Integrated Society Management
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuth;
