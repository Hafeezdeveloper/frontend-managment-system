import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  IdCard,
  FileText,
  QrCode,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  idDocumentType: "CNIC" | "Passport" | "Driver License";
  cnicNumber?: string;
  passportNumber?: string;
  driverLicenseNumber?: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  joiningDate: string;
  employeeId: string;
  status: "Active" | "Inactive";
  registrationDate: string;
}

const AdminEmployeeRegistration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [registeredEmployees, setRegisteredEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Ahmed Khan",
      designation: "Security Guard",
      department: "Security",
      email: "ahmed.khan@example.com",
      phone: "+92-300-1234567",
      address: "123 Main Street, Karachi",
      idDocumentType: "CNIC",
      cnicNumber: "42101-1234567-8",
      emergencyContact: "Fatima Khan",
      emergencyContactPhone: "+92-300-7654321",
      joiningDate: "2024-01-15",
      employeeId: "EMP001",
      status: "Active",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      designation: "Maintenance Supervisor",
      department: "Maintenance",
      email: "maria.rodriguez@example.com",
      phone: "+92-301-2345678",
      address: "456 Oak Avenue, Lahore",
      idDocumentType: "CNIC",
      cnicNumber: "35202-2345678-9",
      emergencyContact: "Carlos Rodriguez",
      emergencyContactPhone: "+92-301-8765432",
      joiningDate: "2024-02-01",
      employeeId: "EMP002",
      status: "Active",
      registrationDate: "2024-02-01",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    department: "",
    email: "",
    phone: "",
    address: "",
    idDocumentType: "CNIC" as const,
    cnicNumber: "",
    passportNumber: "",
    driverLicenseNumber: "",
    emergencyContact: "",
    emergencyContactPhone: "",
    joiningDate: "",
  });

  const designations = [
    "Security Guard",
    "Maintenance Supervisor",
    "Maintenance Worker",
    "Cleaning Staff",
    "Gate Keeper",
    "Electrician",
    "Plumber",
    "Gardener",
    "Administration Officer",
    "Receptionist",
  ];

  const departments = [
    "Security",
    "Maintenance",
    "Cleaning",
    "Administration",
    "Operations",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError("");
    setSuccess(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Employee name is required";
    if (!formData.designation.trim()) return "Designation is required";
    if (!formData.department.trim()) return "Department is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.address.trim()) return "Address is required";
    if (!formData.emergencyContact.trim())
      return "Emergency contact name is required";
    if (!formData.emergencyContactPhone.trim())
      return "Emergency contact phone is required";
    if (!formData.joiningDate) return "Joining date is required";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Validate ID document
    if (formData.idDocumentType === "CNIC" && !formData.cnicNumber.trim()) {
      return "CNIC number is required";
    }
    if (
      formData.idDocumentType === "Passport" &&
      !formData.passportNumber.trim()
    ) {
      return "Passport number is required";
    }
    if (
      formData.idDocumentType === "Driver License" &&
      !formData.driverLicenseNumber.trim()
    ) {
      return "Driver license number is required";
    }

    // Check for duplicate email
    const duplicate = registeredEmployees.find(
      (emp) => emp.email.toLowerCase() === formData.email.toLowerCase(),
    );
    if (duplicate) {
      return "An employee with this email is already registered";
    }

    return null;
  };

  const generateEmployeeQR = (employee: Employee) => {
    const qrData = {
      type: "employee_entry",
      employeeId: employee.employeeId,
      employeeName: employee.name,
      designation: employee.designation,
      department: employee.department,
      status: employee.status,
      registrationDate: employee.registrationDate,
    };
    return JSON.stringify(qrData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Generate employee ID
      const employeeId = `EMP${String(registeredEmployees.length + 1).padStart(3, "0")}`;

      const newEmployee: Employee = {
        id: Date.now(),
        ...formData,
        employeeId,
        status: "Active",
        registrationDate: new Date().toISOString().split("T")[0],
      };

      // Add to registered employees
      setRegisteredEmployees((prev) => [...prev, newEmployee]);

      // Generate QR code
      const newQR = generateEmployeeQR(newEmployee);
      setQrCode(newQR);

      setSuccess(true);
      setActiveTab("qr");

      // Reset form
      setFormData({
        name: "",
        designation: "",
        department: "",
        email: "",
        phone: "",
        address: "",
        idDocumentType: "CNIC",
        cnicNumber: "",
        passportNumber: "",
        driverLicenseNumber: "",
        emergencyContact: "",
        emergencyContactPhone: "",
        joiningDate: "",
      });

      toast.success(
        `Employee ${newEmployee.name} registered successfully with ID: ${employeeId}`,
      );
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to register employee. Please try again.");
      toast.error("Failed to register employee");
    } finally {
      setIsLoading(false);
    }
  };

  const getIdDocumentField = () => {
    switch (formData.idDocumentType) {
      case "CNIC":
        return (
          <Input
            type="text"
            placeholder="e.g., 42101-1234567-8"
            value={formData.cnicNumber}
            onChange={(e) => handleInputChange("cnicNumber", e.target.value)}
          />
        );
      case "Passport":
        return (
          <Input
            type="text"
            placeholder="e.g., AB1234567"
            value={formData.passportNumber}
            onChange={(e) =>
              handleInputChange("passportNumber", e.target.value)
            }
          />
        );
      case "Driver License":
        return (
          <Input
            type="text"
            placeholder="e.g., DL123456789"
            value={formData.driverLicenseNumber}
            onChange={(e) =>
              handleInputChange("driverLicenseNumber", e.target.value)
            }
          />
        );
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  Employee Registration
                </h1>
                <p className="text-sm text-gray-500">
                  Register employees with KYC verification and generate QR codes
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-teal-600">
              <UserPlus className="w-4 h-4 mr-1" />
              {registeredEmployees.length} Employees
            </Badge>
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
                      Register Employee
                    </TabsTrigger>
                    <TabsTrigger
                      value="qr"
                      className="flex-1 py-4 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generated QR Code
                    </TabsTrigger>
                    <TabsTrigger
                      value="employees"
                      className="flex-1 py-4 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Registered Employees ({registeredEmployees.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Registration Form Tab */}
                <TabsContent value="register" className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Basic Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <User className="w-5 h-5 mr-2" />
                            Basic Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Full Name *</Label>
                              <Input
                                id="name"
                                type="text"
                                placeholder="Enter employee full name"
                                value={formData.name}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="employee@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="phone">Phone Number *</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+92-300-1234567"
                                value={formData.phone}
                                onChange={(e) =>
                                  handleInputChange("phone", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="joiningDate">
                                Joining Date *
                              </Label>
                              <Input
                                id="joiningDate"
                                type="date"
                                value={formData.joiningDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "joiningDate",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                              id="address"
                              placeholder="Enter complete address"
                              value={formData.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Job Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <Briefcase className="w-5 h-5 mr-2" />
                            Job Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="designation">Designation *</Label>
                              <Select
                                value={formData.designation}
                                onValueChange={(value) =>
                                  handleInputChange("designation", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                                <SelectContent>
                                  {designations.map((designation) => (
                                    <SelectItem
                                      key={designation}
                                      value={designation}
                                    >
                                      {designation}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="department">Department *</Label>
                              <Select
                                value={formData.department}
                                onValueChange={(value) =>
                                  handleInputChange("department", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departments.map((department) => (
                                    <SelectItem
                                      key={department}
                                      value={department}
                                    >
                                      {department}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* KYC Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <IdCard className="w-5 h-5 mr-2" />
                            KYC Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="idDocumentType">
                                ID Document Type *
                              </Label>
                              <Select
                                value={formData.idDocumentType}
                                onValueChange={(value: any) =>
                                  handleInputChange("idDocumentType", value)
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
                              <Label htmlFor="idNumber">
                                {formData.idDocumentType} Number *
                              </Label>
                              {getIdDocumentField()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Emergency Contact */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-teal-600">
                            <Phone className="w-5 h-5 mr-2" />
                            Emergency Contact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="emergencyContact">
                                Contact Name *
                              </Label>
                              <Input
                                id="emergencyContact"
                                type="text"
                                placeholder="Emergency contact name"
                                value={formData.emergencyContact}
                                onChange={(e) =>
                                  handleInputChange(
                                    "emergencyContact",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="emergencyContactPhone">
                                Contact Phone *
                              </Label>
                              <Input
                                id="emergencyContactPhone"
                                type="tel"
                                placeholder="+92-300-1234567"
                                value={formData.emergencyContactPhone}
                                onChange={(e) =>
                                  handleInputChange(
                                    "emergencyContactPhone",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
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
                            Employee registered successfully! QR code generated.
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
                              Register Employee
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
                    {qrCode ? (
                      <QRCodeDisplay
                        data={qrCode}
                        title="Employee Access QR Code"
                        description="Present this QR code at the gate for employee entry"
                        size={300}
                      />
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            No QR Code Generated
                          </h3>
                          <p className="text-gray-500">
                            Register an employee to generate their QR code.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Employees List Tab */}
                <TabsContent value="employees" className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Registered Employees
                      </h3>
                      <Badge variant="outline" className="text-teal-600">
                        {registeredEmployees.length} Total
                      </Badge>
                    </div>

                    <div className="grid gap-4">
                      {registeredEmployees.map((employee) => (
                        <Card
                          key={employee.id}
                          className="border border-gray-200"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="p-2 bg-teal-100 rounded">
                                    <User className="w-5 h-5 text-teal-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {employee.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {employee.designation} -{" "}
                                      {employee.department}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ID: {employee.employeeId}
                                    </p>
                                  </div>
                                  <Badge
                                    className={getStatusColor(employee.status)}
                                  >
                                    {employee.status}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      Email:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {employee.email}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Phone:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {employee.phone}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Joined:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {new Date(
                                        employee.joiningDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2 ml-6">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setQrCode(generateEmployeeQR(employee));
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
                      ))}

                      {registeredEmployees.length === 0 && (
                        <Card className="border border-gray-200">
                          <CardContent className="p-12 text-center">
                            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                              No Employees Registered
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Start by registering the first employee.
                            </p>
                            <Button
                              onClick={() => setActiveTab("register")}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              Register First Employee
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

export default AdminEmployeeRegistration;
