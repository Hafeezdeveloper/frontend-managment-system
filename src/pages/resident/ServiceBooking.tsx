import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Star,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  MapPin,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Image,
  User,
  Send,
  BookOpen,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useResident } from "@/contexts/ResidentContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";
import ChatDialog from "@/components/ChatDialog";
import ReviewDialog from "@/components/ReviewDialog";

interface ServiceProvider {
  id: string;
  name: string;
  profession: string;
  experience: number;
  rating: number;
  reviewCount: number;
  priceRange: string;
  availability: "available" | "busy" | "offline";
  phone: string;
  specialties: string[];
  description: string;
  completedJobs: number;
  responseTime: string;
  verified: boolean;
}

interface ServiceBooking {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  urgency: "low" | "medium" | "high" | "emergency";
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  cost: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  images: string[];
}

const ServiceBooking = () => {
  const navigate = useNavigate();
  const { currentResident } = useResident();
  const { serviceProviders, addServiceBooking, serviceBookings } =
    useAdminData();

  const [activeTab, setActiveTab] = useState("browse");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bookingForm, setBookingForm] = useState({
    providerId: "",
    serviceType: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
    urgency: "medium" as const,
    notes: "",
    images: [] as string[],
  });

  // Chat and Review dialogs
  const [showChat, setShowChat] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(
    null,
  );

  // Convert AdminDataContext service providers to ServiceBooking format
  const providers: ServiceProvider[] = serviceProviders
    .filter((sp) => sp.status === "Active") // Only show active providers
    .map((sp) => ({
      id: sp.id.toString(),
      name: sp.name,
      profession: sp.serviceCategory,
      experience: parseInt(sp.experience.replace(/[^0-9]/g, "") || "0"),
      rating: sp.rating || 0,
      reviewCount: sp.totalReviews || 0,
      priceRange: "$20-80", // Default price range
      availability: "available",
      phone: sp.phone,
      specialties: sp.keywords
        .split(",")
        .map((k) => k.trim())
        .slice(0, 3),
      description: sp.shortIntro,
      completedJobs: sp.completedJobs || 0,
      responseTime: "1 hour", // Default response time
      verified: true,
    }));

  // Filter bookings for current resident and convert to ServiceBooking format
  const myBookings: ServiceBooking[] = serviceBookings
    .filter((booking) => booking.residentId === currentResident.id)
    .map((booking) => ({
      id: booking.id.toString(),
      providerId: booking.serviceProviderId.toString(),
      providerName: booking.serviceProviderName,
      serviceType: booking.serviceCategory,
      description: booking.description,
      preferredDate: booking.scheduledDate,
      preferredTime: booking.scheduledTime,
      address: booking.apartment,
      urgency:
        booking.priority === "High"
          ? "high"
          : booking.priority === "Medium"
            ? "medium"
            : "low",
      status: booking.status.toLowerCase().replace(" ", "-") as any,
      cost: booking.actualCost || 0,
      createdAt: booking.bookingDate + "T10:00:00Z",
      updatedAt: booking.completionDate
        ? booking.completionDate + "T10:00:00Z"
        : booking.bookingDate + "T10:00:00Z",
      notes: booking.notes,
      images: [],
    }));

  if (!currentResident) {
    navigate("/resident/auth");
    return null;
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesCategory =
      selectedCategory === "all" || provider.profession === selectedCategory;
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const categories = [...new Set(providers.map((p) => p.profession))];

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!currentResident) {
        setError("Please login as a resident first");
        return;
      }

      if (!bookingForm.providerId) {
        setError("Please select a service provider");
        return;
      }

      if (!bookingForm.description.trim()) {
        setError("Please describe the service needed");
        return;
      }

      if (!bookingForm.preferredDate) {
        setError("Please select a preferred date");
        return;
      }

      const selectedProvider = serviceProviders.find(
        (sp) => sp.id.toString() === bookingForm.providerId,
      );

      if (!selectedProvider) {
        setError("Selected service provider not found");
        return;
      }

      const bookingData = {
        residentId: currentResident.id,
        residentName: currentResident.name,
        apartment: currentResident.apartment,
        serviceProviderId: parseInt(bookingForm.providerId),
        serviceProviderName: selectedProvider.name,
        serviceCategory: selectedProvider.serviceCategory,
        description: bookingForm.description.trim(),
        scheduledDate: bookingForm.preferredDate,
        scheduledTime: bookingForm.preferredTime || "09:00",
        status: "Pending" as const,
        priority:
          bookingForm.urgency === "emergency"
            ? "High"
            : bookingForm.urgency === "high"
              ? "High"
              : bookingForm.urgency === "medium"
                ? "Medium"
                : "Low",
        notes: bookingForm.notes,
        bookingDate: new Date().toISOString().split("T")[0],
      };

      addServiceBooking(bookingData);

      toast.success("Service booking submitted successfully!");
      setSuccess(
        "Your booking has been submitted. The service provider will contact you soon.",
      );

      // Reset form
      setBookingForm({
        providerId: "",
        serviceType: "",
        description: "",
        preferredDate: "",
        preferredTime: "",
        address: "",
        urgency: "medium",
        notes: "",
        images: [],
      });

      // Switch to bookings tab
      setActiveTab("bookings");
    } catch (error) {
      console.error("Booking error:", error);
      setError("Failed to submit booking. Please try again.");
      toast.error("Booking failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      accepted: { variant: "default" as const, label: "Accepted" },
      "in-progress": { variant: "default" as const, label: "In Progress" },
      completed: { variant: "default" as const, label: "Completed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      low: { variant: "secondary" as const, label: "Low Priority" },
      medium: { variant: "default" as const, label: "Medium Priority" },
      high: { variant: "destructive" as const, label: "High Priority" },
      emergency: { variant: "destructive" as const, label: "Emergency" },
    };

    const config =
      urgencyConfig[urgency as keyof typeof urgencyConfig] ||
      urgencyConfig.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleChatWithProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowChat(true);
  };

  const handleChatWithBookingProvider = (booking: ServiceBooking) => {
    const provider = providers.find((p) => p.name === booking.providerName);
    if (provider) {
      setSelectedProvider(provider);
      setShowChat(true);
    }
  };

  const handleLeaveReview = (booking: ServiceBooking) => {
    const provider = providers.find((p) => p.name === booking.providerName);
    if (provider) {
      setSelectedProvider(provider);
      setSelectedBooking(booking);
      setShowReview(true);
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
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Service Booking
                  </h1>
                  <p className="text-sm text-gray-500">
                    Book professional services for your home
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="browse">Browse Services</TabsTrigger>
              <TabsTrigger value="book">Book Service</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            </TabsList>

            {/* Browse Services Tab */}
            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search services or providers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-500 text-white">
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
                              {provider.profession}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            provider.availability === "available"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {provider.availability}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>
                            {provider.rating.toFixed(1)} ({provider.reviewCount}
                            )
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {provider.priceRange}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {provider.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{provider.experience}+ years exp</span>
                        <span>{provider.completedJobs} jobs completed</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setBookingForm({
                              ...bookingForm,
                              providerId: provider.id,
                              serviceType: provider.profession,
                            });
                            setActiveTab("book");
                          }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChatWithProvider(provider)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProviders.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No service providers found
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search criteria"
                        : "No active service providers available"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Book Service Tab */}
            <TabsContent value="book" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book a Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookService} className="space-y-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="provider">Service Provider *</Label>
                        <Select
                          value={bookingForm.providerId}
                          onValueChange={(value) =>
                            setBookingForm({
                              ...bookingForm,
                              providerId: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name} - {provider.profession}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="urgency">Priority</Label>
                        <Select
                          value={bookingForm.urgency}
                          onValueChange={(value: any) =>
                            setBookingForm({ ...bookingForm, urgency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">
                              Medium Priority
                            </SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Service Description *</Label>
                      <Textarea
                        id="description"
                        value={bookingForm.description}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the service you need..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="preferred-date">Preferred Date *</Label>
                        <Input
                          id="preferred-date"
                          type="date"
                          value={bookingForm.preferredDate}
                          onChange={(e) =>
                            setBookingForm({
                              ...bookingForm,
                              preferredDate: e.target.value,
                            })
                          }
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred-time">Preferred Time</Label>
                        <Input
                          id="preferred-time"
                          type="time"
                          value={bookingForm.preferredTime}
                          onChange={(e) =>
                            setBookingForm({
                              ...bookingForm,
                              preferredTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={bookingForm.notes}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Any additional information or special requirements..."
                        rows={2}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Booking Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.providerName} - {booking.serviceType}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Booking ID: {booking.id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(booking.status)}
                          {getUrgencyBadge(booking.urgency)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{booking.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">
                            {new Date(
                              booking.preferredDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <p className="font-medium">{booking.preferredTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">{booking.address}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <p className="font-medium">
                            {booking.cost > 0 ? `$${booking.cost}` : "TBD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChatWithBookingProvider(booking)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat with Provider
                        </Button>
                        {booking.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveReview(booking)}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                          </Button>
                        )}
                        {booking.status === "pending" && (
                          <Button variant="destructive" size="sm">
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {myBookings.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No bookings yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        You haven't made any service bookings yet
                      </p>
                      <Button
                        onClick={() => setActiveTab("browse")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Browse Services
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Chat Dialog */}
      {selectedProvider && (
        <ChatDialog
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedProvider(null);
          }}
          recipientId={selectedProvider.id}
          recipientName={selectedProvider.name}
          recipientType="service_provider"
          currentUserId={currentResident.id.toString()}
          currentUserName={currentResident.name}
          currentUserType="resident"
        />
      )}

      {/* Review Dialog */}
      {selectedProvider && selectedBooking && (
        <ReviewDialog
          isOpen={showReview}
          onClose={() => {
            setShowReview(false);
            setSelectedProvider(null);
            setSelectedBooking(null);
          }}
          serviceProviderId={parseInt(selectedProvider.id)}
          serviceProviderName={selectedProvider.name}
          serviceCategory={selectedProvider.profession}
          bookingId={parseInt(selectedBooking.id)}
          residentId={currentResident.id}
          residentName={currentResident.name}
        />
      )}
    </div>
  );
};

export default ServiceBooking;
