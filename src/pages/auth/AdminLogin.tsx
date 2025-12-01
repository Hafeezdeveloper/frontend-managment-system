import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PostApi } from "@/Helper/ApiHandle/BsApiHandle";
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import Cookies from 'js-cookie';
const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      let response: any = await axios.post<any>(`${baseUrl}/v1/admin/login`, formData)
      if (response?.data?.token) {
        Cookies.set('authToken', response.data.token, {
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        localStorage.setItem('authToken', response.data.token);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-red-500 rounded-full animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 border border-red-500 rounded-full animate-pulse-slow"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-16 h-16 border border-red-500 rounded-full animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6 text-white hover:text-red-400 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-admin-gradient p-4 rounded-2xl shadow-admin">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display font-bold text-gray-900">
              Admin Access
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter your admin password to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Admin username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type={"text"}
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Admin paswword
                </Label>
                <div className="relative">

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    placeholder="Enter admin password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-admin-gradient hover:opacity-90 text-white shadow-admin"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-loading-spinner mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  "Access Admin Panel"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Demo Credentials:
              </p>
              <p className="text-sm text-gray-500">Password: admin123</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center text-white/70 text-sm">
            <Building2 className="w-4 h-4 mr-2" />
            AI Drivin Digital Integrated Society Management
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
