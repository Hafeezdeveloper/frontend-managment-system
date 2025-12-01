import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  QrCode,
  Edit,
  Save,
  X,
  Shield,
  Calendar,
  Home,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useResident } from "@/contexts/ResidentContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toast } from "sonner";

const ResidentProfile = () => {
  const navigate = useNavigate();
  const { currentResident, setCurrentResident } = useResident();
  const { updateResident } = useAdminData();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    emergencyContactPhone: "",
    occupation: "",
    workAddress: "",
  });

  useEffect(() => {
    if (currentResident) {
      setFormData({
        name: currentResident.name || "",
        email: currentResident.email || "",
        phone: currentResident.phone || "",
        emergencyContact: currentResident.emergencyContact || "",
        emergencyContactPhone: currentResident.emergencyContactPhone || "",
        occupation: currentResident.occupation || "",
        workAddress: currentResident.workAddress || "",
      });
    }
  }, [currentResident]);

  if (!currentResident) {
    navigate("/resident/auth");
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedData = {
        ...currentResident,
        ...formData,
      };

      updateResident(currentResident.id, formData);
      setCurrentResident(updatedData);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentResident.name || "",
      email: currentResident.email || "",
      phone: currentResident.phone || "",
      emergencyContact: currentResident.emergencyContact || "",
      emergencyContactPhone: currentResident.emergencyContactPhone || "",
      occupation: currentResident.occupation || "",
      workAddress: currentResident.workAddress || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  // Generate resident QR code
  const generateResidentQR = () => {
    const qrData = JSON.stringify({
      type: "resident_entry",
      residentId: currentResident.id,
      residentName: currentResident.name,
      apartment: currentResident.apartment,
      phone: currentResident.phone,
      email: currentResident.email,
      familyMembers: currentResident.familyMembers,
      status: currentResident.status,
    });
    return qrData;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: {
        variant: "default" as const,
        label: "Active",
        color: "text-green-600",
      },
      Pending: {
        variant: "secondary" as const,
        label: "Pending",
        color: "text-yellow-600",
      },
      Suspended: {
        variant: "destructive" as const,
        label: "Suspended",
        color: "text-red-600",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    My Profile
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your personal information and QR code
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="qrcode">My QR Code</TabsTrigger>
              <TabsTrigger value="security">Security & KYC</TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentResident.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-blue-600">
                          <Home className="w-3 h-3 mr-1" />
                          {currentResident.apartment}
                        </Badge>
                        {getStatusBadge(currentResident.status)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm py-2">{currentResident.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm py-2">{currentResident.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm py-2">{currentResident.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Apartment</Label>
                      <p className="text-sm py-2">
                        {currentResident.apartment}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      {isEditing ? (
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              occupation: e.target.value,
                            })
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm py-2">
                          {currentResident.occupation || "Not specified"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Family Members</Label>
                      <p className="text-sm py-2">
                        {currentResident.familyMembers}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Contact Name</Label>
                        {isEditing ? (
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergencyContact: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        ) : (
                          <p className="text-sm py-2">
                            {currentResident.emergencyContact ||
                              "Not specified"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">
                          Contact Phone
                        </Label>
                        {isEditing ? (
                          <Input
                            id="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergencyContactPhone: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        ) : (
                          <p className="text-sm py-2">
                            {currentResident.emergencyContactPhone ||
                              "Not specified"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Work Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="workAddress">Work Address</Label>
                      {isEditing ? (
                        <Input
                          id="workAddress"
                          value={formData.workAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              workAddress: e.target.value,
                            })
                          }
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm py-2">
                          {currentResident.workAddress || "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QR Code Tab */}
            <TabsContent value="qrcode" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QRCodeDisplay
                  data={generateResidentQR()}
                  title="Resident Entry QR Code"
                  description={`Gate access code for ${currentResident.name}`}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Gate Entry</h4>
                          <p className="text-sm text-gray-600">
                            Use this QR code for quick entry at the main gate
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Identity Verification</h4>
                          <p className="text-sm text-gray-600">
                            Security can scan this to verify your identity
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Family Access</h4>
                          <p className="text-sm text-gray-600">
                            This code covers all family members in your
                            apartment
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            Important Notes
                          </h4>
                          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                            <li>
                              • Keep your QR code secure and don't share it
                            </li>
                            <li>
                              • Report lost or stolen QR codes immediately
                            </li>
                            <li>• Download a backup copy to your phone</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security & KYC Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & KYC Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>ID Document Type</Label>
                      <p className="text-sm py-2">
                        {currentResident.idDocumentType}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Document Number</Label>
                      <p className="text-sm py-2">
                        {currentResident.cnicNumber ||
                          currentResident.passportNumber ||
                          currentResident.driverLicenseNumber ||
                          "Not specified"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Ownership Type</Label>
                      <p className="text-sm py-2">
                        {currentResident.ownershipType}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Join Date</Label>
                      <p className="text-sm py-2">
                        {new Date(
                          currentResident.joinDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Approval Status</Label>
                      <div className="py-2">
                        {getStatusBadge(currentResident.approvalStatus)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Monthly Income</Label>
                      <p className="text-sm py-2">
                        {currentResident.monthlyIncome
                          ? `$${currentResident.monthlyIncome.toLocaleString()}`
                          : "Not disclosed"}
                      </p>
                    </div>
                  </div>

                  {currentResident.reference1Name && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-medium">References</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Reference 1</Label>
                            <p className="text-sm py-1">
                              {currentResident.reference1Name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {currentResident.reference1Phone}
                            </p>
                          </div>
                          {currentResident.reference2Name && (
                            <div className="space-y-2">
                              <Label>Reference 2</Label>
                              <p className="text-sm py-1">
                                {currentResident.reference2Name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {currentResident.reference2Phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {currentResident.additionalNotes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <p className="text-sm py-2 bg-gray-50 p-3 rounded">
                          {currentResident.additionalNotes}
                        </p>
                      </div>
                    </>
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

export default ResidentProfile;
