import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  LogOut,
  Bell,
  Car,
  Truck,
  MessageSquare,
  DollarSign,
  Settings,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResident } from "@/contexts/ResidentContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { currentResident, logout } = useResident();
  const {
    getResidentComplaints,
    getResidentVehicles,
    getResidentServiceRequests,
    getResidentBills,
    announcements,
  } = useAdminData();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/home");
  };

  // Redirect if not authenticated
  if (!currentResident) {
    navigate("/resident/auth");
    return null;
  }

  // Get user-specific data
  const userComplaints = getResidentComplaints(currentResident.id);
  const userVehicles = getResidentVehicles(currentResident.id);
  const userServiceRequests = getResidentServiceRequests(currentResident.id);
  const userBills = getResidentBills(currentResident.id);

  // Calculate statistics
  const stats = {
    openComplaints: userComplaints.filter((c) => c.status === "Open").length,
    pendingServices: userServiceRequests.filter((s) => s.status === "Pending")
      .length,
    unpaidBills: userBills.filter((b) => b.status === "Pending").length,
    registeredVehicles: userVehicles.length,
  };

  const quickActions = [
    {
      title: "Lodge Complaint",
      description: "Report issues or concerns",
      icon: MessageSquare,
      color: "text-red-600",
      bgColor: "bg-red-50",
      route: "/resident/complaints",
      stats: `${stats.openComplaints} open`,
    },
    {
      title: "Request Service",
      description: "Book maintenance services",
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      route: "/resident/services",
      stats: `${stats.pendingServices} pending`,
    },
    {
      title: "Maintenance Bills",
      description: "View maintenance bills and payment status",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      route: "/resident/billing",
      stats: `${stats.unpaidBills} unpaid`,
    },
    {
      title: "Registered Vehicles",
      description: "Manage your vehicles",
      icon: Car,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      route: "/resident/vehicles",
      stats: `${stats.registeredVehicles} vehicles`,
    },
    {
      title: "Register Guest",
      description: "Register guests with QR codes",
      icon: UserPlus,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      route: "/resident/guests",
      stats: "Generate QR codes",
    },
    {
      title: "Register Delivery",
      description: "Register delivery persons",
      icon: Truck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      route: "/resident/delivery",
      stats: "Quick access",
    },
    {
      title: "Personal Information",
      description: "Update your profile",
      icon: HomeIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      route: "/resident/profile",
      stats: "Manage profile",
    },
  ];

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
      case "resolved":
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in progress":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
      case "resolved":
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
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
              <div className="bg-resident-gradient p-2 rounded-lg shadow-resident mr-3">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  Welcome, {currentResident.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentResident.apartment} •{" "}
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {announcements.length}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Personal Info Card */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                {currentResident.profilePhoto ? (
                  <img
                    src={currentResident.profilePhoto}
                    alt={currentResident.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <HomeIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {currentResident.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentResident.apartment}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Users className="w-4 h-4 mr-1" />
                        {currentResident.familyMembers} family members
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        {currentResident.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {currentResident.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Since {currentResident.joinDate}
                      </div>
                    </div>
                    <div>
                      <Badge
                        className={getStatusColor(currentResident.status)}
                        variant="outline"
                      >
                        {currentResident.status}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>Type:</strong> {currentResident.ownershipType}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Occupation:</strong>{" "}
                        {currentResident.occupation || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
                    onClick={() => handleQuickAction(action.route)}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`${action.bgColor} p-3 rounded-lg mb-4 w-fit`}
                      >
                        <Icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {action.description}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {action.stats}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Complaints */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MessageSquare className="w-5 h-5 mr-2 text-red-600" />
                  Recent Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userComplaints.length > 0 ? (
                  <div className="space-y-3">
                    {userComplaints.slice(0, 3).map((complaint) => (
                      <div
                        key={complaint.id}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {complaint.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {complaint.category} • {complaint.date}
                          </div>
                        </div>
                        <Badge className={getStatusColor(complaint.status)}>
                          <div className="flex items-center">
                            {getStatusIcon(complaint.status)}
                            <span className="ml-1">{complaint.status}</span>
                          </div>
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => navigate("/resident/complaints")}
                    >
                      View All Complaints
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No complaints yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate("/resident/complaints")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Lodge Complaint
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Requests */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userServiceRequests.length > 0 ? (
                  <div className="space-y-3">
                    {userServiceRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {request.serviceType}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.description.substring(0, 40)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.requestDate}
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          <div className="flex items-center">
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </div>
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => navigate("/resident/services")}
                    >
                      View All Requests
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No service requests</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate("/resident/services")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Request Service
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Society Announcements */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bell className="w-5 h-5 mr-2 text-purple-600" />
                Society Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {announcement.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {announcement.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <Badge variant="outline" className="mr-2">
                              {announcement.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {announcement.date}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            announcement.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No new announcements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ResidentDashboard;
