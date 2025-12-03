import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceProvider } from "@/contexts/ServiceProviderContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import {
  Calendar,
  Star,
  Users,
  Car,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin,
  LogOut,
  User,
  Briefcase,
  DollarSign,
  QrCode,
  Download,
  Share2,
  MessageSquare,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ChatDialog from "@/components/ChatDialog";
import { toast } from "sonner";

const ServiceProviderDashboard = () => {
  const navigate = useNavigate();
  const { currentServiceProvider, logout, isLoading } = useServiceProvider();
  const {
    getServiceProviderBookings,
    getServiceProviderReviews,
    getServiceProviderVehicles,
    updateBookingStatus,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("overview");
  const [showServiceQR, setShowServiceQR] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check authentication - wait for loading to complete
  useEffect(() => {
    if (!isLoading && !currentServiceProvider) {
      console.log("No service provider found, redirecting to auth");
      navigate("/service-provider/auth");
    }
  }, [currentServiceProvider, isLoading, navigate]);

  // Show loading while context is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, show loading (will redirect)
  if (!currentServiceProvider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const bookings = getServiceProviderBookings(currentServiceProvider.id);
  const reviews = getServiceProviderReviews(currentServiceProvider.id);
  const vehicles = getServiceProviderVehicles(currentServiceProvider.id);

  const pendingBookings = bookings.filter(
    (b) => b.status === "Pending" || b.status === "Confirmed",
  );
  const completedBookings = bookings.filter((b) => b.status === "Completed");
  const inProgressBookings = bookings.filter((b) => b.status === "In Progress");

  const totalEarnings = completedBookings.reduce(
    (sum, booking) => sum + (booking.actualCost || 0),
    0,
  );

  // Generate service provider QR code data
  const generateServiceQRData = () => {
    return {
      type: "service_provider_entry",
      serviceProviderId: currentServiceProvider.id,
      providerName: currentServiceProvider.name,
      serviceCategory: currentServiceProvider.serviceCategory,
      phone: currentServiceProvider.phone,
      status: currentServiceProvider.status,
    };
  };

  const handleAcceptBooking = (bookingId: number) => {
    updateBookingStatus(bookingId, "Confirmed");
    toast.success("Booking accepted successfully!");
  };

  const handleStartJob = (bookingId: number) => {
    updateBookingStatus(bookingId, "In Progress");
    toast.success("Job started!");
  };

  const handleCompleteJob = (bookingId: number, cost?: number) => {
    updateBookingStatus(bookingId, "Completed", cost);
    toast.success("Job completed successfully!");
  };

  const handleChatWithResident = (booking: any) => {
    setSelectedBooking(booking);
    setShowChat(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard refreshed!");
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusActions = (booking: any) => {
    switch (booking.status) {
      case "Pending":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAcceptBooking(booking.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateBookingStatus(booking.id, "Cancelled")}
            >
              Decline
            </Button>
          </div>
        );
      case "Confirmed":
        return (
          <Button
            size="sm"
            onClick={() => handleStartJob(booking.id)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Start Job
          </Button>
        );
      case "In Progress":
        return (
          <Button
            size="sm"
            onClick={() => handleCompleteJob(booking.id, 75)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Complete Job
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Service Provider Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {currentServiceProvider.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => setShowServiceQR(true)}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <QrCode className="w-4 h-4 mr-2" />
                My QR Code
              </Button>
              <Button
                onClick={logout}
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Account Status
                      </h2>
                      <p className="text-gray-600">
                        Your service provider account status
                      </p>
                    </div>
                    <Badge
                      variant={
                        currentServiceProvider.status === "Active"
                          ? "default"
                          : currentServiceProvider.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-lg py-2 px-4"
                    >
                      {currentServiceProvider.status}
                    </Badge>
                  </div>
                  {currentServiceProvider.status === "Pending" && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800">
                        Your account is pending admin approval. You'll be
                        notified once approved.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Total Bookings
                        </h3>
                        <p className="text-2xl font-bold text-gray-900">
                          {bookings.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Completed Jobs
                        </h3>
                        <p className="text-2xl font-bold text-gray-900">
                          {completedBookings.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Average Rating
                        </h3>
                        <p className="text-2xl font-bold text-gray-900">
                          {currentServiceProvider.rating?.toFixed(1) || "0.0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Total Earnings
                        </h3>
                        <p className="text-2xl font-bold text-gray-900">
                          ${totalEarnings}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => setActiveTab("bookings")}
                      variant="outline"
                      className="h-20 flex flex-col"
                    >
                      <Calendar className="w-6 h-6 mb-2" />
                      View Bookings
                      {pendingBookings.length > 0 && (
                        <Badge variant="destructive" className="mt-1">
                          {pendingBookings.length} pending
                        </Badge>
                      )}
                    </Button>
                    <Button
                      onClick={() => setActiveTab("vehicles")}
                      variant="outline"
                      className="h-20 flex flex-col"
                    >
                      <Car className="w-6 h-6 mb-2" />
                      Manage Vehicles
                      <span className="text-xs text-gray-500">
                        {vehicles.length} registered
                      </span>
                    </Button>
                    <Button
                      onClick={() =>
                        navigate("/service-provider/vehicles/register")
                      }
                      variant="outline"
                      className="h-20 flex flex-col"
                    >
                      <FileText className="w-6 h-6 mb-2" />
                      Register Vehicle
                    </Button>
                    <Button
                      onClick={() => setShowServiceQR(true)}
                      variant="outline"
                      className="h-20 flex flex-col"
                    >
                      <QrCode className="w-6 h-6 mb-2" />
                      My QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No bookings yet. Your bookings will appear here once
                      residents start booking your services.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">
                              {booking.residentName} - {booking.apartment}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.scheduledDate} at {booking.scheduledTime}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            {getStatusActions(booking)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={currentServiceProvider?.profilePhoto} />
                      <AvatarFallback className="text-2xl bg-green-500 text-white">
                        {currentServiceProvider?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {currentServiceProvider?.name}
                      </h2>
                      <p className="text-gray-600">
                        {currentServiceProvider.serviceCategory}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{currentServiceProvider.username}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{currentServiceProvider.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{currentServiceProvider.phone}</span>
                        </div>
                        {currentServiceProvider.serviceArea && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{currentServiceProvider.serviceArea}</span>
                        </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Service Information</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Category:
                          </span>
                          <p>{currentServiceProvider.serviceCategory}</p>
                        </div>
                        {currentServiceProvider.experience && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Experience:
                          </span>
                          <p>{currentServiceProvider.experience}</p>
                        </div>
                        )}
                        {currentServiceProvider.availability && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Availability:
                          </span>
                          <p>{currentServiceProvider.availability}</p>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {currentServiceProvider.shortIntro && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700">
                      {currentServiceProvider.shortIntro}
                    </p>
                  </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentServiceProvider?.keywords && currentServiceProvider.keywords.trim() ? (
                        currentServiceProvider.keywords
                        .split(",")
                        .map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword.trim()}
                          </Badge>
                          ))
                      ) : (
                        <p className="text-sm text-gray-500">No keywords available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No bookings yet
                      </h3>
                      <p className="text-gray-500">
                        Your service bookings will appear here once residents
                        start booking your services.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resident</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {booking.residentName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.apartment}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {booking.serviceCategory}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{booking.scheduledDate}</p>
                                <p className="text-sm text-gray-500">
                                  {booking.scheduledTime}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleChatWithResident(booking)
                                  }
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Chat
                                </Button>
                                {getStatusActions(booking)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-gray-500">
                        Customer reviews will appear here after completing
                        services.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                {review.residentName}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {review.serviceCategory}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Registered Vehicles</CardTitle>
                    <Button
                      onClick={() =>
                        navigate("/service-provider/vehicles/register")
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Register Vehicle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {vehicles.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No vehicles registered
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Register your service vehicles to get QR codes for gate
                        access.
                      </p>
                      <Button
                        onClick={() =>
                          navigate("/service-provider/vehicles/register")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Register Your First Vehicle
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicles.map((vehicle) => (
                        <Card key={vehicle.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Car className="w-6 h-6 text-blue-600" />
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
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                View QR Code
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Service Provider QR Code Dialog */}
      <Dialog open={showServiceQR} onOpenChange={setShowServiceQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Service Provider QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <QRCodeDisplay
              data={JSON.stringify(generateServiceQRData())}
              title="Service Provider QR Code"
              description="Use this QR code for gate entry access"
              size={256}
            />

            <div className="space-y-2">
              <h4 className="font-medium">QR Code Information:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Use this QR code for gate entry access</p>
                <p>• Security can scan this to verify your identity</p>
                <p>• Always carry this when visiting the premises</p>
                <p>• Contains your service provider details and status</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {selectedBooking && (
        <ChatDialog
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedBooking(null);
          }}
          recipientId={selectedBooking.residentId.toString()}
          recipientName={selectedBooking.residentName}
          recipientType="resident"
          currentUserId={currentServiceProvider.id.toString()}
          currentUserName={currentServiceProvider.name}
          currentUserType="service_provider"
        />
      )}
    </div>
  );
};

export default ServiceProviderDashboard;
