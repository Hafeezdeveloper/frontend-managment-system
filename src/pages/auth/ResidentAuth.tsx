import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import {
  Home as HomeIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  Upload,
  CreditCard,
  FileText,
  Briefcase,
  DollarSign,
  UserCheck,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useResident } from "@/contexts/ResidentContext";
import { toast } from "sonner";
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import { Toast } from "@radix-ui/react-toast";
import { Toaster } from "@/components/ui/toaster";

const ResidentAuth = () => {
  const navigate = useNavigate();
  const { authenticateResident, registerResident } = useAdminData();
  const { setCurrentResident } = useResident();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [currentStep, setCurrentStep] = useState(1);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    // Basic Information
    name: "",
    username: "",
    email: "",
    phone: "",
    apartment: "",
    familyMembers: 1,
    password: "",
    confirmPassword: "",

    // KYC Information
    idDocumentType: "CNIC" as "CNIC" | "PASSPORT" | "DRIVER_LICENSE",

    cnicNumber: "",
    passportNumber: "",
    driverLicenseNumber: "",
    ownershipType: "OWNER" as "OWNER" | "TENANT",
    emergencyContact: "",
    emergencyContactPhone: "",
    occupation: "",
    workAddress: "",
    profilePhoto: "",
    monthlyIncome: "",
    previousAddress: "",
    reference1Name: "",
    reference1Phone: "",
    reference2Name: "",
    reference2Phone: "",
    additionalNotes: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSignupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]:
        name === "familyMembers"
          ? parseInt(value) || 1
          : name === "monthlyIncome"
            ? value
            : value,
    }));
    if (error) setError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Photo size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupData((prev) => ({
          ...prev,
          profilePhoto: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("AsetLoginData", loginData)
    try {

      if (!loginData.email || !loginData.password) {
        setError("Please enter both username and password.");
        setIsLoading(false);
        return;
      }
      let response: any = await axios.post<any>(`${baseUrl}/v1/admin/resident/login`, loginData)

      if (response?.data?.token) {
        // Always allow login regardless of previous sessions
        const authenticatedResident = authenticateResident(
          response?.data?.user?.username,
          loginData.password,
        );
        const authenticatedResidentDetails = {
          ...response.data.user,
          // Map any fields that might be named differently
          username: response.data.user.username || loginData.email,
          email: response.data.user.email || loginData.email,
          status: response.data.user.status === "ACTIVE" ? "Active" : response.data.user.status
        };
        localStorage.setItem("currentResident", JSON.stringify(authenticatedResidentDetails));
        localStorage.setItem("authToken", response?.data?.token);
        setCurrentResident(authenticatedResidentDetails);
        toast.success(`Welcome back !`);

        navigate("/resident/dashboard");

        // Reset login form
      }
      console.log("ok g")
    } catch (err) {
      console.log(err)
      if (err) {

        toast.error(err?.response?.data?.message || "error in email and pass");
      }

    } finally {
      setIsLoading(false);
    }
  };

  const validateStep1 = () => {
    if (
      !signupData.name ||
      !signupData.username ||
      !signupData.email ||
      !signupData.phone ||
      !signupData.apartment ||
      !signupData.password ||
      !signupData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return false;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (signupData.phone.length < 10) {
      setError("Phone number must be at least 10 digits.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const idFieldMap: Record<string, string> = {
      CNIC: "cnicNumber",
      PASSPORT: "passportNumber",
      DRIVER_LICENSE: "driverLicenseNumber",
    };

    const requiredIdField = idFieldMap[signupData.idDocumentType];
    if (!requiredIdField) {
      setError("Please select an ID document type.");
      return false;
    }

    const idValue = signupData[requiredIdField as keyof typeof signupData];

    if (!idValue) {
      const documentTypeName = signupData.idDocumentType === "CNIC" ? "CNIC" 
        : signupData.idDocumentType === "PASSPORT" ? "Passport" 
        : "Driver License";
      setError(`Please enter your ${documentTypeName} number.`);
      return false;
    }

    if (!signupData.emergencyContact || !signupData.emergencyContactPhone) {
      setError("Please provide emergency contact information.");
      return false;
    }

    if (!signupData.occupation) {
      setError("Please enter your occupation.");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Validate and move to step 2
      if (currentStep === 1) {
        if (!validateStep1()) {
          setIsLoading(false);
          return;
        }
        setCurrentStep(2);
        setIsLoading(false);
        return;
      }

      // Step 2: Validate and move to step 3
      if (currentStep === 2) {
        if (!validateStep2()) {
          setIsLoading(false);
          return;
        }
        setCurrentStep(3);
        setIsLoading(false);
        return;
      }

      // Step 3: Validate all steps and submit registration
      if (currentStep === 3) {
        // Validate all steps before submitting
        if (!validateStep1() || !validateStep2()) {
          setIsLoading(false);
          return;
        }

        // Prepare registration payload
        // Backend expects: email, apartment, username, password (required)
        // Other fields are optional
        const payload = {
        name: signupData.name,
        username: signupData.username,
        email: signupData.email,
        phone: signupData.phone,
        apartment: signupData.apartment,
        password: signupData.password,
        // Optional fields
        ...(signupData.familyMembers && { familyMembers: signupData.familyMembers }),
        ...(signupData.idDocumentType && { 
          idDocumentType: signupData.idDocumentType.toUpperCase() 
        }),
        ...(signupData.cnicNumber && { cnicNumber: signupData.cnicNumber }),
        ...(signupData.passportNumber && { passportNumber: signupData.passportNumber }),
        ...(signupData.driverLicenseNumber && { driverLicenseNumber: signupData.driverLicenseNumber }),
        ...(signupData.ownershipType && { ownershipType: signupData.ownershipType }),
        ...(signupData.emergencyContact && { emergencyContact: signupData.emergencyContact }),
        ...(signupData.emergencyContactPhone && { emergencyContactPhone: signupData.emergencyContactPhone }),
        ...(signupData.occupation && { occupation: signupData.occupation }),
        ...(signupData.workAddress && { workAddress: signupData.workAddress }),
        ...(signupData.profilePhoto && { profilePhoto: signupData.profilePhoto }),
        ...(signupData.monthlyIncome && { monthlyIncome: signupData.monthlyIncome }),
        ...(signupData.previousAddress && { previousAddress: signupData.previousAddress }),
        ...(signupData.reference1Name && { reference1Name: signupData.reference1Name }),
        ...(signupData.reference1Phone && { reference1Phone: signupData.reference1Phone }),
        ...(signupData.reference2Name && { reference2Name: signupData.reference2Name }),
        ...(signupData.reference2Phone && { reference2Phone: signupData.reference2Phone }),
        ...(signupData.additionalNotes && { additionalNotes: signupData.additionalNotes }),
        };

        console.log("Registration payload:", payload);

        // Backend API: POST /resident/auth/resident/register
        const response = await axios.post(
          `${baseUrl}/v1/admin/resident/register`, 
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("Registration response:", response.data);

        // Backend returns successHandler format:
        // {
        //   "success": true,
        //   "message": "Registration successful",
        //   "data": {
        //     "resident": { _id, name, email, apartment, status, approvalStatus }
        //   },
        //   "status": 201
        // }

        if (response?.data?.data?.resident || response?.status === 201) {
          setSuccess(response.data.message || "Registration successful! Your application is pending approval.");
          toast.success(response.data.message || "Registration successful!");
          
          // Reset form
          setSignupData({
            name: "",
            username: "",
            email: "",
            phone: "",
            apartment: "",
            familyMembers: 1,
            password: "",
            confirmPassword: "",
            idDocumentType: "CNIC",
            cnicNumber: "",
            passportNumber: "",
            driverLicenseNumber: "",
            ownershipType: "OWNER",
            emergencyContact: "",
            emergencyContactPhone: "",
            occupation: "",
            workAddress: "",
            profilePhoto: "",
            monthlyIncome: "",
            previousAddress: "",
            reference1Name: "",
            reference1Phone: "",
            reference2Name: "",
            reference2Phone: "",
            additionalNotes: "",
          });
          setCurrentStep(1);
          setActiveTab("login");
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Backend error responses:
      // 400: "Email is already registered" / "Apartment is already registered" / "Username is already taken"
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="name"
              name="name"
              type="text"
              value={signupData.name}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="Your full name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-username"
            className="text-gray-700 font-medium"
          >
            Username *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="signup-username"
              name="username"
              type="text"
              value={signupData.username}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="Choose username"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Email *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            value={signupData.email}
            onChange={handleSignupChange}
            className="pl-10"
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            Phone *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={signupData.phone}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="+1 234-567-8901"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apartment" className="text-gray-700 font-medium">
            Apartment *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="apartment"
              name="apartment"
              type="text"
              value={signupData.apartment}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="A-101"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="familyMembers" className="text-gray-700 font-medium">
          Family Members *
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="familyMembers"
            name="familyMembers"
            type="number"
            min="1"
            max="10"
            value={signupData.familyMembers}
            onChange={handleSignupChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
            className="text-gray-700 font-medium"
          >
            Password *
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={signupData.password}
              onChange={handleSignupChange}
              className="pr-10"
              placeholder="Create password"
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

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-gray-700 font-medium"
          >
            Confirm Password *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              className="pr-10"
              placeholder="Confirm password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">
            ID Document Type *
          </Label>
          <Select
            value={signupData.idDocumentType}
            onValueChange={(value) =>
              handleSelectChange("idDocumentType", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CNIC">CNIC</SelectItem>
              <SelectItem value="PASSPORT">Passport</SelectItem>
              <SelectItem value="DRIVER_LICENSE">Driver License</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Ownership Type *</Label>
          <Select
            value={signupData.ownershipType}
            onValueChange={(value) =>
              handleSelectChange("ownershipType", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="TENANT">Tenant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {signupData.idDocumentType === "CNIC" && (
        <div className="space-y-2">
          <Label htmlFor="cnicNumber" className="text-gray-700 font-medium">
            CNIC Number *
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="cnicNumber"
              name="cnicNumber"
              type="text"
              value={signupData.cnicNumber}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="12345-6789012-3"
              required
            />
          </div>
        </div>
      )}

      {signupData.idDocumentType === "PASSPORT" && (
        <div className="space-y-2">
          <Label htmlFor="passportNumber" className="text-gray-700 font-medium">
            Passport Number *
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="passportNumber"
              name="passportNumber"
              type="text"
              value={signupData.passportNumber}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="P123456789"
              required
            />
          </div>
        </div>
      )}

      {signupData.idDocumentType === "DRIVER_LICENSE" && (
        <div className="space-y-2">
          <Label
            htmlFor="driverLicenseNumber"
            className="text-gray-700 font-medium"
          >
            Driver License Number *
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="driverLicenseNumber"
              name="driverLicenseNumber"
              type="text"
              value={signupData.driverLicenseNumber}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="DL123456789"
              required
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="emergencyContact"
            className="text-gray-700 font-medium"
          >
            Emergency Contact *
          </Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="emergencyContact"
              name="emergencyContact"
              type="text"
              value={signupData.emergencyContact}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="Contact person name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="emergencyContactPhone"
            className="text-gray-700 font-medium"
          >
            Emergency Phone *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              value={signupData.emergencyContactPhone}
              onChange={handleSignupChange}
              className="pl-10"
              placeholder="+1 234-567-8901"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation" className="text-gray-700 font-medium">
          Occupation *
        </Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="occupation"
            name="occupation"
            type="text"
            value={signupData.occupation}
            onChange={handleSignupChange}
            className="pl-10"
            placeholder="Your profession"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workAddress" className="text-gray-700 font-medium">
          Work Address
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="workAddress"
            name="workAddress"
            type="text"
            value={signupData.workAddress}
            onChange={handleSignupChange}
            className="pl-10"
            placeholder="Your workplace address"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyIncome" className="text-gray-700 font-medium">
          Monthly Income (Optional)
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="monthlyIncome"
            name="monthlyIncome"
            type="number"
            value={signupData.monthlyIncome}
            onChange={handleSignupChange}
            className="pl-10"
            placeholder="5000"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">


      <div className="space-y-2">
        <Label htmlFor="previousAddress" className="text-gray-700 font-medium">
          Previous Address
        </Label>
        <Textarea
          id="previousAddress"
          name="previousAddress"
          value={signupData.previousAddress}
          onChange={handleSignupChange}
          placeholder="Your previous residential address"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference1Name" className="text-gray-700 font-medium">
            Reference 1 Name
          </Label>
          <Input
            id="reference1Name"
            name="reference1Name"
            type="text"
            value={signupData.reference1Name}
            onChange={handleSignupChange}
            placeholder="Reference person name"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="reference1Phone"
            className="text-gray-700 font-medium"
          >
            Reference 1 Phone
          </Label>
          <Input
            id="reference1Phone"
            name="reference1Phone"
            type="tel"
            value={signupData.reference1Phone}
            onChange={handleSignupChange}
            placeholder="+1 234-567-8901"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference2Name" className="text-gray-700 font-medium">
            Reference 2 Name
          </Label>
          <Input
            id="reference2Name"
            name="reference2Name"
            type="text"
            value={signupData.reference2Name}
            onChange={handleSignupChange}
            placeholder="Reference person name"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="reference2Phone"
            className="text-gray-700 font-medium"
          >
            Reference 2 Phone
          </Label>
          <Input
            id="reference2Phone"
            name="reference2Phone"
            type="tel"
            value={signupData.reference2Phone}
            onChange={handleSignupChange}
            placeholder="+1 234-567-8901"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes" className="text-gray-700 font-medium">
          Additional Notes
        </Label>
        <Textarea
          id="additionalNotes"
          name="additionalNotes"
          value={signupData.additionalNotes}
          onChange={handleSignupChange}
          placeholder="Any additional information you'd like to provide..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500 rounded-full animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 border border-blue-500 rounded-full animate-pulse-slow"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-16 h-16 border border-blue-500 rounded-full animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-resident-gradient p-4 rounded-2xl shadow-resident">
                <HomeIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display font-bold text-gray-900">
              Resident Portal
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Access your residential services
            </p>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
              </TabsList>

              {/* Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50 mb-4">
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50 mb-4">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input

                        id="email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="pl-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-gray-700 font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="pr-10"
                        placeholder="Enter your password"
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

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Demo Credentials:</p>
                    <p>
                      Username: <span className="font-mono">john.smith</span>
                    </p>
                    <p>
                      Password: <span className="font-mono">password123</span>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-resident-gradient hover:opacity-90 text-white shadow-resident"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Logging in...
                      </div>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  {/* Step Progress */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      1
                    </div>
                    <div
                      className={`h-1 w-16 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                        }`}
                    ></div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      2
                    </div>
                    <div
                      className={`h-1 w-16 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
                        }`}
                    ></div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      3
                    </div>
                  </div>

                  {/* Step Titles */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentStep === 1 && "Basic Information"}
                      {currentStep === 2 && "KYC & Verification"}
                      {currentStep === 3 && "Additional Details"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Step {currentStep} of 3
                    </p>
                  </div>

                  {/* Step Content */}
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                      >
                        Previous
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-resident-gradient hover:opacity-90 text-white shadow-resident"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Process Notice */}
                  <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">
                      📋 KYC Registration Process:
                    </p>
                    <p>
                      Your complete application with documents will be reviewed
                      by admin. Login access will be granted upon approval.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
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

export default ResidentAuth;
