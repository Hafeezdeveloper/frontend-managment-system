import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  User,
  Phone,
  Building,
  FileText,
  QrCode,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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

const DeliveryRegistration = () => {
  const navigate = useNavigate();
  const { currentResident } = useResident();
  const { addDeliveryPerson, getResidentDeliveryPersons } = useAdminData();

  const [activeTab, setActiveTab] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [generatedDelivery, setGeneratedDelivery] = useState<any>(null);

  const [deliveryForm, setDeliveryForm] = useState({
    riderName: "",
    idNumber: "",
    idType: "CNIC" as "CNIC" | "Passport" | "Driver License",
    companyName: "",
    description: "",
  });

  if (!currentResident) {
    navigate("/resident/auth");
    return null;
  }

  // Get existing delivery persons for this resident
  const deliveryPersons =
    getResidentDeliveryPersons?.(currentResident.id) || [];

  const validateForm = () => {
    if (!deliveryForm.riderName.trim()) return "Please enter rider name";
    if (!deliveryForm.idNumber.trim()) return "Please enter ID number";
    if (!deliveryForm.companyName.trim()) return "Please enter company name";
    if (!deliveryForm.description.trim()) return "Please enter description";
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
      const deliveryData = {
        residentId: currentResident.id,
        residentName: currentResident.name,
        apartment: currentResident.apartment,
        riderName: deliveryForm.riderName.trim(),
        idNumber: deliveryForm.idNumber.trim(),
        idType: deliveryForm.idType,
        companyName: deliveryForm.companyName.trim(),
        description: deliveryForm.description.trim(),
        registrationDate: new Date().toISOString().split("T")[0],
      };

      addDeliveryPerson(deliveryData);

      // Generate QR code for the delivery person
      const qrData = JSON.stringify({
        type: "delivery_entry",
        residentId: currentResident.id,
        residentName: currentResident.name,
        apartment: currentResident.apartment,
        riderName: deliveryForm.riderName.trim(),
        idNumber: deliveryForm.idNumber.trim(),
        idType: deliveryForm.idType,
        companyName: deliveryForm.companyName.trim(),
        description: deliveryForm.description.trim(),
        registrationDate: new Date().toISOString().split("T")[0],
      });

      setQrCode(qrData);
      setGeneratedDelivery({
        ...deliveryData,
        qrCode: qrData,
      });
      setSuccess(true);
      setActiveTab("qrcode");
      toast.success("Delivery person registered successfully!");

      // Reset form
      setDeliveryForm({
        riderName: "",
        idNumber: "",
        idType: "CNIC",
        companyName: "",
        description: "",
      });
    } catch (error) {
      console.error("Error registering delivery person:", error);
      setError("Failed to register delivery person. Please try again.");
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setDeliveryForm({ ...deliveryForm, [field]: value });
    setError("");
    setSuccess(false);
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
                <div className="bg-orange-600 p-2 rounded-lg mr-3">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Delivery Registration
                  </h1>
                  <p className="text-sm text-gray-500">
                    Register delivery persons and generate QR codes for gate
                    access
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
              <TabsTrigger value="register">Register Delivery</TabsTrigger>
              <TabsTrigger value="qrcode">Generated QR Code</TabsTrigger>
              <TabsTrigger value="history">Delivery History</TabsTrigger>
            </TabsList>

            {/* Register Delivery Tab */}
            <TabsContent value="register" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Registration Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Delivery Person Information
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
                            Delivery person registered successfully! QR code
                            generated.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="riderName">
                          Rider Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="riderName"
                          value={deliveryForm.riderName}
                          onChange={(e) =>
                            handleInputChange("riderName", e.target.value)
                          }
                          placeholder="Enter rider's full name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="idType">ID Document Type</Label>
                          <Select
                            value={deliveryForm.idType}
                            onValueChange={(value: any) =>
                              handleInputChange("idType", value)
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

                        <div className="space-y-2">
                          <Label htmlFor="idNumber">
                            ID Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="idNumber"
                            value={deliveryForm.idNumber}
                            onChange={(e) =>
                              handleInputChange("idNumber", e.target.value)
                            }
                            placeholder="Enter ID number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          value={deliveryForm.companyName}
                          onChange={(e) =>
                            handleInputChange("companyName", e.target.value)
                          }
                          placeholder="e.g., FoodPanda, Uber Eats, DHL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Purpose/Description{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={deliveryForm.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder="Describe the delivery purpose (e.g., food delivery, package pickup)"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          "Registering..."
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Register & Generate QR Code
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Resident Information
                    </CardTitle>
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
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">
                          {currentResident.phone}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Important Notes:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• The QR code will be valid for gate entry</li>
                        <li>
                          • Make sure the delivery person carries valid ID
                        </li>
                        <li>
                          • The QR code contains encrypted delivery information
                        </li>
                        <li>
                          • Share the QR code securely with the delivery person
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">
                            Quick Tips
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Register delivery persons in advance for faster gate
                            processing. The QR code can be shared via WhatsApp
                            or other messaging apps.
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
              {generatedDelivery ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QRCodeDisplay
                    data={generatedDelivery.qrCode}
                    title="Delivery Entry QR Code"
                    description={`Access code for ${generatedDelivery.riderName} from ${generatedDelivery.companyName}`}
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Rider Name:</span>
                          <p className="font-medium">
                            {generatedDelivery.riderName}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Company:</span>
                          <p className="font-medium">
                            {generatedDelivery.companyName}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">ID Number:</span>
                          <p className="font-medium">
                            {generatedDelivery.idNumber}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">ID Type:</span>
                          <p className="font-medium">
                            {generatedDelivery.idType}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <span className="text-gray-500 text-sm">
                          Description:
                        </span>
                        <p className="text-sm bg-gray-50 p-3 rounded mt-1">
                          {generatedDelivery.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t">
                        <span className="text-gray-500 text-sm">
                          Delivery To:
                        </span>
                        <p className="font-medium">
                          {generatedDelivery.residentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {generatedDelivery.apartment}
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
                      Register a delivery person first to generate their QR code
                    </p>
                    <Button onClick={() => setActiveTab("register")}>
                      Register Delivery
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Delivery History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  {deliveryPersons.length === 0 ? (
                    <div className="text-center py-12">
                      <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No delivery registrations
                      </h3>
                      <p className="text-gray-500">
                        Your registered delivery persons will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deliveryPersons.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-lg">
                                {delivery.riderName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {delivery.companyName}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {delivery.registrationDate}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">ID:</span>
                              <p>{delivery.idNumber}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">ID Type:</span>
                              <p>{delivery.idType}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Registered:</span>
                              <p>
                                {new Date(
                                  delivery.registrationDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              {delivery.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-3 border-t flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setGeneratedDelivery(delivery);
                                setActiveTab("qrcode");
                              }}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              View QR Code
                            </Button>
                          </div>
                        </div>
                      ))}
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

export default DeliveryRegistration;
