import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  Building,
  MapPin,
  Phone,
  IdCard,
  ArrowLeft,
  Upload,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RegistrationData {
  fullName: string;
  fatherName: string;
  cnic: string;
  passport: string;
  drivingLicense: string;
  contactNumber: string;
  emergencyContact: string;
  email: string;
  propertyType: "flat" | "bungalow" | "";
  propertyNumber: string;
  floor: string;
  block: string;
  ownershipStatus: "owner" | "rental" | "";
  landlordContact: string;
  moveInDate: string;
  familyMembers: Array<{
    name: string;
    relation: string;
    age: string;
    cnic: string;
  }>;
  photo: File | null;
}

const ResidentRegistration = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    fatherName: "",
    cnic: "",
    passport: "",
    drivingLicense: "",
    contactNumber: "",
    emergencyContact: "",
    email: "",
    propertyType: "",
    propertyNumber: "",
    floor: "",
    block: "",
    ownershipStatus: "",
    landlordContact: "",
    moveInDate: "",
    familyMembers: [],
    photo: null,
  });

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo size should not exceed 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFamilyMember = () => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { name: "", relation: "", age: "", cnic: "" },
      ],
    }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member,
      ),
    }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.fullName &&
          formData.fatherName &&
          formData.cnic &&
          formData.contactNumber &&
          formData.email
        );
      case 2:
        return !!(
          formData.propertyType &&
          formData.propertyNumber &&
          formData.ownershipStatus
        );
      case 3:
        return !!formData.photo;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError("Please fill in all required fields");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    setError("");
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError("Please complete all required information");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success - redirect to dashboard
      navigate("/resident/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-medium">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fatherName"
                  className="text-gray-700 font-medium"
                >
                  Father's Name *
                </Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) =>
                    handleInputChange("fatherName", e.target.value)
                  }
                  placeholder="Enter father's name"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnic" className="text-gray-700 font-medium">
                  CNIC *
                </Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => handleInputChange("cnic", e.target.value)}
                  placeholder="12345-1234567-1"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport" className="text-gray-700 font-medium">
                  Passport (Optional)
                </Label>
                <Input
                  id="passport"
                  value={formData.passport}
                  onChange={(e) =>
                    handleInputChange("passport", e.target.value)
                  }
                  placeholder="Passport number"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="drivingLicense"
                  className="text-gray-700 font-medium"
                >
                  Driving License (Optional)
                </Label>
                <Input
                  id="drivingLicense"
                  value={formData.drivingLicense}
                  onChange={(e) =>
                    handleInputChange("drivingLicense", e.target.value)
                  }
                  placeholder="License number"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="contactNumber"
                  className="text-gray-700 font-medium"
                >
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  placeholder="+92 300 1234567"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContact"
                  className="text-gray-700 font-medium"
                >
                  Emergency Contact
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    handleInputChange("emergencyContact", e.target.value)
                  }
                  placeholder="+92 300 1234567"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Property Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">
                  Property Type *
                </Label>
                <RadioGroup
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    handleInputChange("propertyType", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flat" id="flat" />
                    <Label htmlFor="flat">Apartment/Flat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bungalow" id="bungalow" />
                    <Label htmlFor="bungalow">Bungalow/House</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="propertyNumber"
                    className="text-gray-700 font-medium"
                  >
                    Property Number *
                  </Label>
                  <Input
                    id="propertyNumber"
                    value={formData.propertyNumber}
                    onChange={(e) =>
                      handleInputChange("propertyNumber", e.target.value)
                    }
                    placeholder="B-205, House #123"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor" className="text-gray-700 font-medium">
                    Floor (for apartments)
                  </Label>
                  <Select
                    value={formData.floor}
                    onValueChange={(value) => handleInputChange("floor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ground">Ground Floor</SelectItem>
                      <SelectItem value="1">1st Floor</SelectItem>
                      <SelectItem value="2">2nd Floor</SelectItem>
                      <SelectItem value="3">3rd Floor</SelectItem>
                      <SelectItem value="4">4th Floor</SelectItem>
                      <SelectItem value="5">5th Floor</SelectItem>
                      <SelectItem value="higher">Higher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block" className="text-gray-700 font-medium">
                    Block/Building
                  </Label>
                  <Input
                    id="block"
                    value={formData.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                    placeholder="Block A, Building 1"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">
                  Ownership Status *
                </Label>
                <RadioGroup
                  value={formData.ownershipStatus}
                  onValueChange={(value) =>
                    handleInputChange("ownershipStatus", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="owner" />
                    <Label htmlFor="owner">Owner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rental" id="rental" />
                    <Label htmlFor="rental">Tenant/Rental</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.ownershipStatus === "rental" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="landlordContact"
                    className="text-gray-700 font-medium"
                  >
                    Landlord Contact Number
                  </Label>
                  <Input
                    id="landlordContact"
                    value={formData.landlordContact}
                    onChange={(e) =>
                      handleInputChange("landlordContact", e.target.value)
                    }
                    placeholder="+92 300 1234567"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="moveInDate"
                  className="text-gray-700 font-medium"
                >
                  Move-in Date
                </Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) =>
                    handleInputChange("moveInDate", e.target.value)
                  }
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Photo Upload
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 mb-4 overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Upload a clear photo of yourself. Maximum size: 5MB
                  <br />
                  Accepted formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Family Members (Optional)
            </h3>

            <div className="space-y-4">
              {formData.familyMembers.map((member, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) =>
                          updateFamilyMember(index, "name", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Relation"
                        value={member.relation}
                        onChange={(e) =>
                          updateFamilyMember(index, "relation", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Age"
                        type="number"
                        value={member.age}
                        onChange={(e) =>
                          updateFamilyMember(index, "age", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2">
                        <Input
                          placeholder="CNIC (Optional)"
                          value={member.cnic}
                          onChange={(e) =>
                            updateFamilyMember(index, "cnic", e.target.value)
                          }
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFamilyMember(index)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addFamilyMember}
                className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                + Add Family Member
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">
                Registration Summary
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  <strong>Name:</strong> {formData.fullName}
                </p>
                <p>
                  <strong>Property:</strong> {formData.propertyNumber} (
                  {formData.propertyType})
                </p>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge className="bg-blue-100 text-blue-800">
                    {formData.ownershipStatus}
                  </Badge>
                </div>
                <p>
                  <strong>Contact:</strong> {formData.contactNumber}
                </p>
                {formData.familyMembers.length > 0 && (
                  <p>
                    <strong>Family Members:</strong>{" "}
                    {formData.familyMembers.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/resident/dashboard")}
            className="mb-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Resident Registration
            </h1>
            <p className="text-gray-600">
              Complete your profile to access all society services
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-16 mx-2 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500">
              Step {currentStep} of 4:{" "}
              {currentStep === 1
                ? "Personal Information"
                : currentStep === 2
                  ? "Property Details"
                  : currentStep === 3
                    ? "Photo Upload"
                    : "Family Members"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            {error && (
              <Alert className="border-red-200 bg-red-50 mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6"
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-loading-spinner mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResidentRegistration;
