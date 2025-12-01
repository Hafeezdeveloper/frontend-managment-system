import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  QrCode,
  Calendar,
  Clock,
  User,
  Phone,
  Car,
} from "lucide-react";
import QRCodeGenerator from "./QRCodeGenerator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Guest {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  validFrom: string;
  validUntil: string;
  vehicle?: string;
  qrCode: string;
  status: "active" | "used" | "expired";
  createdAt: string;
  hostApartment: string;
}

interface GuestRegistrationQRProps {
  residentName: string;
  apartment: string;
  className?: string;
}

const GuestRegistrationQR = ({
  residentName,
  apartment,
  className = "",
}: GuestRegistrationQRProps) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);

  const [guestForm, setGuestForm] = useState({
    name: "",
    phone: "",
    purpose: "",
    validFrom: "",
    validUntil: "",
    vehicle: "",
  });

  const generateGuestQRCode = (guest: Omit<Guest, "id" | "qrCode">) => {
    const qrData = {
      type: "guest_entry",
      guestName: guest.name,
      hostApartment: guest.hostApartment,
      residentName,
      phone: guest.phone,
      purpose: guest.purpose,
      validFrom: guest.validFrom,
      validUntil: guest.validUntil,
      vehicle: guest.vehicle || "None",
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(qrData);
  };

  const handleAddGuest = () => {
    // Validate form
    if (
      !guestForm.name ||
      !guestForm.phone ||
      !guestForm.purpose ||
      !guestForm.validFrom ||
      !guestForm.validUntil
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newGuest: Guest = {
      id: `guest_${Date.now()}`,
      name: guestForm.name,
      phone: guestForm.phone,
      purpose: guestForm.purpose,
      validFrom: guestForm.validFrom,
      validUntil: guestForm.validUntil,
      vehicle: guestForm.vehicle,
      hostApartment: apartment,
      qrCode: "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Generate QR code
    newGuest.qrCode = generateGuestQRCode(newGuest);

    setGuests((prev) => [newGuest, ...prev]);

    // Reset form and close dialog
    setGuestForm({
      name: "",
      phone: "",
      purpose: "",
      validFrom: "",
      validUntil: "",
      vehicle: "",
    });
    setIsAddDialogOpen(false);

    console.log("New guest registered:", newGuest);
  };

  const handleShowQR = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsQRDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  // Auto-update expired guests
  const activeGuests = guests.map((guest) => ({
    ...guest,
    status: isExpired(guest.validUntil) ? ("expired" as const) : guest.status,
  }));

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Guest Registration
            </CardTitle>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register Guest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {activeGuests.filter((g) => g.status === "active").length}
              </p>
              <p className="text-sm text-green-700">Active</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {activeGuests.filter((g) => g.status === "used").length}
              </p>
              <p className="text-sm text-blue-700">Used</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {activeGuests.filter((g) => g.status === "expired").length}
              </p>
              <p className="text-sm text-red-700">Expired</p>
            </div>
          </div>

          {/* Guest List */}
          {activeGuests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No guests registered</p>
              <p className="text-sm text-gray-500">
                Register a guest to generate a QR code for entry
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGuests.map((guest) => (
                <Card key={guest.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {guest.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {guest.phone}
                              </span>
                              {guest.vehicle && (
                                <span className="flex items-center">
                                  <Car className="w-3 h-3 mr-1" />
                                  {guest.vehicle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Purpose:</strong> {guest.purpose}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Valid: {guest.validFrom} to {guest.validUntil}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Created:{" "}
                              {new Date(guest.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(guest.status)}>
                          {guest.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowQR(guest)}
                          disabled={guest.status === "expired"}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Guest Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Guest</DialogTitle>
            <DialogDescription>
              Create a guest entry pass with QR code for {apartment}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="guest-name">Guest Name *</Label>
              <Input
                id="guest-name"
                placeholder="Enter guest name"
                value={guestForm.name}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="guest-phone">Phone Number *</Label>
              <Input
                id="guest-phone"
                placeholder="+1 234-567-8901"
                value={guestForm.phone}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, phone: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="guest-purpose">Purpose of Visit *</Label>
              <Textarea
                id="guest-purpose"
                placeholder="e.g., Business meeting, Personal visit, Delivery..."
                value={guestForm.purpose}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, purpose: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="guest-from">Valid From *</Label>
              <Input
                id="guest-from"
                type="datetime-local"
                value={guestForm.validFrom}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, validFrom: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="guest-until">Valid Until *</Label>
              <Input
                id="guest-until"
                type="datetime-local"
                value={guestForm.validUntil}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, validUntil: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="guest-vehicle">Vehicle (Optional)</Label>
              <Input
                id="guest-vehicle"
                placeholder="e.g., Car - DL01AB1234, Bike - DL05XY7890"
                value={guestForm.vehicle}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, vehicle: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddGuest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR & Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Display Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Guest Entry QR Code</DialogTitle>
            <DialogDescription>
              QR Code for {selectedGuest?.name} - {apartment}
            </DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="py-4">
              <QRCodeGenerator
                data={selectedGuest.qrCode}
                title={`Guest Pass - ${selectedGuest.name}`}
                size={256}
              />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Entry Details:
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>
                    <strong>Guest:</strong> {selectedGuest.name}
                  </p>
                  <p>
                    <strong>Host:</strong> {residentName} ({apartment})
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedGuest.purpose}
                  </p>
                  <p>
                    <strong>Valid:</strong> {selectedGuest.validFrom} to{" "}
                    {selectedGuest.validUntil}
                  </p>
                  {selectedGuest.vehicle && (
                    <p>
                      <strong>Vehicle:</strong> {selectedGuest.vehicle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestRegistrationQR;
