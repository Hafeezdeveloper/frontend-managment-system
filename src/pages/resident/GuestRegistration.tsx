import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  Clock,
  QrCode,
  CheckCircle,
  AlertCircle,
  Users,
  Phone,
  Car,
  FileText,
  Eye,
  Share2,
  Download,
  UserCheck,
  MapPin,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useResident } from "@/contexts/ResidentContext";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType?: string;
  licensePlate?: string;
  purpose: string;
  validFrom: string;
  validUntil: string;
  timeFrom: string;
  timeUntil: string;
  hostApartment: string;
  hostName: string;
  idNumber: string;
  idType: "CNIC" | "Passport" | "Driver License";
  status: "Active" | "Expired" | "Cancelled";
  qrCode: string;
  registrationDate: string;
  notes?: string;
}

const GuestRegistration = () => {
  const navigate = useNavigate();
  const { currentResident } = useResident();

  const [activeTab, setActiveTab] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedGuest, setGeneratedGuest] = useState<Guest | null>(null);
  const [registeredGuests, setRegisteredGuests] = useState<Guest[]>([]);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(
    null,
  );

  const [guestForm, setGuestForm] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    licensePlate: "",
    purpose: "",
    validFrom: "",
    validUntil: "",
    timeFrom: "09:00",
    timeUntil: "18:00",
    idNumber: "",
    idType: "CNIC" as const,
    notes: "",
  });

  // Check authentication
  useEffect(() => {
    if (!currentResident) {
      navigate("/resident/auth");
    }
  }, [currentResident, navigate]);

  // Load registered guests (local data only to prevent errors)
  useEffect(() => {
    if (!currentResident) return;

    const loadGuests = () => {
      console.log("📝 Loading sample guest data for demo");
      setBackendAvailable(false);

      const sampleGuests: Guest[] = [
        {
          id: "G001",
          name: "John Visitor",
          phone: "+1-234-567-8901",
          email: "john.visitor@example.com",
          vehicleType: "Car",
          licensePlate: "ABC-123",
          purpose: "Family Visit",
          validFrom: "2024-01-15T10:00:00",
          validUntil: "2024-01-15T18:00:00",
          timeFrom: "10:00",
          timeUntil: "18:00",
          hostApartment: currentResident.apartment,
          hostName: currentResident.name,
          idNumber: "42101-1234567-8",
          idType: "CNIC",
          status: "Active",
          qrCode: "",
          registrationDate: "2024-01-15",
          notes: "Regular family visitor",
        },
        {
          id: "G002",
          name: "Sarah Johnson",
          phone: "+1-987-654-3210",
          purpose: "Business Meeting",
          validFrom: "2024-01-16T14:00:00",
          validUntil: "2024-01-16T17:00:00",
          timeFrom: "14:00",
          timeUntil: "17:00",
          hostApartment: currentResident.apartment,
          hostName: currentResident.name,
          idNumber: "AB1234567",
          idType: "Passport",
          status: "Active",
          qrCode: "",
          registrationDate: "2024-01-16",
        },
      ];

      // Generate QR codes for sample guests
      const guestsWithQR = sampleGuests.map((guest) => ({
        ...guest,
        qrCode: generateGuestQR(guest),
      }));

      setRegisteredGuests(guestsWithQR);
    };

    // Load guests immediately
    loadGuests();
  }, [currentResident]);

  const purposeOptions = [
    "Family Visit",
    "Friend Visit",
    "Business Meeting",
    "Maintenance Work",
    "Delivery",
    "Medical Visit",
    "Social Event",
    "Other",
  ];

  const vehicleTypes = ["Car", "Motorcycle", "Bicycle", "None"];

  const handleInputChange = (field: string, value: string) => {
    setGuestForm({ ...guestForm, [field]: value });
    setError("");
    setSuccess("");
  };

  const generateGuestQR = (guest: Guest | typeof guestForm) => {
    if (!currentResident) return "";

    const qrData = {
      type: "guest_entry",
      guestId: "id" in guest ? guest.id : `G${Date.now()}`,
      guestName: guest.name,
      hostApartment: currentResident.apartment,
      hostName: currentResident.name,
      purpose: guest.purpose,
      vehicleType: guest.vehicleType || "None",
      licensePlate: guest.licensePlate || "",
      validFrom: guest.validFrom,
      validUntil: guest.validUntil,
      idNumber: guest.idNumber,
      idType: guest.idType,
      phone: guest.phone,
    };

    return JSON.stringify(qrData);
  };

  const validateForm = () => {
    if (!guestForm.name.trim()) return "Guest name is required";
    if (!guestForm.phone.trim()) return "Phone number is required";
    if (!guestForm.purpose.trim()) return "Purpose of visit is required";
    if (!guestForm.validFrom) return "Visit start date and time is required";
    if (!guestForm.validUntil) return "Visit end date and time is required";
    if (!guestForm.timeFrom) return "Start time is required";
    if (!guestForm.timeUntil) return "End time is required";
    if (!guestForm.idNumber.trim()) return "ID number is required";

    // Validate dates
    const startDateTime = new Date(
      `${guestForm.validFrom}T${guestForm.timeFrom}`,
    );
    const endDateTime = new Date(
      `${guestForm.validUntil}T${guestForm.timeUntil}`,
    );
    const now = new Date();

    if (startDateTime < now) {
      return "Visit start time cannot be in the past";
    }

    if (endDateTime <= startDateTime) {
      return "Visit end time must be after start time";
    }

    // Validate vehicle info if provided
    if (
      guestForm.vehicleType &&
      guestForm.vehicleType !== "None" &&
      !guestForm.licensePlate.trim()
    ) {
      return "License plate is required when vehicle type is selected";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentResident) {
      setError("You must be logged in as a resident");
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
      // Always use local storage to prevent errors
      console.log("📝 Creating guest with local storage");

      const guestId = `G${Date.now()}`;
      const startDateTime = `${guestForm.validFrom}T${guestForm.timeFrom}:00`;
      const endDateTime = `${guestForm.validUntil}T${guestForm.timeUntil}:00`;

      const newGuest: Guest = {
        id: guestId,
        name: guestForm.name,
        phone: guestForm.phone,
        email: guestForm.email || undefined,
        vehicleType: guestForm.vehicleType || undefined,
        licensePlate: guestForm.licensePlate || undefined,
        purpose: guestForm.purpose,
        validFrom: startDateTime,
        validUntil: endDateTime,
        timeFrom: guestForm.timeFrom,
        timeUntil: guestForm.timeUntil,
        hostApartment: currentResident.apartment,
        hostName: currentResident.name,
        idNumber: guestForm.idNumber,
        idType: guestForm.idType,
        status: "Active",
        qrCode: "",
        registrationDate: new Date().toISOString().split("T")[0],
        notes: guestForm.notes || undefined,
      };

      // Generate QR code locally
      newGuest.qrCode = generateGuestQR(newGuest);

      // Add to registered guests
      setRegisteredGuests((prev) => [newGuest, ...prev]);
      setGeneratedGuest(newGuest);

      // Reset form
      setGuestForm({
        name: "",
        phone: "",
        email: "",
        vehicleType: "",
        licensePlate: "",
        purpose: "",
        validFrom: "",
        validUntil: "",
        timeFrom: "09:00",
        timeUntil: "18:00",
        idNumber: "",
        idType: "CNIC",
        notes: "",
      });

      setSuccess("Guest registered successfully! QR code generated.");
      setActiveTab("qr");
      toast.success(`Guest ${newGuest.name} registered successfully!`);
    } catch (error) {
      console.error("Guest registration error:", error);
      setError("Failed to register guest. Please try again.");
      toast.error("Failed to register guest");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isGuestExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getGuestStatus = (guest: Guest) => {
    if (guest.status === "Cancelled") return "Cancelled";
    if (isGuestExpired(guest.validUntil)) return "Expired";
    return "Active";
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!currentResident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/resident/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  Guest Registration
                </h1>
                <p className="text-sm text-gray-500">
                  Register guests and generate QR codes for gate access
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-teal-600">
                <MapPin className="w-4 h-4 mr-1" />
                {currentResident.apartment}
              </Badge>
              {backendAvailable === false && (
                <Badge variant="outline" className="text-orange-600">
                  📱 Demo Mode
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-gray-200">
                  <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                    <TabsTrigger
                      value="register"
                      className="flex-1 py-4 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register Guest
                    </TabsTrigger>
                    <TabsTrigger
                      value="qr"
                      className="flex-1 py-4 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generated QR Code
                    </TabsTrigger>
                    <TabsTrigger
                      value="guests"
                      className="flex-1 py-4 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      My Guests ({registeredGuests.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Register Guest Tab */}
                <TabsContent value="register" className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Guest Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <UserCheck className="w-5 h-5 mr-2" />
                            Guest Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Full Name *</Label>
                              <Input
                                id="name"
                                type="text"
                                placeholder="Enter guest full name"
                                value={guestForm.name}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number *</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1-234-567-8901"
                                value={guestForm.phone}
                                onChange={(e) =>
                                  handleInputChange("phone", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="guest@example.com"
                                value={guestForm.email}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="purpose">
                                Purpose of Visit *
                              </Label>
                              <Select
                                value={guestForm.purpose}
                                onValueChange={(value) =>
                                  handleInputChange("purpose", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select purpose" />
                                </SelectTrigger>
                                <SelectContent>
                                  {purposeOptions.map((purpose) => (
                                    <SelectItem key={purpose} value={purpose}>
                                      {purpose}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* ID Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <FileText className="w-5 h-5 mr-2" />
                            ID Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="idType">ID Type *</Label>
                              <Select
                                value={guestForm.idType}
                                onValueChange={(value: any) =>
                                  handleInputChange("idType", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CNIC">CNIC</SelectItem>
                                  <SelectItem value="Passport">
                                    Passport
                                  </SelectItem>
                                  <SelectItem value="Driver License">
                                    Driver License
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="idNumber">ID Number *</Label>
                              <Input
                                id="idNumber"
                                type="text"
                                placeholder={
                                  guestForm.idType === "CNIC"
                                    ? "42101-1234567-8"
                                    : guestForm.idType === "Passport"
                                      ? "AB1234567"
                                      : "DL123456789"
                                }
                                value={guestForm.idNumber}
                                onChange={(e) =>
                                  handleInputChange("idNumber", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Visit Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <Calendar className="w-5 h-5 mr-2" />
                            Visit Schedule
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="validFrom">
                                Visit Date From *
                              </Label>
                              <Input
                                id="validFrom"
                                type="date"
                                value={guestForm.validFrom}
                                onChange={(e) =>
                                  handleInputChange("validFrom", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="validUntil">
                                Visit Date Until *
                              </Label>
                              <Input
                                id="validUntil"
                                type="date"
                                value={guestForm.validUntil}
                                onChange={(e) =>
                                  handleInputChange(
                                    "validUntil",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="timeFrom">Time From *</Label>
                              <Input
                                id="timeFrom"
                                type="time"
                                value={guestForm.timeFrom}
                                onChange={(e) =>
                                  handleInputChange("timeFrom", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="timeUntil">Time Until *</Label>
                              <Input
                                id="timeUntil"
                                type="time"
                                value={guestForm.timeUntil}
                                onChange={(e) =>
                                  handleInputChange("timeUntil", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Vehicle Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <Car className="w-5 h-5 mr-2" />
                            Vehicle Information (Optional)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="vehicleType">Vehicle Type</Label>
                              <Select
                                value={guestForm.vehicleType}
                                onValueChange={(value) =>
                                  handleInputChange("vehicleType", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vehicleTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="licensePlate">
                                License Plate
                              </Label>
                              <Input
                                id="licensePlate"
                                type="text"
                                placeholder="ABC-123"
                                value={guestForm.licensePlate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "licensePlate",
                                    e.target.value.toUpperCase(),
                                  )
                                }
                                disabled={
                                  !guestForm.vehicleType ||
                                  guestForm.vehicleType === "None"
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Additional Notes */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <FileText className="w-5 h-5 mr-2" />
                            Additional Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder="Any additional notes about the guest or visit..."
                            value={guestForm.notes}
                            onChange={(e) =>
                              handleInputChange("notes", e.target.value)
                            }
                            rows={3}
                          />
                        </CardContent>
                      </Card>

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
                            {success}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Registering...
                            </div>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Register Guest
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>

                {/* QR Code Tab */}
                <TabsContent value="qr" className="p-8">
                  <div className="max-w-2xl mx-auto">
                    {generatedGuest ? (
                      <div className="space-y-6">
                        <QRCodeDisplay
                          data={generatedGuest.qrCode}
                          title={`Guest QR Code - ${generatedGuest.name}`}
                          description="Present this QR code at the gate for guest entry"
                          size={300}
                        />

                        <Card>
                          <CardHeader>
                            <CardTitle>Guest Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Name:</strong> {generatedGuest.name}
                              </div>
                              <div>
                                <strong>Phone:</strong> {generatedGuest.phone}
                              </div>
                              <div>
                                <strong>Purpose:</strong>{" "}
                                {generatedGuest.purpose}
                              </div>
                              <div>
                                <strong>Valid From:</strong>{" "}
                                {formatDateTime(generatedGuest.validFrom)}
                              </div>
                              <div>
                                <strong>Valid Until:</strong>{" "}
                                {formatDateTime(generatedGuest.validUntil)}
                              </div>
                              <div>
                                <strong>Host:</strong> {generatedGuest.hostName}{" "}
                                ({generatedGuest.hostApartment})
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            No QR Code Generated
                          </h3>
                          <p className="text-gray-500">
                            Register a guest to generate their QR code.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* My Guests Tab */}
                <TabsContent value="guests" className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Registered Guests
                      </h3>
                      <Badge variant="outline" className="text-teal-600">
                        {registeredGuests.length} Total
                      </Badge>
                    </div>

                    <div className="grid gap-4">
                      {registeredGuests.map((guest) => {
                        const currentStatus = getGuestStatus(guest);
                        return (
                          <Card
                            key={guest.id}
                            className="border border-gray-200"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 bg-teal-100 rounded">
                                      <UserCheck className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {guest.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {guest.purpose}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        ID: {guest.id}
                                      </p>
                                    </div>
                                    <Badge
                                      className={getStatusColor(currentStatus)}
                                    >
                                      {currentStatus}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">
                                        Phone:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {guest.phone}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Valid From:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {formatDateTime(guest.validFrom)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Valid Until:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {formatDateTime(guest.validUntil)}
                                      </span>
                                    </div>
                                    {guest.vehicleType &&
                                      guest.vehicleType !== "None" && (
                                        <>
                                          <div>
                                            <span className="text-gray-500">
                                              Vehicle:
                                            </span>
                                            <span className="ml-2 font-medium">
                                              {guest.vehicleType}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              License:
                                            </span>
                                            <span className="ml-2 font-medium">
                                              {guest.licensePlate}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                  </div>
                                </div>

                                <div className="flex flex-col space-y-2 ml-6">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setGeneratedGuest(guest);
                                      setActiveTab("qr");
                                    }}
                                  >
                                    <QrCode className="w-4 h-4 mr-1" />
                                    View QR
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {registeredGuests.length === 0 && (
                        <Card className="border border-gray-200">
                          <CardContent className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                              No Guests Registered
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Register your first guest to generate QR codes for
                              gate access.
                            </p>
                            <Button
                              onClick={() => setActiveTab("register")}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              Register First Guest
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GuestRegistration;
