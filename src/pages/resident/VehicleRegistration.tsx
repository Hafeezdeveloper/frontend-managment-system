import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResident } from "@/contexts/ResidentContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toast } from "sonner";

const VehicleRegistration = () => {
  const navigate = useNavigate();
  const { currentResident } = useResident();
  const { addVehicle, getResidentVehicles } = useAdminData();

  const [activeTab, setActiveTab] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [generatedVehicle, setGeneratedVehicle] = useState<any>(null);

  const [vehicleForm, setVehicleForm] = useState({
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
  });

  if (!currentResident) {
    navigate("/resident/auth");
    return null;
  }

  const registeredVehicles = getResidentVehicles(currentResident.id);

  const validateForm = () => {
    if (!vehicleForm.vehicleType) return "Please select vehicle type";
    if (!vehicleForm.make.trim()) return "Please enter vehicle make";
    if (!vehicleForm.model.trim()) return "Please enter vehicle model";
    if (!vehicleForm.year) return "Please enter manufacturing year";
    if (!vehicleForm.color.trim()) return "Please enter vehicle color";
    if (!vehicleForm.licensePlate.trim()) return "Please enter license plate";

    const currentYear = new Date().getFullYear();
    const year = parseInt(vehicleForm.year);
    if (year < 1900 || year > currentYear + 1) {
      return "Please enter a valid manufacturing year";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // Check for duplicate license plate
      const existingVehicle = registeredVehicles.find(
        (vehicle) =>
          vehicle.licensePlate.toLowerCase() ===
          vehicleForm.licensePlate.toLowerCase(),
      );

      if (existingVehicle) {
        setError("A vehicle with this license plate is already registered");
        setIsLoading(false);
        return;
      }

      const vehicleData = {
        residentId: currentResident.id,
        residentName: currentResident.name,
        apartment: currentResident.apartment,
        vehicleType: vehicleForm.vehicleType,
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        year: parseInt(vehicleForm.year),
        color: vehicleForm.color.trim(),
        licensePlate: vehicleForm.licensePlate.trim().toUpperCase(),
        registrationDate: new Date().toISOString().split("T")[0],
      };

      addVehicle(vehicleData);

      // Generate QR code for the vehicle
      const qrData = JSON.stringify({
        type: "vehicle_entry",
        residentId: currentResident.id,
        residentName: currentResident.name,
        apartment: currentResident.apartment,
        vehicleType: vehicleForm.vehicleType,
        licensePlate: vehicleForm.licensePlate.trim().toUpperCase(),
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        year: vehicleForm.year,
        color: vehicleForm.color.trim(),
        registrationDate: new Date().toISOString().split("T")[0],
      });

      setQrCode(qrData);
      setGeneratedVehicle({
        ...vehicleData,
        qrCode: qrData,
      });
      setSuccess(true);
      setActiveTab("qrcode");
      toast.success("Vehicle registered successfully!");

      // Reset form
      setVehicleForm({
        vehicleType: "",
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
      });
    } catch (error) {
      console.error("Error registering vehicle:", error);
      setError("Failed to register vehicle. Please try again.");
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setVehicleForm({ ...vehicleForm, [field]: value });
    setError("");
    setSuccess(false);
  };

  const vehicleIcons = {
    Car: Car,
    Bike: Bike,
    Motorcycle: Bike,
    Truck: Truck,
    Van: Truck,
    Scooter: Bike,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/resident/dashboard")}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <div className="bg-purple-600 p-2 rounded-lg mr-3">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Vehicle Registration
                  </h1>
                  <p className="text-sm text-gray-500">
                    Register your vehicles and generate QR codes for gate access
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="register">Register Vehicle</TabsTrigger>
              <TabsTrigger value="qrcode">Generated QR Code</TabsTrigger>
              <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            </TabsList>

            {/* Register Vehicle Tab */}
            <TabsContent value="register" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Registration Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            Vehicle registered successfully! QR code generated.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="vehicleType">
                          Vehicle Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={vehicleForm.vehicleType}
                          onValueChange={(value) =>
                            handleInputChange("vehicleType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Car">
                              <div className="flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                Car
                              </div>
                            </SelectItem>
                            <SelectItem value="Motorcycle">
                              <div className="flex items-center gap-2">
                                <Bike className="w-4 h-4" />
                                Motorcycle
                              </div>
                            </SelectItem>
                            <SelectItem value="Scooter">
                              <div className="flex items-center gap-2">
                                <Bike className="w-4 h-4" />
                                Scooter
                              </div>
                            </SelectItem>
                            <SelectItem value="Van">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Van
                              </div>
                            </SelectItem>
                            <SelectItem value="Truck">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Truck
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="make">
                            Make <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="make"
                            value={vehicleForm.make}
                            onChange={(e) =>
                              handleInputChange("make", e.target.value)
                            }
                            placeholder="e.g., Toyota"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">
                            Model <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="model"
                            value={vehicleForm.model}
                            onChange={(e) =>
                              handleInputChange("model", e.target.value)
                            }
                            placeholder="e.g., Corolla"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="year">
                            Year <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            value={vehicleForm.year}
                            onChange={(e) =>
                              handleInputChange("year", e.target.value)
                            }
                            placeholder="2020"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">
                            Color <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="color"
                            value={vehicleForm.color}
                            onChange={(e) =>
                              handleInputChange("color", e.target.value)
                            }
                            placeholder="e.g., White"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licensePlate">
                          License Plate <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="licensePlate"
                          value={vehicleForm.licensePlate}
                          onChange={(e) =>
                            handleInputChange(
                              "licensePlate",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="e.g., ABC-123"
                          className="uppercase"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          "Registering..."
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Register Vehicle & Generate QR
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resident Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {currentResident.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Apartment:</span>
                        <span className="font-medium">
                          {currentResident.apartment}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Registered Vehicles:
                        </span>
                        <span className="font-medium">
                          {registeredVehicles.length}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">
                        Vehicle Registration Tips:
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Ensure license plate is accurate</li>
                        <li>• Double-check make and model</li>
                        <li>• QR code will be generated automatically</li>
                        <li>• Keep QR code saved on your phone</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-800">
                            QR Code Usage
                          </h4>
                          <p className="text-sm text-purple-700 mt-1">
                            The QR code will contain your vehicle information
                            for quick gate verification. Make sure to show it to
                            security when entering/exiting.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Generated QR Code Tab */}
            <TabsContent value="qrcode" className="space-y-6">
              {generatedVehicle ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QRCodeDisplay
                    data={generatedVehicle.qrCode}
                    title="Vehicle Entry QR Code"
                    description={`Gate access code for ${generatedVehicle.make} ${generatedVehicle.model} (${generatedVehicle.licensePlate})`}
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Vehicle Type:</span>
                          <p className="font-medium">
                            {generatedVehicle.vehicleType}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">License Plate:</span>
                          <p className="font-medium">
                            {generatedVehicle.licensePlate}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Make & Model:</span>
                          <p className="font-medium">
                            {generatedVehicle.make} {generatedVehicle.model}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Year & Color:</span>
                          <p className="font-medium">
                            {generatedVehicle.year} {generatedVehicle.color}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="pt-3 border-t">
                        <span className="text-gray-500 text-sm">Owner:</span>
                        <p className="font-medium">
                          {generatedVehicle.residentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {generatedVehicle.apartment}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-500 text-sm">
                          Registration Date:
                        </span>
                        <p className="text-sm">
                          {new Date(
                            generatedVehicle.registrationDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No QR Code Generated
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Register a vehicle first to generate its QR code
                    </p>
                    <Button onClick={() => setActiveTab("register")}>
                      Register Vehicle
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Vehicles</CardTitle>
                </CardHeader>
                <CardContent>
                  {registeredVehicles.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No vehicles registered
                      </h3>
                      <p className="text-gray-500">
                        Your registered vehicles will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {registeredVehicles.map((vehicle) => {
                        const IconComponent =
                          vehicleIcons[
                            vehicle.vehicleType as keyof typeof vehicleIcons
                          ] || Car;
                        return (
                          <Card key={vehicle.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <IconComponent className="w-6 h-6 text-purple-600" />
                                  <div>
                                    <h4 className="font-medium">
                                      {vehicle.make} {vehicle.model}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {vehicle.licensePlate}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {vehicle.vehicleType}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Year: {vehicle.year}</p>
                                <p>Color: {vehicle.color}</p>
                                <p>
                                  Registered:{" "}
                                  {new Date(
                                    vehicle.registrationDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => {
                                    setGeneratedVehicle(vehicle);
                                    setActiveTab("qrcode");
                                  }}
                                >
                                  <QrCode className="w-4 h-4 mr-2" />
                                  View QR Code
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default VehicleRegistration;
