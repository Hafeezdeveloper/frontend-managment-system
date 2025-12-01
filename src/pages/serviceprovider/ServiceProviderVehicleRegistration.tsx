import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Bike,
  Truck,
  Calendar,
  FileText,
  QrCode,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useServiceProvider } from "@/contexts/ServiceProviderContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toast } from "sonner";

const ServiceProviderVehicleRegistration = () => {
  const navigate = useNavigate();
  const { currentServiceProvider } = useServiceProvider();
  const { addVehicle, getServiceProviderVehicles } = useAdminData();

  const [formData, setFormData] = useState({
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);

  // Check authentication and redirect if needed - using useEffect instead of early return
  useEffect(() => {
    if (!currentServiceProvider) {
      navigate("/service-provider/auth");
    }
  }, [currentServiceProvider, navigate]);

  // Get vehicles and update state when component mounts or vehicles change
  const existingVehicles = currentServiceProvider
    ? getServiceProviderVehicles(currentServiceProvider.id)
    : [];

  // Update local state when vehicles change
  useEffect(() => {
    setVehiclesList(existingVehicles);
  }, [existingVehicles.length]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError("");
    setSuccess(false);
  };

  const validateForm = () => {
    if (!formData.vehicleType) return "Please select vehicle type";
    if (!formData.make.trim()) return "Please enter vehicle make";
    if (!formData.model.trim()) return "Please enter vehicle model";
    if (!formData.year.trim()) return "Please enter vehicle year";
    if (!formData.color.trim()) return "Please enter vehicle color";
    if (!formData.licensePlate.trim()) return "Please enter license plate";

    // Check for duplicate license plate
    const duplicate = existingVehicles.find(
      (v) =>
        v.licensePlate.toLowerCase() === formData.licensePlate.toLowerCase(),
    );
    if (duplicate) {
      return "This license plate is already registered";
    }

    return null;
  };

  const generateVehicleQR = (vehicle: any) => {
    if (!currentServiceProvider) return "";

    const qrData = {
      type: "service_provider_vehicle_entry",
      vehicleId: vehicle.id,
      serviceProviderId: currentServiceProvider.id,
      providerName: currentServiceProvider.name,
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      registrationDate: vehicle.registrationDate,
    };
    return JSON.stringify(qrData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentServiceProvider) {
      setError("Authentication required");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const vehicleData = {
        ...formData,
        serviceProviderId: currentServiceProvider.id,
        serviceProviderName: currentServiceProvider.name,
        registrationDate: new Date().toISOString().split("T")[0],
        status: "Active",
      };

      addVehicle(vehicleData);

      // Generate QR code for the new vehicle
      const newQR = generateVehicleQR({
        ...vehicleData,
        id: Date.now(), // Temporary ID for QR generation
      });
      setQrCode(newQR);

      setSuccess(true);
      setFormData({
        vehicleType: "",
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
      });

      toast.success("Vehicle registered successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to register vehicle. Please try again.");
      toast.error("Failed to register vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "car":
        return <Car className="w-5 h-5" />;
      case "motorcycle":
        return <Bike className="w-5 h-5" />;
      case "truck":
        return <Truck className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "car":
        return "text-blue-600 bg-blue-100";
      case "motorcycle":
        return "text-green-600 bg-green-100";
      case "truck":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Show loading state if not authenticated yet
  if (!currentServiceProvider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/service-provider/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  Service Vehicle Registration
                </h1>
                <p className="text-sm text-gray-500">
                  Register your service vehicles for gate access
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Registration Form */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-6 h-6 mr-2 text-green-600" />
                  Register New Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Vehicle Type */}
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) =>
                        handleInputChange("vehicleType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Car">
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-2" />
                            Car
                          </div>
                        </SelectItem>
                        <SelectItem value="Motorcycle">
                          <div className="flex items-center">
                            <Bike className="w-4 h-4 mr-2" />
                            Motorcycle
                          </div>
                        </SelectItem>
                        <SelectItem value="Truck">
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 mr-2" />
                            Truck/Van
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        type="text"
                        placeholder="e.g., Toyota, Honda"
                        value={formData.make}
                        onChange={(e) =>
                          handleInputChange("make", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        type="text"
                        placeholder="e.g., Camry, Civic"
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="e.g., 2020"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color *</Label>
                      <Input
                        id="color"
                        type="text"
                        placeholder="e.g., White, Black"
                        value={formData.color}
                        onChange={(e) =>
                          handleInputChange("color", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licensePlate">License Plate *</Label>
                    <Input
                      id="licensePlate"
                      type="text"
                      placeholder="e.g., ABC-123"
                      value={formData.licensePlate}
                      onChange={(e) =>
                        handleInputChange(
                          "licensePlate",
                          e.target.value.toUpperCase(),
                        )
                      }
                    />
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-700">
                        Vehicle registered successfully! QR code generated.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Registering...
                      </div>
                    ) : (
                      <>
                        <Car className="w-4 h-4 mr-2" />
                        Register Vehicle
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            {qrCode && (
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <QrCode className="w-6 h-6 mr-2" />
                    Vehicle QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QRCodeDisplay
                    data={qrCode}
                    title="Service Vehicle Access"
                    description="Use this QR code for vehicle gate entry"
                    size={200}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Registered Vehicles List */}
          {vehiclesList.length > 0 && (
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-green-600" />
                  Registered Vehicles ({vehiclesList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehiclesList.map((vehicle) => (
                    <Card key={vehicle.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-lg ${getVehicleTypeColor(vehicle.vehicleType)}`}
                            >
                              {getVehicleIcon(vehicle.vehicleType)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {vehicle.make} {vehicle.model}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {vehicle.licensePlate}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={getVehicleTypeColor(vehicle.vehicleType)}
                          >
                            {vehicle.vehicleType}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Year: {vehicle.year}</p>
                          <p>Color: {vehicle.color}</p>
                          <p>
                            Registered:{" "}
                            {new Date(
                              vehicle.registrationDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              setQrCode(generateVehicleQR(vehicle))
                            }
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-green-600">
                Vehicle Registration Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Registration Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      All vehicles must have valid registration
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      License plate must be clearly visible
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Only service-related vehicles allowed
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Maximum 3 vehicles per service provider
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    QR Code Usage
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <QrCode className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      Show QR code to security for gate access
                    </li>
                    <li className="flex items-start">
                      <QrCode className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      Each vehicle has a unique QR code
                    </li>
                    <li className="flex items-start">
                      <QrCode className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      Download or share QR codes as needed
                    </li>
                    <li className="flex items-start">
                      <QrCode className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      QR codes are valid 24/7 for registered vehicles
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ServiceProviderVehicleRegistration;
