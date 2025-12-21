import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  Home,
  X,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  CreditCard,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  AlertCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateUniqueId } from "@/lib/utils";
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import Cookies from "js-cookie";

const AdminResidents = () => {
  const navigate = useNavigate();
  const {
    residents,
    addResident,
    updateResident,
    deleteResident,
    approveResident,
    rejectResident,
  } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [prod, setProd] = useState<any>([]);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    status: "",
    familyMembers: 0,
  });
  const [addForm, setAddForm] = useState({
    name: "",
    apartment: "",
    phone: "",
    email: "",
    status: "Active",
    familyMembers: 1,
  });

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || resident.status.toLowerCase() === statusFilter;

    const matchesApproval =
      approvalFilter === "all" ||
      resident.approvalStatus.toLowerCase() === approvalFilter;

    return matchesSearch && matchesStatus && matchesApproval;
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalResidents = residents.length;
    const activeResidents = residents.filter(
      (r) => r.status === "Active",
    ).length;
    const pendingResidents = residents.filter(
      (r) => r.status === "pending",
    ).length;
    const pendingApprovals = residents.filter(
      (r) => r.approvalStatus === "pending",
    ).length;

    return {
      totalResidents,
      activeResidents,
      pendingResidents,
      pendingApprovals,
    };
  }, [residents]);

  const getAuthToken = () => Cookies.get("authToken");
  // Filter and search logic

  let findProvider = async () => {
    const token = getAuthToken();
    const response = await axios.get(`${baseUrl}/v1/admin/resident`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response:", response.data);

    setProd(response.data.data.residents)
  }

  console.log("response", prod)
  useEffect(() => {
    findProvider()
  }, [])

  // Handler functions
  const handleViewResident = (resident: any) => {
    setSelectedResident(resident);
    setIsViewDialogOpen(true);
  };

  const handleEditResident = (resident: any) => {
    setSelectedResident(resident);
    setEditForm({
      name: resident.name,
      phone: resident.phone,
      email: resident.email,
      status: resident.status,
      familyMembers: resident.familyMembers,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteResident = (resident: any) => {
    deleteResident(resident.id);
    toast.success(`Deleted resident: ${resident.name}`);
  };

  const handleUpdateStatus = async (id: any, status: any) => {
    console.log(status)
    const token = getAuthToken();
    const response = await axios.put<any>(
      `${baseUrl}/v1/admin/resident/${id}/approval`,
      { approvalStatus: status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    toast.success(`residents  ${status?.toLowerCase()} successfully`)
    findProvider()
  }

  const handleApproveResident = async (newStatus: any, resident: any) => {
    console.log("awdwd",newStatus)
    // approveResident(resident.id);
    // toast.success(`approved resident: ${resident.name}`);
    await  handleUpdateStatus(newStatus.id, "approved");
  };

  const handleRejectResident = (resident: any) => {
    handleUpdateStatus(resident.id, "rejected");
  };

  const handleSaveEdit = () => {
    if (!selectedResident) return;

    updateResident(selectedResident.id, {
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      status: editForm.status,
      familyMembers: editForm.familyMembers,
    });

    setSelectedResident((prev: any) =>
      prev
        ? {
          ...prev,
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email,
          status: editForm.status,
          familyMembers: editForm.familyMembers,
        }
        : null,
    );

    setIsEditDialogOpen(false);
    toast.success(`Successfully updated resident: ${editForm.name}`);
  };

  const handleAddResident = () => {
    if (
      !addForm.name ||
      !addForm.apartment ||
      !addForm.phone ||
      !addForm.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newResident = {
      name: addForm.name,
      apartment: addForm.apartment,
      phone: addForm.phone,
      email: addForm.email,
      status: addForm.status,
      familyMembers: addForm.familyMembers,
      joinDate: new Date().toISOString().split("T")[0],
      approvalStatus: "approved" as const,
      idDocumentType: "CNIC" as const,
      ownershipType: "owner" as const,
    };

    addResident(newResident);

    setAddForm({
      name: "",
      apartment: "",
      phone: "",
      email: "",
      status: "Active",
      familyMembers: 1,
    });
    setIsAddDialogOpen(false);
    toast.success(`Successfully added new resident: ${newResident.name}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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
                  Resident Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage resident profiles and applications
                </p>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Resident
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Residents
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalResidents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Residents
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeResidents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingApprovals}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      pending Status
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingResidents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Residents Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Residents Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Approval Status</TableHead>
                    <TableHead>Ownership</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prod.map((resident) => (
                    <TableRow key={`resident-${resident.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {resident.profilePhoto ? (
                            <img
                              src={resident.profilePhoto}
                              alt={resident.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {resident.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {resident.apartment} • {resident.familyMembers}{" "}
                              members
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            {resident.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {resident.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {resident.idDocumentType}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {resident.occupation || "Not provided"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getApprovalColor(resident.approvalStatus)}
                        >
                          <div className="flex items-center">
                            {getApprovalIcon(resident.approvalStatus)}
                            <span className="ml-1">
                              {resident.approvalStatus}
                            </span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {resident.ownershipType || "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {resident.appliedDate || resident.joinDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResident(resident)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditResident(resident)}
                            title="Edit Resident"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {resident.approvalStatus === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleApproveResident(resident)}
                                title="Approve Application"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleRejectResident(resident)}
                                title="Reject Application"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                title="Delete Resident"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Resident
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  {resident.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteResident(resident)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* View Resident Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
            <DialogDescription>
              Complete KYC and personal information
            </DialogDescription>
          </DialogHeader>
          {selectedResident && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                      {selectedResident.profilePhoto ? (
                        <img
                          src={selectedResident.profilePhoto}
                          alt={selectedResident.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">
                          {selectedResident.name}
                        </h3>
                        <p className="text-gray-600">
                          {selectedResident.apartment}
                        </p>
                        <Badge
                          className={getApprovalColor(
                            selectedResident.approvalStatus,
                          )}
                        >
                          {selectedResident.approvalStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedResident.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedResident.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {selectedResident.familyMembers} family members
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KYC Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        ID Document Type
                      </Label>
                      <div className="flex items-center mt-1">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedResident.idDocumentType}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        ID Number
                      </Label>
                      <div className="mt-1">
                        <span className="font-mono">
                          {selectedResident.cnicNumber ||
                            selectedResident.passportNumber ||
                            selectedResident.driverLicenseNumber ||
                            "Not provided"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Ownership Type
                      </Label>
                      <div className="flex items-center mt-1">
                        <Home className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {selectedResident.ownershipType || "Not specified"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Occupation
                      </Label>
                      <div className="flex items-center mt-1">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {selectedResident.occupation || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Emergency & Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Emergency Contact
                      </Label>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {selectedResident.emergencyContact ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {selectedResident.emergencyContactPhone ||
                              "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Work Information
                      </Label>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm">
                            {selectedResident.workAddress || "Not provided"}
                          </span>
                        </div>
                        {selectedResident.monthlyIncome && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            <span>
                              ${selectedResident.monthlyIncome.toLocaleString()}
                              /month
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* References & Additional Info */}
              {(selectedResident.reference1Name ||
                selectedResident.previousAddress ||
                selectedResident.additionalNotes) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedResident.previousAddress && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Previous Address
                            </Label>
                            <p className="text-sm mt-1">
                              {selectedResident.previousAddress}
                            </p>
                          </div>
                        )}

                        {(selectedResident.reference1Name ||
                          selectedResident.reference2Name) && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">
                                References
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {selectedResident.reference1Name && (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                      {selectedResident.reference1Name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {selectedResident.reference1Phone}
                                    </div>
                                  </div>
                                )}
                                {selectedResident.reference2Name && (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                      {selectedResident.reference2Name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {selectedResident.reference2Phone}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {selectedResident.additionalNotes && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Additional Notes
                            </Label>
                            <p className="text-sm mt-1">
                              {selectedResident.additionalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Action Buttons */}
              {selectedResident.approvalStatus === "pending" || selectedResident.approvalStatus === "pending" && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      handleRejectResident(selectedResident);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproveResident(selectedResident);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Activate
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Resident Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogDescription>Update resident information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-family">Family Members</Label>
              <Input
                id="edit-family"
                type="number"
                min="1"
                value={editForm.familyMembers}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    familyMembers: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Resident Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Resident</DialogTitle>
            <DialogDescription>
              Add a resident directly (bypasses application process)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="add-apartment">Apartment *</Label>
              <Input
                id="add-apartment"
                value={addForm.apartment}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, apartment: e.target.value }))
                }
                placeholder="A-101"
              />
            </div>
            <div>
              <Label htmlFor="add-phone">Phone *</Label>
              <Input
                id="add-phone"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 234-567-8901"
              />
            </div>
            <div>
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="add-status">Status</Label>
              <Select
                value={addForm.status}
                onValueChange={(value) =>
                  setAddForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-family">Family Members</Label>
              <Input
                id="add-family"
                type="number"
                min="1"
                value={addForm.familyMembers}
                onChange={(e) =>
                  setAddForm((prev) => ({
                    ...prev,
                    familyMembers: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResident}>Add Resident</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResidents;
