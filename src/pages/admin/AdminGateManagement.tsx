import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "@/contexts/AdminDataContext";
import {
  ArrowLeft,
  Search,
  Filter,
  LogIn,
  LogOut,
  QrCode,
  Users,
  Car,
  Clock,
  Calendar,
  Eye,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import QRCodeScanner from "@/components/QRCodeScanner";
import { toast } from "sonner";
import { generateUniqueId } from "@/lib/utils";

const AdminGateManagement = () => {
  const navigate = useNavigate();
  const { gateEntries, addGateEntry } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [entryFilter, setEntryFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // ULTRA-SIMPLE single entry protection
  const [isProcessingEntry, setIsProcessingEntry] = useState(false);
  const lastProcessedQRRef = useRef<string>("");
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filteredEntries = gateEntries.filter((entry) => {
    const matchesSearch =
      entry.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vehicle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      entryFilter === "all" || entry.type.toLowerCase() === entryFilter;

    return matchesSearch && matchesFilter;
  });

  // Handler functions
  const handleViewEntry = (entry: any) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  // QR code scanning with local processing only (no backend API to prevent errors)
  const handleQRScan = useCallback(
    (qrData: string) => {
      // ULTIMATE PROTECTION: Single check
      if (isProcessingEntry) {
        console.log("🚫 BLOCKED: Already processing");
        return;
      }

      if (lastProcessedQRRef.current === qrData) {
        console.log("🚫 BLOCKED: Same QR code");
        return;
      }

      // IMMEDIATE LOCK
      setIsProcessingEntry(true);
      lastProcessedQRRef.current = qrData;
      console.log("✅ QR ACCEPTED:", qrData.substring(0, 30));

      // Clear any existing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      // Simple reset function
      const resetProcessor = (delay: number = 10000) => {
        processingTimeoutRef.current = setTimeout(() => {
          setIsProcessingEntry(false);
          lastProcessedQRRef.current = "";
          console.log("🔓 Scanner reset");
        }, delay);
      };

      try {
        console.log("📝 Processing QR code locally (demo mode)");

        // Fallback to local processing
        const parsedData = JSON.parse(qrData);
        const now = new Date();

        if (parsedData.type === "guest_entry") {
          const validFrom = new Date(parsedData.validFrom);
          const validUntil = new Date(parsedData.validUntil);

          if (now < validFrom || now > validUntil) {
            toast.error("Guest QR Code expired or not yet valid");
            resetProcessor(5000);
            return;
          }

          const lastEntry = gateEntries
            .filter(
              (e) =>
                e.person === parsedData.guestName &&
                e.apartment === parsedData.hostApartment &&
                e.entryType === "Guest",
            )
            .sort(
              (a, b) =>
                new Date(b.date + " " + b.time).getTime() -
                new Date(a.date + " " + a.time).getTime(),
            )[0];

          const isEntry = !lastEntry || lastEntry.type === "Exit";

          // Format vehicle information
          let vehicleInfo = "None";
          if (parsedData.vehicleType && parsedData.vehicleType !== "None") {
            vehicleInfo = parsedData.licensePlate
              ? `${parsedData.vehicleType} (${parsedData.licensePlate})`
              : parsedData.vehicleType;
          }

          const newEntry = {
            type: isEntry ? "Entry" : "Exit",
            person: parsedData.guestName,
            apartment: parsedData.hostApartment,
            entryType: "Guest",
            vehicle: vehicleInfo,
            time: now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            date: now.toISOString().split("T")[0],
            gate: "Main Gate",
            method: "QR Code",
          };

          addGateEntry(newEntry);
          toast.success(
            `Guest ${isEntry ? "entry" : "exit"}: ${parsedData.guestName} (Host: ${parsedData.hostName} - ${parsedData.hostApartment})`,
          );
          resetProcessor();
        } else if (parsedData.type === "resident_entry") {
          const lastEntry = gateEntries
            .filter(
              (e) =>
                e.person === parsedData.residentName &&
                e.apartment === parsedData.apartment,
            )
            .sort(
              (a, b) =>
                new Date(b.date + " " + b.time).getTime() -
                new Date(a.date + " " + a.time).getTime(),
            )[0];

          const isEntry = !lastEntry || lastEntry.type === "Exit";

          const newEntry = {
            type: isEntry ? "Entry" : "Exit",
            person: parsedData.residentName,
            apartment: parsedData.apartment,
            entryType: "Resident",
            vehicle: parsedData.vehicle || "None",
            time: now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            date: now.toISOString().split("T")[0],
            gate: "Main Gate",
            method: "QR Code",
          };

          addGateEntry(newEntry);
          toast.success(
            `Resident ${isEntry ? "entry" : "exit"}: ${parsedData.residentName}`,
          );
          resetProcessor();
        } else if (parsedData.type === "vehicle_entry") {
          const lastEntry = gateEntries
            .filter(
              (e) =>
                e.person === parsedData.residentName &&
                e.apartment === parsedData.apartment &&
                e.vehicle ===
                  `${parsedData.make} ${parsedData.model} (${parsedData.licensePlate})`,
            )
            .sort(
              (a, b) =>
                new Date(b.date + " " + b.time).getTime() -
                new Date(a.date + " " + a.time).getTime(),
            )[0];

          const isEntry = !lastEntry || lastEntry.type === "Exit";

          const newEntry = {
            type: isEntry ? "Entry" : "Exit",
            person: parsedData.residentName,
            apartment: parsedData.apartment,
            entryType: "Resident Vehicle",
            vehicle: `${parsedData.make} ${parsedData.model} (${parsedData.licensePlate})`,
            time: now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            date: now.toISOString().split("T")[0],
            gate: "Main Gate",
            method: "QR Code",
          };

          addGateEntry(newEntry);
          toast.success(
            `Vehicle ${isEntry ? "entry" : "exit"}: ${parsedData.licensePlate}`,
          );
          resetProcessor();
        } else if (parsedData.type === "delivery_entry") {
          const lastEntry = gateEntries
            .filter(
              (e) =>
                e.person === parsedData.riderName &&
                e.apartment === parsedData.apartment &&
                e.entryType === "Delivery",
            )
            .sort(
              (a, b) =>
                new Date(b.date + " " + b.time).getTime() -
                new Date(a.date + " " + a.time).getTime(),
            )[0];

          const isEntry = !lastEntry || lastEntry.type === "Exit";

          const newEntry = {
            type: isEntry ? "Entry" : "Exit",
            person: parsedData.riderName,
            apartment: parsedData.apartment,
            entryType: "Delivery",
            vehicle: parsedData.companyName || "Delivery Vehicle",
            time: now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            date: now.toISOString().split("T")[0],
            gate: "Main Gate",
            method: "QR Code",
          };

          addGateEntry(newEntry);
          toast.success(
            `Delivery ${isEntry ? "entry" : "exit"}: ${parsedData.riderName}`,
          );
          resetProcessor();
        } else {
          toast.error(`Invalid QR code type: ${parsedData.type || "unknown"}`);
          resetProcessor(5000);
        }
      } catch (error) {
        console.error("QR scan error:", error);
        toast.error("Invalid QR code format");
        resetProcessor(5000);
      }
    },
    [gateEntries, addGateEntry, isProcessingEntry],
  );

  // Calculate dynamic stats from gate entries data
  const todayEntries = gateEntries.filter((e) => e.type === "Entry").length;
  const todayExits = gateEntries.filter((e) => e.type === "Exit").length;
  const currentOccupancy = todayEntries - todayExits;
  const vehicleEntries = gateEntries.filter(
    (e) => e.vehicle !== "None" && e.type === "Entry",
  ).length;

  const stats = [
    {
      title: "Total Entries Today",
      value: todayEntries.toString(),
      icon: LogIn,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Exits Today",
      value: todayExits.toString(),
      icon: LogOut,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Current Occupancy",
      value: Math.max(0, currentOccupancy).toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Vehicle Entries",
      value: vehicleEntries.toString(),
      icon: Car,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const getEntryTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "entry":
        return "bg-green-100 text-green-800";
      case "exit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPersonTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "resident":
        return "bg-blue-100 text-blue-800";
      case "resident vehicle":
        return "bg-indigo-100 text-indigo-800";
      case "guest":
        return "bg-orange-100 text-orange-800";
      case "delivery":
        return "bg-green-100 text-green-800";
      case "staff":
        return "bg-purple-100 text-purple-800";
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
                  Gate Authentication & Entry Logs
                </h1>
                <p className="text-sm text-gray-500">
                  QR-based authentication with automatic entry/exit logging
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-orange-600">
              📱 Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`${stat.bgColor} p-3 rounded-lg mr-4`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gate Authentication Scanner */}
          <Card className="border-0 shadow-lg mb-6 border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <QrCode className="w-6 h-6 mr-2" />
                Gate Authentication Scanner (Demo Mode)
                {isProcessingEntry && (
                  <Badge className="ml-2 bg-red-100 text-red-800 animate-pulse">
                    🚫 SCANNER LOCKED
                  </Badge>
                )}
                <Badge className="ml-2 bg-orange-100 text-orange-800">
                  📱 Local Processing
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* QR Scanner */}
                <div className="lg:col-span-2">
                  {!isProcessingEntry ? (
                    <QRCodeScanner
                      onScan={handleQRScan}
                      onError={(error) =>
                        toast.error(`Scanner error: ${error}`)
                      }
                      title="Scan QR Code for Authentication"
                    />
                  ) : (
                    <div className="w-full h-64 bg-red-50 border-4 border-red-500 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold text-red-900 mb-2">
                          🚫 SCANNER LOCKED
                        </h3>
                        <p className="text-sm text-red-700 font-bold mb-2">
                          DO NOT SCAN ANOTHER QR CODE
                        </p>
                        <p className="text-xs text-red-600">
                          Processing entry... Scanner will reset automatically
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-semibold text-red-800 mb-2">
                      🚫 ANTI-DUPLICATE SYSTEM
                    </h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• ONE scan per QR code only</li>
                      <li>• Scanner locks during processing</li>
                      <li>• Automatic duplicate prevention</li>
                      <li>• Data-layer protection active</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-800 mb-2">
                      📱 DEMO MODE ACTIVE
                    </h4>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• Local processing only</li>
                      <li>• No backend server required</li>
                      <li>• All QR types supported</li>
                      <li>• Full functionality available</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">
                      ✅ Supported QR Types
                    </h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Resident Entry/Exit</li>
                      <li>• Vehicle Entry/Exit</li>
                      <li>• Guest Entry/Exit</li>
                      <li>• Delivery Entry/Exit</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <LogIn className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-blue-800">Entry</p>
                      <p className="text-xs text-blue-600">First Scan</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <LogOut className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-orange-800">
                        Exit
                      </p>
                      <p className="text-xs text-orange-600">Second Scan</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Entry Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, apartment, or vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={entryFilter} onValueChange={setEntryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entries</SelectItem>
                    <SelectItem value="entry">Entry Only</SelectItem>
                    <SelectItem value="exit">Exit Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Entry Logs Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Entry & Exit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Apartment</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Gate</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, index) => (
                    <TableRow
                      key={`entry-${entry.id}-${entry.person.replace(/\s+/g, "")}-${entry.date}-${entry.time.replace(/\s+/g, "")}-${index}`}
                    >
                      <TableCell>
                        <Badge className={getEntryTypeColor(entry.type)}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {entry.person}
                          </div>
                          <Badge
                            variant="outline"
                            className={getPersonTypeColor(entry.entryType)}
                          >
                            {entry.entryType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{entry.apartment}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          {entry.vehicle !== "None" && (
                            <Car className="w-4 h-4 mr-1 text-gray-400" />
                          )}
                          {entry.vehicle}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {entry.time}
                          <div className="text-xs text-gray-500 ml-2">
                            {entry.date}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.gate}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          {entry.method === "QR Code" && (
                            <QrCode className="w-4 h-4 mr-1 text-gray-400" />
                          )}
                          {entry.method}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                            className="hover:bg-blue-50 text-blue-600"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* View Entry Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Entry Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedEntry?.person}
                </DialogDescription>
              </DialogHeader>
              {selectedEntry && (
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Person
                    </Label>
                    <p className="text-gray-900 font-medium">
                      {selectedEntry.person}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Type
                    </Label>
                    <Badge className={getEntryTypeColor(selectedEntry.type)}>
                      {selectedEntry.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Apartment
                    </Label>
                    <p className="text-gray-900">{selectedEntry.apartment}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Entry Type
                    </Label>
                    <Badge
                      className={getPersonTypeColor(selectedEntry.entryType)}
                    >
                      {selectedEntry.entryType}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Vehicle
                    </Label>
                    <p className="text-gray-900">{selectedEntry.vehicle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Gate
                    </Label>
                    <p className="text-gray-900">{selectedEntry.gate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Method
                    </Label>
                    <p className="text-gray-900">{selectedEntry.method}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Time & Date
                    </Label>
                    <p className="text-gray-900">
                      {selectedEntry.time} on {selectedEntry.date}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default AdminGateManagement;
