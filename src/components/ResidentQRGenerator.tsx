import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QrCode, User, Car, Clock, Home, Smartphone } from "lucide-react";
import QRCodeGenerator from "./QRCodeGenerator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResidentQRGeneratorProps {
  residentName: string;
  apartment: string;
  phone: string;
  className?: string;
}

const ResidentQRGenerator = ({
  residentName,
  apartment,
  phone,
  className = "",
}: ResidentQRGeneratorProps) => {
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [qrForm, setQrForm] = useState({
    entryType: "entry",
    vehicle: "",
    validHours: "24",
  });

  const generateResidentQR = () => {
    const now = new Date();
    const expiryTime = new Date(
      now.getTime() + parseInt(qrForm.validHours) * 60 * 60 * 1000,
    );

    const qrData = {
      type: "resident_entry",
      residentName,
      apartment,
      phone,
      entryType: qrForm.entryType,
      vehicle: qrForm.vehicle || "None",
      validFrom: now.toISOString(),
      validUntil: expiryTime.toISOString(),
      timestamp: now.toISOString(),
    };

    const qrString = JSON.stringify(qrData);
    setQrCodeData(qrString);
    setIsQRDialogOpen(true);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            My Entry QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Resident Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{residentName}</p>
                  <div className="flex items-center space-x-4 text-sm text-blue-700">
                    <span className="flex items-center">
                      <Home className="w-3 h-3 mr-1" />
                      {apartment}
                    </span>
                    <span className="flex items-center">
                      <Smartphone className="w-3 h-3 mr-1" />
                      {phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Generation Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="entry-type">Entry Type</Label>
                <Select
                  value={qrForm.entryType}
                  onValueChange={(value) =>
                    setQrForm({ ...qrForm, entryType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="exit">Exit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicle">Vehicle (Optional)</Label>
                <Input
                  id="vehicle"
                  placeholder="e.g., Car - DL01AB1234, Bike - DL05XY7890"
                  value={qrForm.vehicle}
                  onChange={(e) =>
                    setQrForm({ ...qrForm, vehicle: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="valid-hours">Valid For</Label>
                <Select
                  value={qrForm.validHours}
                  onValueChange={(value) =>
                    setQrForm({ ...qrForm, validHours: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select validity period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                    <SelectItem value="12">12 Hours</SelectItem>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="72">3 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateResidentQR}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate My QR Code
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-2">
                How to use:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Generate a QR code for entry/exit</li>
                <li>• Show the QR code to the gate scanner</li>
                <li>• Entry will be automatically logged</li>
                <li>• QR codes expire after the selected time period</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>My Entry QR Code</DialogTitle>
            <DialogDescription>
              {qrForm.entryType === "entry" ? "Entry" : "Exit"} QR Code for{" "}
              {residentName} - {apartment}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {qrCodeData && (
              <>
                <QRCodeGenerator
                  data={qrCodeData}
                  title={`${qrForm.entryType === "entry" ? "Entry" : "Exit"} Pass - ${residentName}`}
                  size={256}
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    QR Code Details:
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>
                      <strong>Resident:</strong> {residentName}
                    </p>
                    <p>
                      <strong>Apartment:</strong> {apartment}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {qrForm.entryType === "entry" ? "Entry" : "Exit"}
                    </p>
                    {qrForm.vehicle && (
                      <p>
                        <strong>Vehicle:</strong> {qrForm.vehicle}
                      </p>
                    )}
                    <p>
                      <strong>Valid for:</strong> {qrForm.validHours} hours
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Note:</strong> This QR code will expire
                      automatically after the selected time period.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResidentQRGenerator;
