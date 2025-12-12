import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Calculator,
  FileText,
  Download,
  Send,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import Cookies from "js-cookie";

interface MaintenanceBill {
  id: number;
  _id: string;
  resident: string;
  apartment: string;
  month: string;
  year: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  generatedDate: string;
  paidDate?: string;
  items: BillItem[];
  type: string;
}

interface BillItem {
  id: number;
  description: string;
  amount: number;
  type: "Fixed" | "Variable" | "One-time";
}

const AdminMaintenance = () => {
  const navigate = useNavigate();
  const {
    residents,
    maintenanceBills,
    addMultipleMaintenanceBills,
    updateMaintenanceBillStatus,
  } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerateBillOpen, setIsGenerateBillOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(
    null,
  );
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<MaintenanceBill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getAuthToken = () => Cookies.get("authToken");
  const [billForm, setBillForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: "",
    items: [
      {
        description: "Maintenance Charge",
        amount: 1500,
        type: "Fixed" as const,
      },
      { description: "Parking Fee", amount: 500, type: "Fixed" as const },
      { description: "Security Charge", amount: 300, type: "Fixed" as const },
      { description: "Utility Charge", amount: 200, type: "Variable" as const },
    ],
  });

  const mapApiBillToUiBill = (apiBill: any, index: number): MaintenanceBill => {
    const monthNumber = Number(apiBill.month);
    const monthName = isNaN(monthNumber)
      ? apiBill.month
      : new Date(2024, monthNumber - 1).toLocaleString("default", {
        month: "long",
      });

    const mapStatus = (status: string): MaintenanceBill["status"] => {
      const upper = status.toLocaleLowerCase()
      if (upper === "paid") return "paid";
      if (upper === "overdue") return "overdue";
      return "pending";
    };

    return {
      id: index + 1,
      _id: apiBill._id,
      resident: apiBill.residentId?.name || "Unknown",
      apartment: apiBill.residentId?.apartment || "",
      month: monthName,
      year: apiBill.year,
      amount: apiBill.amount,
      dueDate: new Date(apiBill.dueDate).toISOString().split("T")[0],
      status: mapStatus(apiBill.status),
      generatedDate: apiBill.generatedDate
        ? new Date(apiBill.generatedDate).toISOString().split("T")[0]
        : "",
      paidDate: apiBill.paidDate
        ? new Date(apiBill.paidDate).toISOString().split("T")[0]
        : undefined,
      items: (apiBill.items || []).map((item: any, idx: number) => ({
        id: idx + 1,
        description: item.description,
        amount: item.amount,
        // Backend doesn't give type, default to Fixed

      })),
      type: apiBill.type,
    };
  };

  let findProvider = async () => {
    try {
      const token = getAuthToken();

      const mapFilterStatusToApi = (status: string): string | undefined => {
        const lower = status.toLowerCase();
        if (lower === "paid") return "paid";
        if (lower === "overdue") return "overdue";
        if (lower === "pending") return "pending";
        return undefined;
      };

      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const apiStatus = mapFilterStatusToApi(statusFilter);
      console.log("apiStatus", apiStatus)
      if (apiStatus) {
        params.status = apiStatus;
      }

      const response = await axios.get(`${baseUrl}/v1/admin/maintenance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params,
      });

      console.log("API Response:", response.data);

      const apiBills = response.data?.data?.bills || [];
      const pagination = response.data?.data?.pagination;

      const mappedBills: MaintenanceBill[] = apiBills.map(mapApiBillToUiBill);
      setData(mappedBills);

      if (pagination) {
        setCurrentPage(pagination.page || 1);
        setTotalPages(pagination.pages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching maintenance bills:", error);
      toast.error("Failed to fetch maintenance bills");
    }
  };

  useEffect(() => {
    findProvider();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, currentPage]);

  const filteredBills = data;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBills = filteredBills.length;
    const paidBills = filteredBills.filter(
      (b) => b.status === "paid",
    ).length;
    const pendingBills = filteredBills.filter(
      (b) => b.status === "Pending",
    ).length;
    const overdueBills = filteredBills.filter(
      (b) => b.status === "Overdue",
    ).length;
    const totalAmount = filteredBills.reduce(
      (sum, bill) => sum + bill.amount,
      0,
    );
    const collectedAmount = filteredBills
      .filter((b) => b.status === "paid")
      .reduce((sum, bill) => sum + bill.amount, 0);

    return {
      totalBills,
      paidBills,
      pendingBills,
      overdueBills,
      totalAmount,
      collectedAmount,
      collectionRate:
        totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0,
    };
  }, [filteredBills]);

  const handleGenerateBills = async () => {
    try {
      setIsGenerating(true);

      // Validate form
      if (!billForm.dueDate) {
        toast.error("Please select a due date");
        setIsGenerating(false);
        return;
      }

      if (billForm.items.length === 0) {
        toast.error("Please add at least one bill item");
        setIsGenerating(false);
        return;
      }

      // Validate items
      for (const item of billForm.items) {
        if (!item.description || item.description.trim() === "") {
          toast.error("All items must have a description");
          setIsGenerating(false);
          return;
        }
        if (item.amount === undefined || item.amount < 0) {
          toast.error("All items must have a valid amount (>= 0)");
          setIsGenerating(false);
          return;
        }
      }

      // Calculate total amount from items
      const totalAmount = billForm.items.reduce((sum, item) => sum + item.amount, 0);

      if (totalAmount <= 0) {
        toast.error("Total bill amount must be greater than 0");
        setIsGenerating(false);
        return;
      }

      // Prepare bill items (only description and amount as per API)
      const billItems = billForm.items.map((item) => ({
        description: item.description.trim(),
        amount: item.amount,
      }));

      // Prepare payload according to backend API
      const payload = {
        residentIds: selectedResidentIds.length > 0 ? selectedResidentIds : undefined, // Optional - if empty, generates for all active residents
        billData: {
          month: billForm.month,
          year: billForm.year,
          amount: totalAmount,
          dueDate: billForm.dueDate,
          items: billItems,
        },
      };

      console.log("Payload being sent:", payload);

      const token = getAuthToken();
      const response = await axios.post(
        `${baseUrl}/v1/admin/maintenance/generate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        const { bills, skipped } = response.data.data;
        toast.success(
          `Successfully generated ${bills.length} maintenance bills${skipped > 0 ? ` (${skipped} skipped - already exist)` : ""}`
        );
        setIsGenerateBillOpen(false);
        // Reset form
        setBillForm({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          dueDate: "",
          items: [
            {
              description: "Maintenance Charge",
              amount: 1500,
              type: "Fixed" as const,
            },
            { description: "Parking Fee", amount: 500, type: "Fixed" as const },
            { description: "Security Charge", amount: 300, type: "Fixed" as const },
            { description: "Utility Charge", amount: 200, type: "Variable" as const },
          ],
        });
        setSelectedResidentIds([]);
        // Optionally refresh bills list here if you have a fetch function
      } else {
        toast.error(response.data.message || "Failed to generate bills");
      }
    } catch (error: any) {
      console.error("Generate bills error:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to generate maintenance bills"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewBill = (bill: MaintenanceBill) => {
    setSelectedBill(bill);
    setIsViewBillOpen(true);
  };

  const handleMarkAsPaid = async (billId: number) => {
    updateMaintenanceBillStatus(billId, "paid");
    const token = getAuthToken();
    let updateBill = await axios.put<any>(`${baseUrl}/v1/admin/maintenance/${billId}/status`, {
      status: "paid",
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("updateBill", updateBill)
    if (updateBill?.data?.success) {
      toast.success("Bill marked as paid");
      findProvider()
    } else {
      toast.error(updateBill?.data?.message || "Failed to mark bill as paid");
    }
    // toast.success("Bill marked as paid");
  };

  const handleMarkAsDeclined = async (billId: number) => {
    const token = getAuthToken();
    let updateBill = await axios.put<any>(`${baseUrl}/v1/admin/maintenance/${billId}/request-resident-for-declined-bill`, {

    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("updateBill", updateBill)
    if (updateBill?.data?.success) {
      toast.success("Bill marked as declined");
      findProvider()
    } else {
      toast.error(updateBill?.data?.message || "Failed to mark bill as paid");
    }
    // toast.success("Bill marked as paid");
  };

  const addBillItem = () => {
    setBillForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", amount: 0, type: "Variable" as const },
      ],
    }));
  };

  const updateBillItem = (index: number, field: string, value: any) => {
    setBillForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeBillItem = (index: number) => {
    setBillForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
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
                  Maintenance Management
                </h1>
                <p className="text-sm text-gray-500">
                  Generate and manage maintenance bills
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsGenerateBillOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Generate Bills
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

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Collection Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.collectionRate}%
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
                      Pending Bills
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingBills}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Amount Collected
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.collectedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by resident, apartment, or month..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bills Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Maintenance Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Request</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {bill.resident}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bill.apartment}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {bill.month} {bill.year}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          ${bill.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {bill.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bill.status)}>
                          <div className="flex items-center">
                            {getStatusIcon(bill.status)}
                            <span className="ml-1">{bill.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBill(bill)}
                            title="View Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Send Notification"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          {bill.status !== "paid" && bill?.type !== "request" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              title="Mark as paid"
                              onClick={() => {
                                console.log("biwdawdawdadl   l", selectedBill)
                                handleMarkAsPaid(bill._id)
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>

                        <div className="flex space-x-2">
                          {bill?.type == "request" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white"
                                style={{ backgroundColor: "darkgreen" }}
                                title="Mark as paid"
                                onClick={() => {
                                  // console.log("biwdawdawdadl   l", bill)
                                  handleMarkAsPaid(bill._id)
                                }}
                              >
                                <p> Approved </p>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white"
                                title="Mark as paid"
                                style={{ backgroundColor: "darkred" }}
                                onClick={() => {
                                  // console.log("biwdawdawdadl   l", bill)
                                  handleMarkAsDeclined(bill._id)
                                }}
                              >
                                <p> Declined </p>
                              </Button>
                            </>
                          )}

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev < totalPages ? prev + 1 : prev,
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Generate Bills Dialog */}
      <Dialog open={isGenerateBillOpen} onOpenChange={setIsGenerateBillOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Maintenance Bills</DialogTitle>
            <DialogDescription>
              Create maintenance bills for all active residents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Select
                  value={billForm.month.toString()}
                  onValueChange={(value) =>
                    setBillForm((prev) => ({ ...prev, month: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={billForm.year}
                  onChange={(e) =>
                    setBillForm((prev) => ({
                      ...prev,
                      year: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={billForm.dueDate}
                onChange={(e) =>
                  setBillForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Bill Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBillItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {billForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateBillItem(index, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateBillItem(
                            index,
                            "amount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="w-28">
                      <Select
                        value={item?.type}
                        onValueChange={(value) =>
                          updateBillItem(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                          <SelectItem value="Variable">Variable</SelectItem>
                          <SelectItem value="One-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBillItem(index)}
                      disabled={billForm.items.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">
                  Total Amount: $
                  {billForm.items
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Will be generated for{" "}
                  {residents.filter((r) => r.status === "Active").length} active
                  residents
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsGenerateBillOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateBills}
                disabled={!billForm.dueDate || isGenerating || billForm.items.length === 0}
              >
                {isGenerating ? "Generating..." : "Generate Bills"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                    <span className="font-medium">Resident:</span>{" "}
                    {selectedBill.resident}
                  </div>
                  <div>
                    <span className="font-medium">Apartment:</span>{" "}
                    {selectedBill.apartment}
                  </div>
                  <div>
                    <span className="font-medium">Period:</span>{" "}
                    {selectedBill.month} {selectedBill.year}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span>{" "}
                    {selectedBill.dueDate}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge className={getStatusColor(selectedBill.status)}>
                      {selectedBill.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span>{" "}
                    {selectedBill.generatedDate}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Bill Items</h4>
                <div className="space-y-2">
                  {selectedBill.items.map((item) => (
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
                {selectedBill.status !== "paid" && selectedBill?.type !== "request" && (
                  <Button
                    onClick={() => {
                      console.log("selectedBill", selectedBill)
                      // handleMarkAsPaid(selectedBill._id);
                      // setIsViewBillOpen(false);
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

export default AdminMaintenance;
