import { useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  FileText,
  Building,
  Tag,
  BookOpen,
  Calendar,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useServiceProvider } from "@/contexts/ServiceProviderContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";
import { baseUrl, capitalizeFirstLetter } from "@/Helper/constants";
import axios from "axios";

const ServiceProviderAuth = () => {
  const navigate = useNavigate();
  const { currentServiceProvider, setCurrentServiceProvider, } = useServiceProvider();
  const { authenticateServiceProvider, registerServiceProvider } =
    useAdminData();
  console.log("currentServiceProvidercurrentServiceProvider", currentServiceProvider)
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Registration form states
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Form, setStep1Form] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [step2Form, setStep2Form] = useState({
    idDocumentType: "CNIC" as "CNIC" | "Passport" | "Driver License",
    cnicNumber: "",
    passportNumber: "",
    driverLicenseNumber: "",
    serviceCategory: "",
    keywords: "",
    shortIntro: "",
  });

  const [step3Form, setStep3Form] = useState({
    experience: "",
    previousWork: "",
    certifications: "",
    availability: "",
    serviceArea: "",
    profilePhoto: null as File | null,
    profilePhotoPreview: "",
    additionalNotes: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      // 1. First authenticate with backend API
      const response = await axios.post(`${baseUrl}/auth/service-provider/login`, {
        email: loginData.email,
        password: loginData.password
      });
      if (response.data.user.status === "PENDING") {
        setIsLoading(false);
        toast.error(`Your account is not active or pending approval !`);
        return
      }
      console.log("Login response:", response.data);
      if (response?.data?.token && response?.data?.user) {
        // 2. Store the authentication token
        Cookies.set('authToken', response.data.token, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        console.log(response.data.user)
        // 3. Create service provider object from API response
        const authenticatedResident = authenticateServiceProvider(
          response?.data?.user?.username,
          loginData.password,
        );
        const serviceProvider = {
          ...response.data.user,
          // Map any fields that might be named differently
          username: response.data.user.username || loginData.email,
          email: response.data.user.email || loginData.email,
          status: response.data.user.status === "ACTIVE" ? "Active" : response.data.user.status
        };

        // 4. Set the service provider in context
        localStorage.setItem("currentServiceProvider", JSON.stringify(serviceProvider));
        setCurrentServiceProvider(serviceProvider);

        // 5. Navigate to dashboard
        toast.success(`Welcome back !`);
        navigate("/service-provider/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !step1Form.name.trim() ||
      !step1Form.username.trim() ||
      !step1Form.email.trim() ||
      !step1Form.phone.trim() ||
      !step1Form.password ||
      !step1Form.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (step1Form.password !== step1Form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (step1Form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(step1Form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !step2Form.serviceCategory ||
      !step2Form.keywords.trim() ||
      !step2Form.shortIntro.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // ID Document validation
    if (step2Form.idDocumentType === "CNIC" && !step2Form.cnicNumber.trim()) {
      setError("Please enter CNIC number");
      return;
    }
    if (
      step2Form.idDocumentType === "Passport" &&
      !step2Form.passportNumber.trim()
    ) {
      setError("Please enter Passport number");
      return;
    }
    if (
      step2Form.idDocumentType === "Driver License" &&
      !step2Form.driverLicenseNumber.trim()
    ) {
      setError("Please enter Driver License number");
      return;
    }

    setCurrentStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
     
      // Validate required fields in step 3
      if (
        !step3Form.experience.trim() ||
        !step3Form.availability.trim() ||
        !step3Form.serviceArea.trim()
      ) {
        setError("Please fill in all required fields in Professional Information");
        setIsLoading(false);
        return;
      }

      // Create the registration payload
      const registrationData = {
        // Step 1 data
        name: step1Form.name.trim(),
        username: step1Form.username.trim(),
        email: step1Form.email.trim(),
        phone: step1Form.phone.trim(),
        password: step1Form.password,

        // Step 2 data - ID document
        idDocumentType: step2Form.idDocumentType === "Driver License"
          ? "DRIVER_LICENSE"
          : step2Form.idDocumentType.toUpperCase(),
        ...(step2Form.idDocumentType === "CNIC" && {
          cnicNumber: step2Form.cnicNumber.trim()
        }),
        ...(step2Form.idDocumentType === "Passport" && {
          passportNumber: step2Form.passportNumber.trim()
        }),
        ...(step2Form.idDocumentType === "Driver License" && {
          driverLicenseNumber: step2Form.driverLicenseNumber.trim()
        }),

        // Step 2 data - Service information
        serviceCategory: step2Form.serviceCategory,
        keywords: step2Form.keywords.trim(),
        shortIntro: step2Form.shortIntro.trim(),

        // Step 3 data - Professional information
        experience: step3Form.experience.trim(),
        availability: step3Form.availability.trim(),
        serviceArea: step3Form.serviceArea.trim(),
        previousWork: step3Form.previousWork.trim(),
        certifications: step3Form.certifications.trim(),
        additionalNotes: step3Form.additionalNotes.trim(),

        // Note: profilePhoto cannot be included in JSON payload
        // You would need FormData for file uploads
      };

      // Make the request with JSON payload
      const response = await axios.post(
        `${baseUrl}/auth/service-provider/register`,
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("adawd", response)
      if (response.data.message == "Registration successful"
      ) {
        // Reset forms and switch to login tab
        setActiveTab("login");
        setCurrentStep(1);
        setStep1Form({
          name: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setStep2Form({
          idDocumentType: "CNIC",
          cnicNumber: "",
          passportNumber: "",
          driverLicenseNumber: "",
          serviceCategory: "",
          keywords: "",
          shortIntro: "",
        });
        setStep3Form({
          experience: "",
          previousWork: "",
          certifications: "",
          availability: "",
          serviceArea: "",
          profilePhoto: null,
          profilePhotoPreview: "",
          additionalNotes: "",
        });
      }
    } catch (error: any) {
      // setError(
      //   JSON.parse(error?.response?.data?.message) ??
      //   "Registration failed. Please try again."
      // );
      toast.error(error?.response?.data?.message ?? "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setStep3Form({
          ...step3Form,
          profilePhoto: file,
          profilePhotoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const serviceCategories = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Carpentry",
    "Painting",
    "AC/HVAC",
    "Appliance Repair",
    "Pest Control",
    "Gardening",
    "Security",
    "Moving/Shifting",
    "Interior Design",
    "Other",
  ];

  // Error boundary wrapper for step 3
  const renderStep3 = () => {
    try {
      return (
        <form onSubmit={handleStep3Submit} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            <p className="text-sm text-gray-600">
              Complete your professional profile
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">
                Experience <span className="text-red-500">*</span>
              </Label>
              <Input
                id="experience"
                value={step3Form.experience}
                onChange={(e) =>
                  setStep3Form({
                    ...step3Form,
                    experience: e.target.value,
                  })
                }
                placeholder="e.g., 5+ years"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">
                Availability <span className="text-red-500">*</span>
              </Label>
              <Input
                id="availability"
                value={step3Form.availability}
                onChange={(e) =>
                  setStep3Form({
                    ...step3Form,
                    availability: e.target.value,
                  })
                }
                placeholder="e.g., Mon-Fri 9AM-6PM"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-area">
              Service Area <span className="text-red-500">*</span>
            </Label>
            <Input
              id="service-area"
              value={step3Form.serviceArea}
              onChange={(e) =>
                setStep3Form({
                  ...step3Form,
                  serviceArea: e.target.value,
                })
              }
              placeholder="e.g., All blocks, Nearby areas within 10km"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previous-work">Previous Work</Label>
            <Textarea
              id="previous-work"
              value={step3Form.previousWork}
              onChange={(e) =>
                setStep3Form({
                  ...step3Form,
                  previousWork: e.target.value,
                })
              }
              placeholder="Previous employers or notable projects"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={step3Form.certifications}
              onChange={(e) =>
                setStep3Form({
                  ...step3Form,
                  certifications: e.target.value,
                })
              }
              placeholder="Professional certifications or licenses"
              rows={2}
              disabled={isLoading}
            />
          </div>

          

          <div className="space-y-2">
            <Label htmlFor="additional-notes">Additional Notes</Label>
            <Textarea
              id="additional-notes"
              value={step3Form.additionalNotes}
              onChange={(e) =>
                setStep3Form({
                  ...step3Form,
                  additionalNotes: e.target.value,
                })
              }
              placeholder="Any additional information you'd like to share"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentStep(2)}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      );
    } catch (error) {
      console.error("Step 3 render error:", error);
      return (
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-500 mb-4">
            There was an error loading this step. Please try again.
          </p>
          <Button
            onClick={() => {
              setCurrentStep(2);
              setError("");
            }}
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/home")}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center">
                <div className="bg-green-600 p-2 rounded-lg mr-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Service Provider Portal
                  </h1>
                  <p className="text-sm text-gray-500">
                    Join our platform and grow your business
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Service Provider Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Username</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter your username"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter your password"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="text-center text-sm text-gray-600">
                    <p>
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-green-600"
                        onClick={() => setActiveTab("register")}
                      >
                        Register here
                      </Button>
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  {/* Registration Steps */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep
                              ? "bg-green-600 text-white"
                              : step < currentStep
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                              }`}
                          >
                            {step < currentStep ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              step
                            )}
                          </div>
                          {step < 3 && (
                            <div
                              className={`w-8 h-1 ${step < currentStep
                                ? "bg-green-600"
                                : "bg-gray-200"
                                }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Basic Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tell us about yourself
                        </p>
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-name">
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reg-name"
                            value={step1Form.name}
                            onChange={(e) =>
                              setStep1Form({
                                ...step1Form,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-username">
                            Username <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reg-username"
                            value={step1Form.username}
                            onChange={(e) =>
                              setStep1Form({
                                ...step1Form,
                                username: e.target.value,
                              })
                            }
                            placeholder="Choose a username"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reg-email"
                            type="email"
                            value={step1Form.email}
                            onChange={(e) =>
                              setStep1Form({
                                ...step1Form,
                                email: e.target.value,
                              })
                            }
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-phone">
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reg-phone"
                            value={step1Form.phone}
                            onChange={(e) =>
                              setStep1Form({
                                ...step1Form,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">
                            Password <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reg-password"
                            type="password"
                            value={step1Form.password}
                            onChange={(e) =>
                              setStep1Form({
                                ...step1Form,
                                password: e.target.value,
                              })
                            }
                            placeholder="Min 6 characters"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-confirm-password">
                            Confirm Password{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reg-confirm-password"
                            type="password"
                            value={step1Form.confirmPassword}
                            onChange={(e) =>
                              setStep1Form({
                                ...step1Form,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="Confirm your password"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Next: KYC & Service Information
                      </Button>
                    </form>
                  )}

                  {/* Step 2: KYC & Service Information */}
                  {currentStep === 2 && (
                    <form onSubmit={handleStep2Submit} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold">
                          KYC & Service Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Verify your identity and describe your services
                        </p>
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label>ID Document Type</Label>
                        <Select
                          value={step2Form.idDocumentType}
                          onValueChange={(value: any) =>
                            setStep2Form({
                              ...step2Form,
                              idDocumentType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CNIC">CNIC</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="Driver License">
                              Driver License
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {step2Form.idDocumentType === "CNIC" && (
                        <div className="space-y-2">
                          <Label htmlFor="cnic">
                            CNIC Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cnic"
                            value={step2Form.cnicNumber}
                            onChange={(e) =>
                              setStep2Form({
                                ...step2Form,
                                cnicNumber: e.target.value,
                              })
                            }
                            placeholder="12345-6789012-3"
                          />
                        </div>
                      )}

                      {step2Form.idDocumentType === "Passport" && (
                        <div className="space-y-2">
                          <Label htmlFor="passport">
                            Passport Number{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="passport"
                            value={step2Form.passportNumber}
                            onChange={(e) =>
                              setStep2Form({
                                ...step2Form,
                                passportNumber: e.target.value,
                              })
                            }
                            placeholder="A1234567"
                          />
                        </div>
                      )}

                      {step2Form.idDocumentType === "Driver License" && (
                        <div className="space-y-2">
                          <Label htmlFor="license">
                            Driver License Number{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="license"
                            value={step2Form.driverLicenseNumber}
                            onChange={(e) =>
                              setStep2Form({
                                ...step2Form,
                                driverLicenseNumber: e.target.value,
                              })
                            }
                            placeholder="DL1234567890"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="service-category">
                          Service Category{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={step2Form.serviceCategory}
                          onValueChange={(value) =>
                            setStep2Form({
                              ...step2Form,
                              serviceCategory: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your service category" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keywords">
                          Keywords <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="keywords"
                          value={step2Form.keywords}
                          onChange={(e) =>
                            setStep2Form({
                              ...step2Form,
                              keywords: e.target.value,
                            })
                          }
                          placeholder="e.g., plumbing, repairs, installation, bathroom"
                        />
                        <p className="text-xs text-gray-500">
                          Comma-separated keywords to help customers find you
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="short-intro">
                          Short Introduction{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="short-intro"
                          value={step2Form.shortIntro}
                          onChange={(e) =>
                            setStep2Form({
                              ...step2Form,
                              shortIntro: e.target.value,
                            })
                          }
                          placeholder="Brief description of your services and expertise"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Next: Professional Information
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Professional Information */}
                  {currentStep === 3 && renderStep3()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ServiceProviderAuth;
