import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "@/contexts/AdminDataContext";
import {
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Calendar,
  Send,
  X,
  Image,
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
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import Cookies from "js-cookie";

const AdminComplaints = () => {
  const navigate = useNavigate();
  const { complaints, updateComplaintStatus, updateComplaintWithResponse } =
    useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [prod, setProd] = useState<any>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const getAuthToken = () => Cookies.get("authToken");
  // Filter and search logic

  let findProvider = async () => {
    const token = getAuthToken();
    const response = await axios.get(`${baseUrl}/residents/complaints/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response:", response.data);

    setProd(response.data.complaints)
  }

  console.log("response", prod)
  useEffect(() => {
    findProvider()
  }, [])

  // Real-time update mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleResponseClick = (complaint: any) => {
    setSelectedComplaint(complaint);
    setResponseText("");
    setIsResponseDialogOpen(true);
  };

  const handleResponseSubmit = async () => {
    if (!selectedComplaint || !responseText.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    setIsSubmittingResponse(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update complaint with admin response
      updateComplaintWithResponse(selectedComplaint.id, responseText.trim());

      toast.success(
        `Response sent to ${selectedComplaint.resident} successfully!`,
      );

      // Close dialog and reset state
      setIsResponseDialogOpen(false);
      setSelectedComplaint(null);
      setResponseText("");
    } catch (error) {
      toast.error("Failed to send response. Please try again.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleCloseResponseDialog = () => {
    setIsResponseDialogOpen(false);
    setSelectedComplaint(null);
    setResponseText("");
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Real-time statistics calculation
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalComplaints = complaints.length;
    const openComplaints = complaints.filter((c) => c.status === "Open").length;
    const inProgressComplaints = complaints.filter(
      (c) => c.status === "In Progress",
    ).length;
    const resolvedToday = complaints.filter(
      (c) =>
        c.status === "Resolved" &&
        c.timestamp >= today &&
        c.timestamp < tomorrow,
    ).length;

    return [
      {
        title: "Total Complaints",
        value: totalComplaints.toString(),
        icon: AlertTriangle,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
      {
        title: "Open Complaints",
        value: openComplaints.toString(),
        icon: Clock,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      {
        title: "In Progress",
        value: inProgressComplaints.toString(),
        icon: MessageSquare,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Resolved Today",
        value: resolvedToday.toString(),
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
    ];
  }, [complaints]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                  Complaint Management
                </h1>
                <p className="text-sm text-gray-500">
                  Review and respond to resident complaints
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Real-time Complaints Overview
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Live updates • Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`${stat.bgColor} p-3 rounded-lg mr-4`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 transition-all duration-300">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title, resident, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complaints Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Complaints Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prod.map((complaint) => (
                    <TableRow key={complaint?.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {complaint?.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {complaint?.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {complaint?.resident?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {complaint?.resident?.apartment}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint?.status)}>
                          {complaint?.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint?.priority)}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {moment(complaint?.createdAt).fromNow()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Complaint Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold">
                                    {complaint?.title}
                                  </h3>
                                  <div className="flex space-x-2">
                                    <Badge className={getStatusColor(complaint?.status)}>
                                      {complaint?.status}
                                    </Badge>
                                    <Badge className={getPriorityColor(complaint?.priority)}>
                                      {complaint?.priority}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Complaint ID:</strong> #{complaint?.id}
                                  </div>
                                  <div>
                                    <strong>Category:</strong> {complaint?.category}
                                  </div>
                                  <div>
                                    <strong>Resident:</strong> {complaint?.resident?.name}
                                  </div>
                                  <div>
                                    <strong>Apartment:</strong> {complaint?.resident?.apartment}
                                  </div>
                                  <div>
                                    <strong>Created:</strong> {moment(complaint?.createdAt).format('MMMM Do YYYY, h:mm a')}
                                  </div>
                                  <div>
                                    <strong>Last Updated:</strong> {moment(complaint?.updatedAt).fromNow()}
                                  </div>
                                </div>

                                <div>
                                  <strong>Description:</strong>
                                  <p className="mt-1 text-gray-700 whitespace-pre-line">
                                    {complaint?.complaintText}
                                  </p>
                                </div>

                                {complaint?.images?.length > 0 && (
                                  <div>
                                    <strong>Attached Images:</strong>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {complaint.images.map((image, index) => (
                                        <img
                                          key={index}
                                          src={image}
                                          alt={`Complaint image ${index + 1}`}
                                          className="rounded-md border object-cover h-40 w-full"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {complaint?.adminResponse && (
                                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <strong className="text-blue-800 block mb-2">
                                      Admin Response:
                                    </strong>
                                    <p className="text-blue-700 whitespace-pre-line">
                                      {complaint.adminResponse}
                                    </p>
                                    {complaint.responseDate && (
                                      <p className="text-xs text-blue-600 mt-2">
                                        Responded on: {moment(complaint.responseDate).format('MMMM Do YYYY, h:mm a')}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* <Button
                            variant="ghost"
                            size="sm"
                            title="Send Response to Resident"
                            onClick={() => handleResponseClick(complaint)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button> */}

                          {complaint.status === "Open" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              title="Mark as In Progress"
                              onClick={() =>
                                updateComplaintStatus(
                                  complaint.id,
                                  "In Progress",
                                )
                              }
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                          {complaint.status !== "Resolved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              title="Mark as Resolved"
                              onClick={() =>
                                updateComplaintStatus(complaint.id, "Resolved")
                              }
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Response to Resident</DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Complaint Details:
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Title:</strong> {selectedComplaint.title}
                  </p>
                  <p>
                    <strong>Resident:</strong> {selectedComplaint.resident} (
                    {selectedComplaint.apartment})
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedComplaint.status}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-text">Your Response Message</Label>
                <Textarea
                  id="response-text"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response message to the resident..."
                  className="min-h-[120px]"
                  disabled={isSubmittingResponse}
                />
                <p className="text-xs text-gray-500">
                  This message will be visible to the resident in their
                  complaint history.
                </p>
              </div>

              {selectedComplaint.adminResponse && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Previous Response:</strong>{" "}
                    {selectedComplaint.adminResponse}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Sent on: {selectedComplaint.responseDate}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCloseResponseDialog}
              disabled={isSubmittingResponse}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleResponseSubmit}
              disabled={isSubmittingResponse || !responseText.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmittingResponse ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminComplaints;
