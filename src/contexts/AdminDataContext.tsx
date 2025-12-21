import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Type definitions
export interface Resident {
  id: number;
  name: string;
  apartment: string;
  phone: string;
  email: string;
  status: string;
  joinDate: string;
  familyMembers: number;
  username?: string;
  password?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  appliedDate?: string;

  // KYC Information
  cnicNumber?: string;
  passportNumber?: string;
  driverLicenseNumber?: string;
  idDocumentType: "CNIC" | "Passport" | "Driver License";
  ownershipType: "owner" | "tenant";
  emergencyContact?: string;
  emergencyContactPhone?: string;
  occupation?: string;
  workAddress?: string;
  profilePhoto?: string; // Base64 encoded photo
  monthlyIncome?: number;
  previousAddress?: string;
  reference1Name?: string;
  reference1Phone?: string;
  reference2Name?: string;
  reference2Phone?: string;
  additionalNotes?: string;
}

export interface ServiceProvider {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  idDocumentType: "CNIC" | "Passport" | "Driver License";
  cnicNumber?: string;
  passportNumber?: string;
  driverLicenseNumber?: string;
  serviceCategory: string;
  keywords: string;
  shortIntro: string;
  experience: string;
  previousWork: string;
  certifications: string;
  availability: string;
  serviceArea: string;
  profilePhoto?: string;
  additionalNotes: string;
  registrationDate: string;
  status: "Pending" | "Active" | "Rejected" | "Suspended";
  rating?: number;
  totalReviews?: number;
  completedJobs?: number;
  vehicles?: Vehicle[];
}

export interface ServiceBooking {
  id: number;
  residentId: number;
  residentName: string;
  apartment: string;
  serviceProviderId: number;
  serviceProviderName: string;
  serviceCategory: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High";
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  bookingDate: string;
  completionDate?: string;
  rating?: number;
  review?: string;
}

export interface ServiceReview {
  id: number;
  bookingId: number;
  residentId: number;
  residentName: string;
  serviceProviderId: number;
  serviceProviderName: string;
  rating: number;
  review: string;
  reviewDate: string;
  serviceCategory: string;
}

export interface Complaint {
  id: number;
  residentId: number;
  title: string;
  category: string;
  resident: string;
  apartment: string;
  status: string;
  priority: string;
  date: string;
  timestamp: Date;
  description: string;
  images?: string[]; // Base64 encoded images
  adminResponse?: string;
  responseDate?: string;
}

export interface GateEntry {
  id: number;
  type: string;
  person: string;
  apartment: string;
  entryType: string;
  vehicle: string;
  time: string;
  date: string;
  gate: string;
  method: string;
}

export interface Announcement {
  id: number;
  title: string;
  type: string;
  priority: string;
  date: string;
  description: string;
}

export interface MaintenanceBill {
  id: number;
  resident: string;
  apartment: string;
  month: string;
  year: number;
  amount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue";
  generatedDate: string;
  paidDate?: string;
  items: BillItem[];
}

export interface BillItem {
  id: number;
  description: string;
  amount: number;
  type: "Fixed" | "Variable" | "One-time";
}

export interface Vehicle {
  id: number;
  residentId: number;
  residentName: string;
  apartment: string;
  vehicleType: "Car" | "Bike" | "Scooter" | "Truck";
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  registrationDate: string;
  qrCode: string;
}

export interface DeliveryPerson {
  id: number;
  residentId: number;
  residentName: string;
  apartment: string;
  riderName: string;
  idNumber: string;
  idType: "CNIC" | "Passport" | "Driver License";
  companyName: string;
  description: string;
  registrationDate: string;
  qrCode: string;
}

export interface ServiceRequest {
  id: number;
  residentId: number;
  residentName: string;
  apartment: string;
  serviceType: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High";
  requestDate: string;
  completedDate?: string;
  cost?: number;
}

interface AdminDataContextType {
  // Data
  residents: Resident[];
  complaints: Complaint[];
  gateEntries: GateEntry[];
  announcements: Announcement[];
  maintenanceBills: MaintenanceBill[];
  vehicles: Vehicle[];
  deliveryPersons: DeliveryPerson[];
  serviceRequests: ServiceRequest[];
  serviceProviders: ServiceProvider[];
  serviceBookings: ServiceBooking[];
  serviceReviews: ServiceReview[];

  // Update functions
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  setGateEntries: React.Dispatch<React.SetStateAction<GateEntry[]>>;
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  setMaintenanceBills: React.Dispatch<React.SetStateAction<MaintenanceBill[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setDeliveryPersons: React.Dispatch<React.SetStateAction<DeliveryPerson[]>>;
  setServiceRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>;
  setServiceProviders: React.Dispatch<React.SetStateAction<ServiceProvider[]>>;
  setServiceBookings: React.Dispatch<React.SetStateAction<ServiceBooking[]>>;
  setServiceReviews: React.Dispatch<React.SetStateAction<ServiceReview[]>>;

  // Helper functions
  addResident: (resident: Omit<Resident, "id">) => void;
  updateResident: (id: number, updates: Partial<Resident>) => void;
  deleteResident: (id: number) => void;

  addComplaint: (complaint: Omit<Complaint, "id" | "timestamp">) => void;
  updateComplaintStatus: (id: number, status: string) => void;

  addGateEntry: (entry: Omit<GateEntry, "id">) => void;

  addAnnouncement: (announcement: Omit<Announcement, "id">) => void;
  deleteAnnouncement: (id: number) => void;

  addMaintenanceBill: (bill: Omit<MaintenanceBill, "id">) => void;
  updateMaintenanceBillStatus: (
    id: number,
    status: "pending" | "paid" | "overdue",
    paidDate?: string,
  ) => void;
  addMultipleMaintenanceBills: (bills: Omit<MaintenanceBill, "id">[]) => void;

  // Vehicle functions
  addVehicle: (vehicle: Omit<Vehicle, "id" | "qrCode">) => void;
  deleteVehicle: (id: number) => void;

  // Delivery functions
  addDeliveryPerson: (delivery: Omit<DeliveryPerson, "id" | "qrCode">) => void;
  deleteDeliveryPerson: (id: number) => void;

  // Service request functions
  addServiceRequest: (request: Omit<ServiceRequest, "id">) => void;
  updateServiceRequestStatus: (
    id: number,
    status: string,
    cost?: number,
  ) => void;

  // Complaint functions
  addComplaintWithResident: (
    complaint: Omit<Complaint, "id" | "timestamp">,
  ) => void;
  updateComplaintWithResponse: (id: number, adminResponse: string) => void;

  // Authentication functions
  authenticateResident: (username: string, password: string) => Resident | null;
  registerResident: (
    residentData: Omit<Resident, "id" | "approvalStatus" | "appliedDate">,
  ) => void;
  approveResident: (id: number) => void;
  rejectResident: (id: number) => void;

  // Data getters for specific residents
  getResidentComplaints: (residentId: number) => Complaint[];
  getResidentVehicles: (residentId: number) => Vehicle[];
  getResidentServiceRequests: (residentId: number) => ServiceRequest[];
  getResidentBills: (residentId: number) => MaintenanceBill[];

  // Service Provider functions
  registerServiceProvider: (
    serviceProviderData: Omit<
      ServiceProvider,
      "id" | "status" | "rating" | "totalReviews" | "completedJobs"
    >,
  ) => void;
  authenticateServiceProvider: (
    username: string,
    password: string,
  ) => ServiceProvider | null;
  approveServiceProvider: (id: number) => void;
  rejectServiceProvider: (id: number) => void;
  updateServiceProvider: (
    id: number,
    updates: Partial<ServiceProvider>,
  ) => void;
  getServiceProviderBookings: (serviceProviderId: number) => ServiceBooking[];
  getServiceProviderReviews: (serviceProviderId: number) => ServiceReview[];
  getServiceProviderVehicles: (serviceProviderId: number) => Vehicle[];

  // Service Booking functions
  addServiceBooking: (booking: Omit<ServiceBooking, "id">) => void;
  updateBookingStatus: (
    id: number,
    status: ServiceBooking["status"],
    actualCost?: number,
  ) => void;
  addServiceReview: (review: Omit<ServiceReview, "id">) => void;

  // Statistics
  getStatistics: () => {
    totalResidents: number;
    activeComplaints: number;
    pendingPayments: string;
    gateEntriesToday: number;
    openComplaints: number;
    inProgressComplaints: number;
    resolvedToday: number;
    pendingApprovals: number;
  };
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined,
);

// Initial mock data
const initialResidents: Resident[] = [
  {
    id: 1,
    name: "John Smith",
    apartment: "A-101",
    phone: "+1 234-567-8901",
    email: "john.smith@email.com",
    status: "Active",
    joinDate: "2023-01-15",
    familyMembers: 4,
    username: "john.smith",
    password: "password123",
    approvalStatus: "Approved",
    cnicNumber: "12345-6789012-3",
    idDocumentType: "CNIC",
    ownershipType: "Owner",
    emergencyContact: "Jane Smith",
    emergencyContactPhone: "+1 234-567-8999",
    occupation: "Software Engineer",
    workAddress: "123 Tech Park, NYC",
    monthlyIncome: 8000,
    previousAddress: "456 Old Street, NYC",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    apartment: "B-205",
    phone: "+1 234-567-8902",
    email: "sarah.johnson@email.com",
    status: "Active",
    joinDate: "2023-03-20",
    familyMembers: 2,
    username: "sarah.johnson",
    password: "password123",
    approvalStatus: "Approved",
    passportNumber: "P123456789",
    idDocumentType: "Passport",
    ownershipType: "Tenant",
    emergencyContact: "Mark Johnson",
    emergencyContactPhone: "+1 234-567-8998",
    occupation: "Teacher",
    workAddress: "ABC High School, NYC",
    monthlyIncome: 5000,
  },
  {
    id: 3,
    name: "Michael Brown",
    apartment: "C-304",
    phone: "+1 234-567-8903",
    email: "michael.brown@email.com",
    status: "Pending",
    joinDate: "2024-01-10",
    familyMembers: 3,
    username: "michael.brown",
    password: "password123",
    approvalStatus: "Pending",
    appliedDate: "2024-01-10",
    cnicNumber: "54321-9876543-2",
    idDocumentType: "CNIC",
    ownershipType: "Owner",
    emergencyContact: "Lisa Brown",
    emergencyContactPhone: "+1 234-567-8997",
    occupation: "Business Owner",
    workAddress: "789 Business Center, NYC",
    monthlyIncome: 12000,
    reference1Name: "David Wilson",
    reference1Phone: "+1 234-567-8888",
    reference2Name: "Mary Johnson",
    reference2Phone: "+1 234-567-8777",
    additionalNotes: "Family of 3, looking for long-term residence",
  },
  {
    id: 4,
    name: "Emily Davis",
    apartment: "D-102",
    phone: "+1 234-567-8904",
    email: "emily.davis@email.com",
    status: "Active",
    joinDate: "2022-11-05",
    familyMembers: 1,
    username: "emily.davis",
    password: "password123",
    approvalStatus: "Approved",
    driverLicenseNumber: "DL987654321",
    idDocumentType: "Driver License",
    ownershipType: "Tenant",
    emergencyContact: "Robert Davis",
    emergencyContactPhone: "+1 234-567-8996",
    occupation: "Nurse",
    workAddress: "City Hospital, NYC",
    monthlyIncome: 6000,
  },
  {
    id: 5,
    name: "Ashna",
    apartment: "E-205",
    phone: "+1 234-567-8905",
    email: "ashna@email.com",
    status: "Active",
    joinDate: "2024-01-01",
    familyMembers: 2,
    username: "ashna",
    password: "password123",
    approvalStatus: "Approved",
    cnicNumber: "98765-4321098-7",
    idDocumentType: "CNIC",
    ownershipType: "Owner",
    emergencyContact: "Ahmed Khan",
    emergencyContactPhone: "+1 234-567-8888",
    occupation: "Designer",
    workAddress: "Creative Studio, NYC",
    monthlyIncome: 7500,
  },
];

const initialComplaints: Complaint[] = [
  {
    id: 1,
    residentId: 1,
    title: "Elevator not working",
    category: "Maintenance",
    resident: "John Smith",
    apartment: "A-101",
    status: "Open",
    priority: "High",
    date: "2024-01-15",
    timestamp: new Date("2024-01-15T09:30:00"),
    description: "The elevator in Block A has been out of order for 2 days.",
  },
  {
    id: 2,
    residentId: 2,
    title: "Water leakage in corridor",
    category: "Plumbing",
    resident: "Sarah Johnson",
    apartment: "B-205",
    status: "In Progress",
    priority: "Medium",
    date: "2024-01-14",
    timestamp: new Date("2024-01-14T14:20:00"),
    description:
      "There's water leaking from the ceiling in 2nd floor corridor.",
    adminResponse:
      "Maintenance team has been notified and will fix this by tomorrow.",
    responseDate: "2024-01-15",
  },
  {
    id: 3,
    residentId: 3,
    title: "Parking space issue",
    category: "Parking",
    resident: "Michael Brown",
    apartment: "C-304",
    status: "Resolved",
    priority: "Low",
    date: "2024-01-12",
    timestamp: new Date("2024-01-12T16:45:00"),
    description: "Someone is parking in my assigned parking space.",
    adminResponse:
      "Security team has assigned proper parking slots and added signage.",
    responseDate: "2024-01-13",
  },
  {
    id: 4,
    residentId: 4,
    title: "Noise complaint",
    category: "Neighbor",
    resident: "Emily Davis",
    apartment: "D-102",
    status: "Open",
    priority: "Medium",
    date: "2024-01-16",
    timestamp: new Date("2024-01-16T22:15:00"),
    description: "Loud music from upstairs apartment during night hours.",
  },
  {
    id: 5,
    residentId: 5,
    title: "Internet connectivity issue",
    category: "Utilities",
    resident: "Ashna",
    apartment: "E-205",
    status: "In Progress",
    priority: "Medium",
    date: "2024-01-17",
    timestamp: new Date("2024-01-17T10:30:00"),
    description: "WiFi connection keeps dropping in my apartment.",
    adminResponse: "Technical team will check the router and cables tomorrow.",
    responseDate: "2024-01-17",
  },
];

const initialGateEntries: GateEntry[] = [
  {
    id: 1,
    type: "Entry",
    person: "John Smith",
    apartment: "A-101",
    entryType: "Resident",
    vehicle: "Car - DL01AB1234",
    time: "09:15 AM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "QR Code",
  },
  {
    id: 2,
    type: "Exit",
    person: "Sarah Johnson",
    apartment: "B-205",
    entryType: "Resident",
    vehicle: "None",
    time: "08:30 AM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
  {
    id: 3,
    type: "Entry",
    person: "Michael Brown",
    apartment: "C-304",
    entryType: "Resident",
    vehicle: "Bike - DL02XY5678",
    time: "07:45 AM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "QR Code",
  },
  {
    id: 4,
    type: "Entry",
    person: "Emily Davis",
    apartment: "D-102",
    entryType: "Resident",
    vehicle: "None",
    time: "06:30 AM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
  {
    id: 5,
    type: "Entry",
    person: "Pizza Delivery",
    apartment: "A-101",
    entryType: "Guest",
    vehicle: "Bike - DL03PQ9876",
    time: "01:15 PM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "QR Code",
  },
  {
    id: 6,
    type: "Exit",
    person: "Pizza Delivery",
    apartment: "A-101",
    entryType: "Guest",
    vehicle: "Bike - DL03PQ9876",
    time: "01:45 PM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
  {
    id: 7,
    type: "Entry",
    person: "Plumber",
    apartment: "B-205",
    entryType: "Service Provider",
    vehicle: "None",
    time: "10:00 AM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
  {
    id: 8,
    type: "Exit",
    person: "John Smith",
    apartment: "A-101",
    entryType: "Resident",
    vehicle: "Car - DL01AB1234",
    time: "11:30 AM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "QR Code",
  },
  {
    id: 9,
    type: "Entry",
    person: "Guest - Raj Kumar",
    apartment: "C-304",
    entryType: "Guest",
    vehicle: "Car - DL04RS1357",
    time: "03:00 PM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "QR Code",
  },
  {
    id: 10,
    type: "Exit",
    person: "Plumber",
    apartment: "B-205",
    entryType: "Service Provider",
    vehicle: "None",
    time: "12:30 PM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
  {
    id: 11,
    type: "Entry",
    person: "Sarah Johnson",
    apartment: "B-205",
    entryType: "Resident",
    vehicle: "None",
    time: "04:15 PM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
  {
    id: 12,
    type: "Exit",
    person: "Emily Davis",
    apartment: "D-102",
    entryType: "Resident",
    vehicle: "None",
    time: "05:30 PM",
    date: "2024-01-16",
    gate: "Main Gate",
    method: "Manual",
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Water Supply Maintenance",
    type: "Maintenance",
    priority: "High",
    date: "2024-01-16",
    description:
      "Water supply will be disrupted tomorrow from 10 AM to 2 PM for maintenance work.",
  },
  {
    id: 2,
    title: "Community Event - Holi Celebration",
    type: "Event",
    priority: "Medium",
    date: "2024-01-15",
    description:
      "Join us for Holi celebration in the community hall on March 8th at 6 PM.",
  },
  {
    id: 3,
    title: "Parking Rules Update",
    type: "Policy",
    priority: "Low",
    date: "2024-01-14",
    description:
      "New parking rules effective from February 1st. Please check the notice board for details.",
  },
];

const initialMaintenanceBills: MaintenanceBill[] = [
  {
    id: 1,
    resident: "John Smith",
    apartment: "A-101",
    month: "January",
    year: 2024,
    amount: 2500,
    dueDate: "2024-01-31",
    status: "Paid",
    generatedDate: "2024-01-01",
    paidDate: "2024-01-15",
    items: [
      {
        id: 1,
        description: "Maintenance Charge",
        amount: 1500,
        type: "Fixed",
      },
      { id: 2, description: "Parking Fee", amount: 500, type: "Fixed" },
      { id: 3, description: "Security Charge", amount: 300, type: "Fixed" },
      { id: 4, description: "Utility Charge", amount: 200, type: "Variable" },
    ],
  },
  {
    id: 2,
    resident: "Sarah Johnson",
    apartment: "B-205",
    month: "January",
    year: 2024,
    amount: 2000,
    dueDate: "2024-01-31",
    status: "Pending",
    generatedDate: "2024-01-01",
    items: [
      {
        id: 1,
        description: "Maintenance Charge",
        amount: 1500,
        type: "Fixed",
      },
      { id: 2, description: "Security Charge", amount: 300, type: "Fixed" },
      { id: 3, description: "Utility Charge", amount: 200, type: "Variable" },
    ],
  },
  {
    id: 3,
    resident: "Emily Davis",
    apartment: "D-102",
    month: "December",
    year: 2023,
    amount: 2200,
    dueDate: "2023-12-31",
    status: "Overdue",
    generatedDate: "2023-12-01",
    items: [
      {
        id: 1,
        description: "Maintenance Charge",
        amount: 1500,
        type: "Fixed",
      },
      { id: 2, description: "Parking Fee", amount: 500, type: "Fixed" },
      { id: 3, description: "Utility Charge", amount: 200, type: "Variable" },
    ],
  },
  {
    id: 4,
    resident: "Michael Brown",
    apartment: "C-304",
    month: "January",
    year: 2024,
    amount: 1800,
    dueDate: "2024-01-31",
    status: "Pending",
    generatedDate: "2024-01-01",
    items: [
      {
        id: 1,
        description: "Maintenance Charge",
        amount: 1500,
        type: "Fixed",
      },
      { id: 2, description: "Utility Charge", amount: 300, type: "Variable" },
    ],
  },
  {
    id: 5,
    resident: "Ashna",
    apartment: "E-205",
    month: "January",
    year: 2024,
    amount: 2300,
    dueDate: "2024-01-31",
    status: "Pending",
    generatedDate: "2024-01-01",
    items: [
      {
        id: 1,
        description: "Maintenance Charge",
        amount: 1500,
        type: "Fixed",
      },
      { id: 2, description: "Parking Fee", amount: 500, type: "Fixed" },
      { id: 3, description: "Utility Charge", amount: 300, type: "Variable" },
    ],
  },
];

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "John Smith",
    apartment: "A-101",
    vehicleType: "Car",
    make: "Toyota",
    model: "Camry",
    year: 2020,
    color: "Silver",
    licensePlate: "DL01AB1234",
    registrationDate: "2024-01-10",
    qrCode: JSON.stringify({
      type: "vehicle_entry",
      residentId: 1,
      residentName: "John Smith",
      apartment: "A-101",
      vehicleType: "Car",
      licensePlate: "DL01AB1234",
      make: "Toyota",
      model: "Camry",
    }),
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Sarah Johnson",
    apartment: "B-205",
    vehicleType: "Bike",
    make: "Honda",
    model: "CBR150R",
    year: 2019,
    color: "Red",
    licensePlate: "DL02XY5678",
    registrationDate: "2024-01-12",
    qrCode: JSON.stringify({
      type: "vehicle_entry",
      residentId: 2,
      residentName: "Sarah Johnson",
      apartment: "B-205",
      vehicleType: "Bike",
      licensePlate: "DL02XY5678",
      make: "Honda",
      model: "CBR150R",
    }),
  },
];

const initialDeliveryPersons: DeliveryPerson[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "John Smith",
    apartment: "A-101",
    riderName: "Ahmed Khan",
    idNumber: "12345-6789012-3",
    idType: "CNIC",
    companyName: "FoodPanda",
    description: "Food delivery for dinner",
    registrationDate: "2024-01-16",
    qrCode: JSON.stringify({
      type: "delivery_entry",
      residentId: 1,
      residentName: "John Smith",
      apartment: "A-101",
      riderName: "Ahmed Khan",
      companyName: "FoodPanda",
      description: "Food delivery for dinner",
    }),
  },
];

const initialServiceRequests: ServiceRequest[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "John Smith",
    apartment: "A-101",
    serviceType: "Plumbing",
    description: "Fix leaking kitchen tap",
    status: "Completed",
    priority: "Medium",
    requestDate: "2024-01-14",
    completedDate: "2024-01-15",
    cost: 150,
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Sarah Johnson",
    apartment: "B-205",
    serviceType: "Electrical",
    description: "Install new ceiling fan in bedroom",
    status: "In Progress",
    priority: "Low",
    requestDate: "2024-01-15",
  },
  {
    id: 3,
    residentId: 4,
    residentName: "Emily Davis",
    apartment: "D-102",
    serviceType: "Housekeeping",
    description: "Deep cleaning service",
    status: "Pending",
    priority: "Low",
    requestDate: "2024-01-16",
  },
  {
    id: 4,
    residentId: 5,
    residentName: "Ashna",
    apartment: "E-205",
    serviceType: "Internet/Cable",
    description: "Fix WiFi connectivity issues",
    status: "In Progress",
    priority: "Medium",
    requestDate: "2024-01-17",
  },
];

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [gateEntries, setGateEntries] =
    useState<GateEntry[]>(initialGateEntries);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [maintenanceBills, setMaintenanceBills] = useState<MaintenanceBill[]>(
    initialMaintenanceBills,
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>(
    initialDeliveryPersons,
  );
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(
    initialServiceRequests,
  );
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([
    {
      id: 1,
      name: "Ahmed Khan",
      username: "ahmed.plumber",
      email: "ahmed.khan@email.com",
      phone: "+1 234-567-9001",
      password: "plumber123",
      idDocumentType: "CNIC",
      cnicNumber: "42101-1234567-8",
      serviceCategory: "Plumbing",
      keywords: "pipes, leaks, bathroom, kitchen, water supply",
      shortIntro:
        "Experienced plumber with 8+ years in residential plumbing. Specialized in leak repairs and bathroom installations.",
      experience: "8+ years",
      previousWork: "City Plumbing Services, Home Repair Co.",
      certifications: "Licensed Plumber, Pipe Fitting Certificate",
      availability: "Mon-Sat 8AM-6PM",
      serviceArea: "All blocks and nearby areas",
      additionalNotes:
        "Available for emergency calls. Carries all standard tools and equipment.",
      registrationDate: "2024-01-10",
      status: "Active",
      rating: 4.8,
      totalReviews: 24,
      completedJobs: 47,
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      username: "maria.electrician",
      email: "maria.rodriguez@email.com",
      phone: "+1 234-567-9002",
      password: "electric123",
      idDocumentType: "Driver License",
      driverLicenseNumber: "DL1234567890",
      serviceCategory: "Electrical",
      keywords:
        "wiring, outlets, switches, circuit breakers, electrical repair",
      shortIntro:
        "Certified electrician with expertise in residential electrical systems and smart home installations.",
      experience: "6+ years",
      previousWork: "PowerTech Solutions, Smart Homes Inc.",
      certifications: "Licensed Electrician, Smart Home Specialist",
      availability: "Mon-Fri 9AM-5PM, Emergency on call",
      serviceArea: "All residential areas",
      additionalNotes:
        "Specialized in modern electrical systems and energy-efficient solutions.",
      registrationDate: "2024-01-12",
      status: "Active",
      rating: 4.9,
      totalReviews: 18,
      completedJobs: 32,
    },
    {
      id: 3,
      name: "Raj Patel",
      username: "raj.cleaner",
      email: "raj.patel@email.com",
      phone: "+1 234-567-9003",
      password: "clean123",
      idDocumentType: "Passport",
      passportNumber: "P9876543210",
      serviceCategory: "Cleaning",
      keywords: "house cleaning, deep cleaning, maintenance, sanitization",
      shortIntro:
        "Professional cleaning service provider offering comprehensive home and office cleaning solutions.",
      experience: "5+ years",
      previousWork: "CleanPro Services, Sparkle Clean",
      certifications:
        "Professional Cleaning Certificate, Sanitization Training",
      availability: "Daily 7AM-7PM",
      serviceArea: "All blocks",
      additionalNotes:
        "Uses eco-friendly cleaning products. Team of 3 trained professionals.",
      registrationDate: "2024-01-08",
      status: "Active",
      rating: 4.7,
      totalReviews: 31,
      completedJobs: 89,
    },
    {
      id: 4,
      name: "David Wilson",
      username: "david.carpenter",
      email: "david.wilson@email.com",
      phone: "+1 234-567-9004",
      password: "wood123",
      idDocumentType: "CNIC",
      cnicNumber: "42101-9876543-2",
      serviceCategory: "Carpentry",
      keywords: "furniture, cabinet, wood work, repair, custom furniture",
      shortIntro:
        "Skilled carpenter specializing in custom furniture, cabinet making, and wood repair work.",
      experience: "10+ years",
      previousWork: "Custom Woods, Furniture Masters",
      certifications: "Master Carpenter, Wood Working Certificate",
      availability: "Mon-Sat 8AM-6PM",
      serviceArea: "All residential areas",
      additionalNotes:
        "Uses high-quality wood and materials. Provides design consultation.",
      registrationDate: "2024-01-15",
      status: "Pending",
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
    },
    {
      id: 5,
      name: "Sarah Johnson",
      username: "sarah.painter",
      email: "sarah.johnson.painter@email.com",
      phone: "+1 234-567-9005",
      password: "paint123",
      idDocumentType: "Driver License",
      driverLicenseNumber: "DL5555555555",
      serviceCategory: "Painting",
      keywords:
        "interior painting, exterior painting, wall decoration, color consultation",
      shortIntro:
        "Professional painter with expertise in both interior and exterior painting. Color consultation available.",
      experience: "7+ years",
      previousWork: "ColorFul Paints, Home Makeover Solutions",
      certifications: "Professional Painter License, Color Theory Certificate",
      availability: "Mon-Fri 8AM-5PM",
      serviceArea: "All blocks and surrounding areas",
      additionalNotes:
        "Provides free color consultation and uses premium quality paints.",
      registrationDate: "2024-01-14",
      status: "Pending",
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
    },
  ]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>([]);

  // Helper functions
  const addResident = (resident: Omit<Resident, "id">) => {
    const newResident = {
      ...resident,
      id: Math.max(...residents.map((r) => r.id), 0) + 1,
    };
    setResidents((prev) => [...prev, newResident]);
  };

  const updateResident = (id: number, updates: Partial<Resident>) => {
    setResidents((prev) =>
      prev.map((resident) =>
        resident.id === id ? { ...resident, ...updates } : resident,
      ),
    );
  };

  const deleteResident = (id: number) => {
    setResidents((prev) => prev.filter((resident) => resident.id !== id));
  };

  const addComplaint = (complaint: Omit<Complaint, "id" | "timestamp">) => {
    const newComplaint = {
      ...complaint,
      id: Math.max(...complaints.map((c) => c.id), 0) + 1,
      timestamp: new Date(),
    };
    setComplaints((prev) => [...prev, newComplaint]);
  };

  const addComplaintWithResident = (
    complaint: Omit<Complaint, "id" | "timestamp">,
  ) => {
    const newComplaint = {
      ...complaint,
      id: Math.max(...complaints.map((c) => c.id), 0) + 1,
      timestamp: new Date(),
    };
    setComplaints((prev) => [...prev, newComplaint]);
  };

  const updateComplaintStatus = (id: number, status: string) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id
          ? { ...complaint, status, timestamp: new Date() }
          : complaint,
      ),
    );
  };

  const updateComplaintWithResponse = (id: number, adminResponse: string) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              adminResponse,
              responseDate: new Date().toISOString().split("T")[0],
              status: "In Progress",
            }
          : complaint,
      ),
    );
  };

  const addGateEntry = (entry: Omit<GateEntry, "id">) => {
    // AGGRESSIVE DUPLICATE PREVENTION AT DATA LAYER
    const currentTime = new Date();
    const currentTimeString = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const currentDateString = currentTime.toISOString().split("T")[0];

    // Check for exact duplicates in last 30 seconds
    const recentDuplicates = gateEntries.filter((existingEntry) => {
      const existingTime = new Date(
        existingEntry.date + " " + existingEntry.time,
      );
      const timeDiff = currentTime.getTime() - existingTime.getTime();

      return (
        existingEntry.person === entry.person &&
        existingEntry.apartment === entry.apartment &&
        existingEntry.type === entry.type &&
        existingEntry.entryType === entry.entryType &&
        existingEntry.vehicle === entry.vehicle &&
        timeDiff < 30000 // 30 seconds
      );
    });

    if (recentDuplicates.length > 0) {
      console.log("🚫 DUPLICATE ENTRY BLOCKED at data layer:", {
        person: entry.person,
        apartment: entry.apartment,
        type: entry.type,
        duplicatesFound: recentDuplicates.length,
      });
      return; // Block duplicate entry
    }

    // Check for same person, same type within 2 minutes (too frequent)
    const recentSamePersonEntries = gateEntries.filter((existingEntry) => {
      const existingTime = new Date(
        existingEntry.date + " " + existingEntry.time,
      );
      const timeDiff = currentTime.getTime() - existingTime.getTime();

      return (
        existingEntry.person === entry.person &&
        existingEntry.apartment === entry.apartment &&
        existingEntry.type === entry.type &&
        timeDiff < 120000 // 2 minutes
      );
    });

    if (recentSamePersonEntries.length > 0) {
      console.log(
        "⏰ FREQUENT ENTRY BLOCKED - Same person/type within 2 minutes:",
        {
          person: entry.person,
          type: entry.type,
          recentEntries: recentSamePersonEntries.length,
        },
      );
      return; // Block too frequent entries
    }

    const newEntry = {
      ...entry,
      id: Math.max(...gateEntries.map((e) => e.id), 0) + 1,
      time: currentTimeString, // Ensure consistent time format
      date: currentDateString, // Ensure consistent date format
    };

    console.log("✅ ENTRY APPROVED at data layer:", {
      person: newEntry.person,
      type: newEntry.type,
      time: newEntry.time,
      id: newEntry.id,
    });

    setGateEntries((prev) => [...prev, newEntry]);
  };

  const addAnnouncement = (announcement: Omit<Announcement, "id">) => {
    const newAnnouncement = {
      ...announcement,
      id: Math.max(...announcements.map((a) => a.id), 0) + 1,
    };
    setAnnouncements((prev) => [...prev, newAnnouncement]);
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements((prev) =>
      prev.filter((announcement) => announcement.id !== id),
    );
  };

  const addMaintenanceBill = (bill: Omit<MaintenanceBill, "id">) => {
    const newBill = {
      ...bill,
      id: Math.max(...maintenanceBills.map((b) => b.id), 0) + 1,
    };
    setMaintenanceBills((prev) => [...prev, newBill]);
  };

  const updateMaintenanceBillStatus = (
    id: number,
    status: "Pending" | "Paid" | "Overdue",
    paidDate?: string,
  ) => {
    setMaintenanceBills((prev) =>
      prev.map((bill) =>
        bill.id === id
          ? {
              ...bill,
              status,
              paidDate:
                status === "Paid"
                  ? paidDate || new Date().toISOString().split("T")[0]
                  : bill.paidDate,
            }
          : bill,
      ),
    );
  };

  const addMultipleMaintenanceBills = (
    bills: Omit<MaintenanceBill, "id">[],
  ) => {
    const newBills = bills.map((bill, index) => ({
      ...bill,
      id: Math.max(...maintenanceBills.map((b) => b.id), 0) + index + 1,
    }));
    setMaintenanceBills((prev) => [...prev, ...newBills]);
  };

  // Vehicle functions
  const addVehicle = (vehicle: Omit<Vehicle, "id" | "qrCode">) => {
    const qrCode = JSON.stringify({
      type: "vehicle_entry",
      residentId: vehicle.residentId,
      residentName: vehicle.residentName,
      apartment: vehicle.apartment,
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
    });

    const newVehicle = {
      ...vehicle,
      id: Math.max(...vehicles.map((v) => v.id), 0) + 1,
      qrCode,
    };
    setVehicles((prev) => [...prev, newVehicle]);
  };

  const deleteVehicle = (id: number) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
  };

  // Delivery functions
  const addDeliveryPerson = (
    delivery: Omit<DeliveryPerson, "id" | "qrCode">,
  ) => {
    const qrCode = JSON.stringify({
      type: "delivery_entry",
      residentId: delivery.residentId,
      residentName: delivery.residentName,
      apartment: delivery.apartment,
      riderName: delivery.riderName,
      companyName: delivery.companyName,
      description: delivery.description,
    });

    const newDelivery = {
      ...delivery,
      id: Math.max(...deliveryPersons.map((d) => d.id), 0) + 1,
      qrCode,
    };
    setDeliveryPersons((prev) => [...prev, newDelivery]);
  };

  const deleteDeliveryPerson = (id: number) => {
    setDeliveryPersons((prev) => prev.filter((delivery) => delivery.id !== id));
  };

  // Service request functions
  const addServiceRequest = (request: Omit<ServiceRequest, "id">) => {
    const newRequest = {
      ...request,
      id: Math.max(...serviceRequests.map((s) => s.id), 0) + 1,
    };
    setServiceRequests((prev) => [...prev, newRequest]);
  };

  const updateServiceRequestStatus = (
    id: number,
    status: string,
    cost?: number,
  ) => {
    setServiceRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              cost,
              completedDate:
                status === "Completed"
                  ? new Date().toISOString().split("T")[0]
                  : request.completedDate,
            }
          : request,
      ),
    );
  };

  // Authentication functions
  const authenticateResident = (
    username: string,
    password: string,
  ): Resident | null => {
    const resident = residents.find(
      (r) =>
        r.username === username &&
        r.password === password 
    );
    return resident || null;
  };

  const registerResident = (
    residentData: Omit<Resident, "id" | "approvalStatus" | "appliedDate">,
  ) => {
    const newResident = {
      ...residentData,
      id: Math.max(...residents.map((r) => r.id), 0) + 1,
      approvalStatus: "Pending" as const,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setResidents((prev) => [...prev, newResident]);
  };

  const approveResident = (id: number) => {
    setResidents((prev) =>
      prev.map((resident) =>
        resident.id === id
          ? {
              ...resident,
              approvalStatus: "Approved" as const,
              status: "Active",
              joinDate: new Date().toISOString().split("T")[0],
            }
          : resident,
      ),
    );
  };

  const rejectResident = (id: number) => {
    setResidents((prev) =>
      prev.map((resident) =>
        resident.id === id
          ? { ...resident, approvalStatus: "Rejected" as const }
          : resident,
      ),
    );
  };

  // Data getters for specific residents
  const getResidentComplaints = (residentId: number): Complaint[] => {
    return complaints.filter(
      (complaint) => complaint.residentId === residentId,
    );
  };

  const getResidentVehicles = (residentId: number): Vehicle[] => {
    return vehicles.filter((vehicle) => vehicle.residentId === residentId);
  };

  const getResidentServiceRequests = (residentId: number): ServiceRequest[] => {
    return serviceRequests.filter(
      (request) => request.residentId === residentId,
    );
  };

  const getResidentBills = (residentId: number): MaintenanceBill[] => {
    const resident = residents.find((r) => r.id === residentId);
    if (!resident) return [];
    return maintenanceBills.filter(
      (bill) => bill.apartment === resident.apartment,
    );
  };

  // Real-time statistics calculation
  const getStatistics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalResidents = residents.filter(
      (r) => r.status === "Active",
    ).length;
    const activeComplaints = complaints.filter(
      (c) => c.status === "Open" || c.status === "In Progress",
    ).length;

    // Calculate real pending payments from maintenance bills
    const pendingAmount = maintenanceBills
      .filter((bill) => bill.status === "Pending" || bill.status === "Overdue")
      .reduce((sum, bill) => sum + bill.amount, 0);
    const pendingPayments = `$${pendingAmount.toLocaleString()}`;

    const gateEntriesToday = gateEntries.filter(
      (e) => e.date === today.toISOString().split("T")[0],
    ).length;
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

    const pendingApprovals = residents.filter(
      (r) => r.approvalStatus === "Pending",
    ).length;

    return {
      totalResidents,
      activeComplaints,
      pendingPayments,
      gateEntriesToday,
      openComplaints,
      inProgressComplaints,
      resolvedToday,
      pendingApprovals,
    };
  };

  // Service Provider functions
  const registerServiceProvider = (
    serviceProviderData: Omit<
      ServiceProvider,
      "id" | "status" | "rating" | "totalReviews" | "completedJobs"
    >,
  ) => {
    const newServiceProvider: ServiceProvider = {
      ...serviceProviderData,
      id: Math.max(...serviceProviders.map((sp) => sp.id), 0) + 1,
      status: "Pending",
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
    };
    setServiceProviders((prev) => [...prev, newServiceProvider]);
  };

  const authenticateServiceProvider = (
    username: string,
    password: string,
  ): ServiceProvider | null => {
    return (
      serviceProviders.find(
        (sp) =>
          sp.username === username &&
          sp.password === password 
      ) || null
    );
  };

  const approveServiceProvider = (id: number) => {
    setServiceProviders((prev) =>
      prev.map((sp) =>
        sp.id === id ? { ...sp, status: "Active" as const } : sp,
      ),
    );
  };

  const rejectServiceProvider = (id: number) => {
    setServiceProviders((prev) =>
      prev.map((sp) =>
        sp.id === id ? { ...sp, status: "Rejected" as const } : sp,
      ),
    );
  };

  const updateServiceProvider = (
    id: number,
    updates: Partial<ServiceProvider>,
  ) => {
    setServiceProviders((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, ...updates } : sp)),
    );
  };

  const getServiceProviderBookings = (
    serviceProviderId: number,
  ): ServiceBooking[] => {
    return serviceBookings.filter(
      (booking) => booking.serviceProviderId === serviceProviderId,
    );
  };

  const getServiceProviderReviews = (
    serviceProviderId: number,
  ): ServiceReview[] => {
    return serviceReviews.filter(
      (review) => review.serviceProviderId === serviceProviderId,
    );
  };

  const getServiceProviderVehicles = (serviceProviderId: number): Vehicle[] => {
    const serviceProvider = serviceProviders.find(
      (sp) => sp.id === serviceProviderId,
    );
    return serviceProvider?.vehicles || [];
  };

  const addServiceBooking = (booking: Omit<ServiceBooking, "id">) => {
    const newBooking: ServiceBooking = {
      ...booking,
      id: Math.max(...serviceBookings.map((b) => b.id), 0) + 1,
    };
    setServiceBookings((prev) => [...prev, newBooking]);
  };

  const updateBookingStatus = (
    id: number,
    status: ServiceBooking["status"],
    actualCost?: number,
  ) => {
    setServiceBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status,
              actualCost: actualCost || booking.actualCost,
              completionDate:
                status === "Completed"
                  ? new Date().toISOString().split("T")[0]
                  : booking.completionDate,
            }
          : booking,
      ),
    );

    // If booking is completed, update service provider's completed jobs count
    if (status === "Completed") {
      const booking = serviceBookings.find((b) => b.id === id);
      if (booking) {
        setServiceProviders((prev) =>
          prev.map((sp) =>
            sp.id === booking.serviceProviderId
              ? { ...sp, completedJobs: (sp.completedJobs || 0) + 1 }
              : sp,
          ),
        );
      }
    }
  };

  const addServiceReview = (review: Omit<ServiceReview, "id">) => {
    const newReview: ServiceReview = {
      ...review,
      id: Math.max(...serviceReviews.map((r) => r.id), 0) + 1,
    };
    setServiceReviews((prev) => [...prev, newReview]);

    // Update service provider's rating and review count
    const serviceProviderReviews = serviceReviews.filter(
      (r) => r.serviceProviderId === review.serviceProviderId,
    );
    serviceProviderReviews.push(newReview);

    const averageRating =
      serviceProviderReviews.reduce((sum, r) => sum + r.rating, 0) /
      serviceProviderReviews.length;

    setServiceProviders((prev) =>
      prev.map((sp) =>
        sp.id === review.serviceProviderId
          ? {
              ...sp,
              rating: Math.round(averageRating * 10) / 10,
              totalReviews: serviceProviderReviews.length,
            }
          : sp,
      ),
    );
  };

  const contextValue: AdminDataContextType = {
    residents,
    complaints,
    gateEntries,
    announcements,
    maintenanceBills,
    vehicles,
    deliveryPersons,
    serviceRequests,
    serviceProviders,
    serviceBookings,
    serviceReviews,
    setResidents,
    setComplaints,
    setGateEntries,
    setAnnouncements,
    setMaintenanceBills,
    setVehicles,
    setDeliveryPersons,
    setServiceRequests,
    setServiceProviders,
    setServiceBookings,
    setServiceReviews,
    addResident,
    updateResident,
    deleteResident,
    addComplaint,
    addComplaintWithResident,
    updateComplaintStatus,
    updateComplaintWithResponse,
    addGateEntry,
    addAnnouncement,
    deleteAnnouncement,
    addMaintenanceBill,
    updateMaintenanceBillStatus,
    addMultipleMaintenanceBills,
    addVehicle,
    deleteVehicle,
    addDeliveryPerson,
    deleteDeliveryPerson,
    addServiceRequest,
    updateServiceRequestStatus,
    authenticateResident,
    registerResident,
    approveResident,
    rejectResident,
    getResidentComplaints,
    getResidentVehicles,
    getResidentServiceRequests,
    getResidentBills,
    getStatistics,
    registerServiceProvider,
    authenticateServiceProvider,
    approveServiceProvider,
    rejectServiceProvider,
    updateServiceProvider,
    getServiceProviderBookings,
    getServiceProviderReviews,
    getServiceProviderVehicles,
    addServiceBooking,
    updateBookingStatus,
    addServiceReview,
  };

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
