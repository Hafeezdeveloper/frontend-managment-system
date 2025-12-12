import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Download,
  Eye,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  FileText,
  Bell,
  Filter,
  Banknote,
  Building2,
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
import { Separator } from "@/components/ui/separator";
import { useResident } from "@/contexts/ResidentContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import Cookies from "js-cookie";
import axios from "axios";
import { baseUrl, getUserFromCookie } from "@/Helper/constants";

const MaintenanceBilling = () => {
  const navigate = useNavigate();
  const { currentResident } = useResident();
  const { getResidentBills, updateMaintenanceBillStatus } = useAdminData();

  const [activeTab, setActiveTab] = useState("current");
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [prod, setProd] = useState<any>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    overdueBills: 0,
    paidThisMonth: 0,
    totalBills: 0,
  });

  // Use API data (prod) instead of context data
  const userBills = prod;

  // Filter bills based on search and status
  const filteredBills = useMemo(() => {
    return userBills.filter((bill: any) => {
      const matchesSearch =
        bill.month?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.year?.toString().includes(searchTerm) ||
        bill.amount?.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || bill.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [userBills, searchTerm, statusFilter]);

  const currentBills = filteredBills.filter((bill: any) => bill.status?.toLowerCase() !== "paid");
  const paidBills = filteredBills.filter((bill: any) => bill.status?.toLowerCase() === "paid");

  // Redirect if not authenticated
  useEffect(() => {
    // If we already have a resident in context, nothing to do.
    if (currentResident) return;

    // If no resident in context, check for a token and decode role to avoid
    // redirecting logged-in residents on page refresh.
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/resident/auth");
      return;
    }


    // default fallback to resident auth
    navigate("/resident/auth");
  }, [currentResident, navigate]);

  const getBillStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBillStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status.toLowerCase() === "paid") return false;
    try {
      return new Date(dueDate) < new Date();
    } catch {
      return false;
    }
  };

  // Filter and search logic

  let findProvider = async () => {
    const authToken = Cookies.get("authToken") || localStorage.getItem("authToken");
    console.log("authToken:", authToken);
    let user: any = await getUserFromCookie()
    console.log(user, "User data")

    if (!user || !(user as any).id) {
      toast.error("User not authenticated. Please login again.");
      setLoader(false);
      return;
    }

    setLoader(true);
    try {
      const response = await axios.get(
        `${baseUrl}/v1/admin/maintenance/resident/${(user as any).id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("response data", response.data);

      // Format bills from API to match expected structure
      const bills = response.data?.data?.bills ?? [];
      const formattedBills = bills.map((bill: any) => ({
        id: bill._id,
        month: bill.month,
        year: bill.year,
        amount: bill.amount,
        dueDate: bill.dueDate,
        status: bill.status,
        paidDate: bill.paidDate,
        items: bill.items || [],
        generatedDate: bill.generatedDate,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
        type: bill.type,
        apartment: currentResident?.apartment || "N/A", // Add apartment from current resident
      }));

      setProd(formattedBills);
      console.log("prod" , prod)
      // Update statistics from API if available
      if (response.data?.data?.statistics) {
        setStats({
          totalOutstanding: response.data.data.statistics.totalOutstanding || 0,
          overdueBills: response.data.data.statistics.overdueBills || 0,
          paidThisMonth: response.data.data.statistics.paidThisMonth || 0,
          totalBills: response.data.data.statistics.totalBills || 0,
        });
      }
    } catch (err: any) {
      console.error("Error fetching bills:", err);
      toast.error(err.response?.data?.message || "Failed to fetch bills");
    } finally {
      setLoader(false);
    }
  };

  console.log("response", prod)
  useEffect(() => {
    findProvider()
  }, [])


  const handleViewBill = (bill: any) => {
    setSelectedBill(bill);
    setIsViewBillOpen(true);
  };
  const getAuthToken = () => Cookies.get("authToken") || localStorage.getItem("authToken");
  
  const handleMarkAsPaid = async (billId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      const response = await axios.put<any>(
        `${baseUrl}/v1/admin/maintenance/${billId}/request-resident-for-bill`,
        {
          status: "paid"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.success) {
        toast.success("Payment confirmation sent to admin. Bill will be marked as paid once verified.");
        // Refresh bills list
        findProvider();
      } else {
        toast.error(response.data?.message || "Failed to send payment request");
      }
    } catch (err: any) {
      console.error("Error marking bill as paid:", err);
      toast.error(err.response?.data?.message || "Failed to send payment request");
    }
  };

  if (!currentResident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
                  Maintenance Bills
                </h1>
                <p className="text-sm text-gray-500">
                  View and manage your maintenance bills for{" "}
                  {currentResident.apartment}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600">
                <Building2 className="w-4 h-4 mr-1" />
                {currentResident.apartment}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Outstanding
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalOutstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Overdue Bills
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.overdueBills}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Paid This Month
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.paidThisMonth}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Bills
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalBills}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Alert */}
          {stats.overdueBills > 0 && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                You have {stats.overdueBills} overdue bill(s) requiring
                immediate attention. Please contact the admin office to arrange
                payment.
              </AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by month, year, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bills Content */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-gray-200">
                  <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                    <TabsTrigger
                      value="current"
                      className="flex-1 py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Current Bills ({currentBills.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="flex-1 py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Payment History ({paidBills.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="current" className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pending Bills
                      </h3>
                      {stats.overdueBills > 0 && (
                        <Badge variant="destructive">
                          {stats.overdueBills} overdue
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {currentBills.map((bill) => {
                        const isOverdueBill = isOverdue(
                          bill.dueDate,
                          bill.status,
                        );
                        return (
                          <Card
                            key={bill.id}
                            className={`border ${isOverdueBill
                              ? "border-red-200 bg-red-50"
                              : "border-gray-200"
                              }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 bg-gray-100 rounded">
                                      <Receipt className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {bill.month} {bill.year} - Maintenance
                                        Bill
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Generated on{" "}
                                        {formatDate(bill.generatedDate)}
                                      </p>
                                    </div>
                                    <Badge
                                      className={getBillStatusColor(
                                        isOverdueBill ? "overdue" : bill.status,
                                      )}
                                    >
                                      {getBillStatusIcon(
                                        isOverdueBill ? "overdue" : bill.status,
                                      )}
                                      <span className="ml-1 capitalize">
                                        {isOverdueBill
                                          ? "Overdue"
                                          : bill.status}
                                      </span>
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">
                                        Amount:
                                      </span>
                                      <span className="ml-2 font-bold text-green-600">
                                        ${bill.amount.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Due Date:
                                      </span>
                                      <span
                                        className={`ml-2 font-medium ${isOverdueBill
                                          ? "text-red-600"
                                          : "text-gray-900"
                                          }`}
                                      >
                                        {formatDate(bill.dueDate)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Apartment:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {bill.apartment}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col space-y-2 ml-6">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewBill(bill)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                  </Button>
                                  {bill.type !== "request" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleMarkAsPaid(bill.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Banknote className="w-4 h-4 mr-1" />
                                      Mark as Paid
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {currentBills.length === 0 && (
                        <Card className="border border-gray-200">
                          <CardContent className="p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                              All Bills Paid
                            </h3>
                            <p className="text-gray-500">
                              You have no pending maintenance bills. Great job!
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment History
                    </h3>

                    <div className="grid gap-4">
                      {paidBills.map((bill) => (
                        <Card key={bill.id} className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="p-2 bg-green-100 rounded">
                                    <Receipt className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {bill.month} {bill.year} - Maintenance
                                      Bill
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Paid on{" "}
                                      {bill.paidDate
                                        ? formatDate(bill.paidDate)
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Paid
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      Amount:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      ${bill.amount.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Payment Date:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {bill.paidDate
                                        ? formatDate(bill.paidDate)
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Generated:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {formatDate(bill.generatedDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2 ml-6">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewBill(bill)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {paidBills.length === 0 && (
                        <Card className="border border-gray-200">
                          <CardContent className="p-12 text-center">
                            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                              No Payment History
                            </h3>
                            <p className="text-gray-500">
                              Your payment history will appear here once bills
                              are paid.
                            </p>
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

      {/* View Bill Dialog */}
      <Dialog open={isViewBillOpen} onOpenChange={setIsViewBillOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Maintenance Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Period:</span>{" "}
                    {selectedBill.month} {selectedBill.year}
                  </div>
                  <div>
                    <span className="font-medium">Apartment:</span>{" "}
                    {selectedBill.apartment}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span>{" "}
                    {formatDate(selectedBill.dueDate)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge className={getBillStatusColor(selectedBill.status)}>
                      {selectedBill.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span>{" "}
                    {formatDate(selectedBill.generatedDate)}
                  </div>
                  {selectedBill.paidDate && (
                    <div>
                      <span className="font-medium">Paid:</span>{" "}
                      {formatDate(selectedBill.paidDate)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Bill Items</h4>
                <div className="space-y-2">
                  {selectedBill.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-xs text-gray-500">{item.type}</div>
                      </div>
                      <div className="font-medium">
                        ${item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t font-bold">
                  <span>Total Amount:</span>
                  <span>${selectedBill.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Payment Instructions
                </h4>
                <p className="text-blue-700 text-sm">
                  To pay this bill, please contact the admin office or use the
                  "Mark as Paid" button after making payment offline. Online
                  payment is not available at this time.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsViewBillOpen(false)}
                >
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {selectedBill?.status !== "paid" && selectedBill?.type === "request" && (
                  <Button
                    onClick={() => {
                      handleMarkAsPaid(selectedBill.id);
                      setIsViewBillOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceBilling;
