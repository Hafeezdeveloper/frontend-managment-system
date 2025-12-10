import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Calendar,
  Eye,
  MoreVertical,
  UserCheck,
  UserX,
  Pause,
  Activity,
  Briefcase,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminData } from "@/contexts/AdminDataContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { GetApi, PostApi } from "@/Helper/ApiHandle/BsApiHandle";
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import Cookies from "js-cookie";

const ServiceProviderStatus = ["pending", "approved", "rejected"];

const AdminServiceProviders = () => {
  const navigate = useNavigate();
  const {
    serviceProviders,
    approveServiceProvider,
    rejectServiceProvider,
    updateServiceProvider,
    getServiceProviderBookings,
    getServiceProviderReviews,
  } = useAdminData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [prod, setProd] = useState<any>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loader, setLoader] = useState(false);

  const getAuthToken = () => Cookies.get("authToken");
  // Filter and search logic

  let findProvider = async () => {
    setLoader(true)
    const token = getAuthToken();
    const response = await axios.get(
      `${baseUrl}/v1/admin/service-providers/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    setLoader(false)
    setProd(response.data.data.serviceProviders)
  }

  console.log("response", prod)
  useEffect(() => {
    findProvider()
  }, [])

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(serviceProviders.map((p) => p.serviceCategory)),
    ];
    return uniqueCategories;
  }, [serviceProviders]);

  // Statistics
  const stats = useMemo(() => {
    const total = serviceProviders.length;
    const pending = serviceProviders.filter(
      (p) => p.status === "Pending",
    ).length;
    const active = serviceProviders.filter((p) => p.status === "Active").length;
    const rejected = serviceProviders.filter(
      (p) => p.status === "Rejected",
    ).length;
    const suspended = serviceProviders.filter(
      (p) => p.status === "Suspended",
    ).length;
    const avgRating =
      serviceProviders.length > 0
        ? serviceProviders.reduce((sum, p) => sum + (p.rating || 0), 0) /
        serviceProviders.length
        : 0;

    return { total, pending, active, rejected, suspended, avgRating };
  }, [serviceProviders]);
  const handleUpdateStatus = async (id: any, status: any) => {
    // Payload being sent to API
    const payload = { status };
    console.log("Payload being sent:", payload);
    console.log("Service Provider ID:", id);
    console.log("Status:", status);
    
    const token = getAuthToken();
    const response = await axios.put<any>(
      `${baseUrl}/v1/admin/service-providers/${id}/approval`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    toast.success(`Service provider ${status?.toLowerCase()} successfully`)
    findProvider()
  }

  const handleStatusChange = (providerId: number, newStatus: string) => {
    console.log("New Status:", newStatus);
    // Map UI status to API status based on ServiceProviderStatus constant
    if (newStatus === "Active") {
      handleUpdateStatus(providerId, ServiceProviderStatus[1]); // "approved"
    } else if (newStatus === "Rejected") {
      handleUpdateStatus(providerId, ServiceProviderStatus[2]); // "rejected"
    } else if (newStatus === "Suspended") {
      handleUpdateStatus(providerId, ServiceProviderStatus[3]);
    }
  };

  const getStatusBadge = (status: string) => {
    console.log("status", status)
    const statusConfig = {
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      active: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      approved: {
        variant: "" as const,
        icon: UserCheck,
        color: "text-green-600",
      },
      rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
      suspended: {
        variant: "outline" as const,
        icon: Pause,
        color: "text-orange-600",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const openDetails = (provider: any) => {
    // If dialog is open, close it first
    if (showDetails) {
      setShowDetails(false);
      setSelectedProvider(null);
      // Wait for dialog to unmount, then open with new provider
      setTimeout(() => {
        setSelectedProvider(provider);
        setShowDetails(true);
      }, 150);
    } else {
      // Set provider first (this will mount the Dialog), then open it
      setSelectedProvider(provider);
      // Small delay to ensure Dialog is mounted
      setTimeout(() => {
        setShowDetails(true);
      }, 10);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setShowDetails(open);
    if (!open) {
      // Reset selected provider after dialog closes
      setTimeout(() => {
        setSelectedProvider(null);
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <Toaster />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <div className="bg-admin-gradient p-2 rounded-lg shadow-admin mr-3">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-gray-900">
                    Service Provider Management
                  </h1>
                  <p className="text-sm text-gray-500">
                    Approve, manage and monitor service providers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Statistics Cards */}




          {/* Service Providers List */}  
          {loader ? ( <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
          </div>) : (       
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {prod.map((provider) => (
              <Card
                key={provider.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={provider.profilePhoto} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {provider.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{provider.username}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetails(provider)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {provider?.status?.toLowerCase() === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(provider.id, "Active")
                              }
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(provider.id, "Rejected")
                              }
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {provider?.status === "active" || provider.status === "approved" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(provider.id, "suspended")
                            }
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {provider.status === "suspended" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(provider.id, "active")
                            }
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(provider.status)}
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {provider.rating?.toFixed(1) || "0.0"} (
                      {provider.totalReviews || 0})
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {provider.serviceCategory}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {provider.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {provider.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined{" "}
                      {new Date(provider.registrationDate).toLocaleDateString()}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed Jobs:</span>
                    <span className="font-medium">
                      {provider.completedJobs || 0}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {provider.shortIntro}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDetails(provider)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {provider.status?.toLowerCase() === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(provider.id, "Active")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(provider.id, "Rejected")
                          }
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

        </div>
      </main>

      {/* Details Dialog */}
      {selectedProvider && (
        <Dialog open={showDetails} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDialogClose(false)}
              className="rounded-full h-8 w-8 p-0"
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedProvider?.profilePhoto} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {selectedProvider?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selectedProvider?.name} - Service Provider Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the service provider
            </DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="text-sm">{selectedProvider.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Username
                      </label>
                      <p className="text-sm">@{selectedProvider.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-sm">{selectedProvider.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="text-sm">{selectedProvider.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Registration Date
                      </label>
                      <p className="text-sm">
                        {new Date(
                          selectedProvider.registrationDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center gap-1" >
                        {getStatusBadge(selectedProvider.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    KYC Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID Document Type
                      </label>
                      <p className="text-sm">
                        {selectedProvider.idDocumentType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID Number
                      </label>
                      <p className="text-sm">
                        {selectedProvider.cnicNumber ||
                          selectedProvider.passportNumber ||
                          selectedProvider.driverLicenseNumber ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Service Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Service Category
                      </label>
                      <p className="text-sm">
                        {selectedProvider.serviceCategory}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Keywords
                      </label>
                      <p className="text-sm">{selectedProvider.keywords}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Service Area
                      </label>
                      <p className="text-sm">{selectedProvider.serviceArea}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Availability
                      </label>
                      <p className="text-sm">{selectedProvider.availability}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Professional Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Experience
                      </label>
                      <p className="text-sm">{selectedProvider.experience}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Previous Work
                      </label>
                      <p className="text-sm">
                        {selectedProvider.previousWork || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Certifications
                      </label>
                      <p className="text-sm">
                        {selectedProvider.certifications || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description and Notes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Description & Notes</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Short Introduction
                    </label>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {selectedProvider.shortIntro}
                    </p>
                  </div>
                  {selectedProvider.additionalNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Additional Notes
                      </label>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {selectedProvider.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedProvider.completedJobs || 0}
                    </div>
                    <div className="text-sm text-gray-500">Completed Jobs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedProvider.totalReviews || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Reviews</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedProvider.rating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {getServiceProviderBookings(selectedProvider.id).length}
                    </div>
                    <div className="text-sm text-gray-500">Total Bookings</div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              {selectedProvider.status === "Pending" && (
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedProvider.id, "Active");
                      handleDialogClose(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approve Service Provider
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusChange(selectedProvider.id, "Rejected");
                      handleDialogClose(false);
                    }}
                    className="flex-1"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
};

export default AdminServiceProviders;
