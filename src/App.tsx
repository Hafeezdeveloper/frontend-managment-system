import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ResidentProvider } from "@/contexts/ResidentContext";
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import { ServiceProviderProvider } from "@/contexts/ServiceProviderContext";

// Pages
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Auth Pages
import AdminLogin from "./pages/auth/AdminLogin";
import ResidentAuth from "./pages/auth/ResidentAuth";
import ServiceProviderAuth from "./pages/auth/ServiceProviderAuth";
import EmployeeAuth from "./pages/auth/EmployeeAuth";

// Dashboard Pages
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ResidentDashboard from "./pages/dashboards/ResidentDashboard";
import ServiceProviderDashboard from "./pages/dashboards/ServiceProviderDashboard";

// Admin Feature Pages
import AdminResidents from "./pages/admin/AdminResidents";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminGateManagement from "./pages/admin/AdminGateManagement";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminMaintenance from "./pages/admin/AdminMaintenance";
import AdminServiceProviders from "./pages/admin/AdminServiceProviders";
import AdminEmployeeRegistration from "./pages/admin/AdminEmployeeRegistration";

// Resident Feature Pages
import ResidentRegistration from "./pages/resident/ResidentRegistration";
import GuestRegistration from "./pages/resident/GuestRegistration";
import ComplaintSystem from "./pages/resident/ComplaintSystem";
import ServiceBooking from "./pages/resident/ServiceBooking";
import BillingSystem from "./pages/resident/BillingSystem";
import ResidentProfile from "./pages/resident/ResidentProfile";
import VehicleRegistration from "./pages/resident/VehicleRegistration";
import DeliveryRegistration from "./pages/resident/DeliveryRegistration";
import ServiceProviderVehicleRegistration from "./pages/serviceprovider/ServiceProviderVehicleRegistration";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminDataProvider>
      <ResidentProvider>
        <ServiceProviderProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Main Flow */}
                  <Route path="/" element={<Splash />} />
                  <Route path="/home" element={<Home />} />

                  {/* Authentication Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/resident/auth" element={<ResidentAuth />} />
                  <Route
                    path="/service-provider/auth"
                    element={<ServiceProviderAuth />}
                  />
                  <Route path="/employee/auth" element={<EmployeeAuth />} />

                  {/* Dashboard Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route
                    path="/resident/dashboard"
                    element={<ResidentDashboard />}
                  />
                  <Route
                    path="/service-provider/dashboard"
                    element={<ServiceProviderDashboard />}
                  />

                  {/* Resident Feature Routes */}
                  <Route
                    path="/resident/registration"
                    element={<ResidentRegistration />}
                  />
                  <Route
                    path="/resident/guests"
                    element={<GuestRegistration />}
                  />
                  <Route
                    path="/resident/complaints"
                    element={<ComplaintSystem />}
                  />
                  <Route
                    path="/resident/services"
                    element={<ServiceBooking />}
                  />
                  <Route path="/resident/billing" element={<BillingSystem />} />
                  <Route
                    path="/resident/profile"
                    element={<ResidentProfile />}
                  />
                  <Route
                    path="/resident/vehicles"
                    element={<VehicleRegistration />}
                  />
                  <Route
                    path="/resident/delivery"
                    element={<DeliveryRegistration />}
                  />

                  {/* Admin Sub-routes */}
                  <Route path="/admin/residents" element={<AdminResidents />} />
                  <Route
                    path="/admin/complaints"
                    element={<AdminComplaints />}
                  />
                  <Route
                    path="/admin/gate-management"
                    element={<AdminGateManagement />}
                  />
                  <Route
                    path="/admin/announcements"
                    element={<AdminAnnouncements />}
                  />
                  <Route
                    path="/admin/maintenance"
                    element={<AdminMaintenance />}
                  />
                  <Route
                    path="/admin/service-providers"
                    element={<AdminServiceProviders />}
                  />
                  <Route
                    path="/admin/employee-registration"
                    element={<AdminEmployeeRegistration />}
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <div className="min-h-screen bg-red-50 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-red-800">
                            Analytics Dashboard
                          </h1>
                          <p className="text-red-600 mt-2">
                            Feature under development
                          </p>
                        </div>
                      </div>
                    }
                  />

                  {/* Service Provider Routes */}
                  <Route
                    path="/service-provider/profile"
                    element={
                      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-purple-800">
                            Service Provider Profile
                          </h1>
                          <p className="text-purple-600 mt-2">
                            Feature under development
                          </p>
                        </div>
                      </div>
                    }
                  />
                  <Route
                    path="/service-provider/bookings"
                    element={
                      <div className="min-h-screen bg-green-50 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-green-800">
                            Service Bookings
                          </h1>
                          <p className="text-green-600 mt-2">
                            Feature under development
                          </p>
                        </div>
                      </div>
                    }
                  />
                  <Route
                    path="/service-provider/vehicles/register"
                    element={<ServiceProviderVehicleRegistration />}
                  />

                  {/* Employee Routes */}
                  <Route
                    path="/employee/dashboard"
                    element={
                      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-yellow-800">
                            Employee Dashboard
                          </h1>
                          <p className="text-yellow-600 mt-2">
                            Feature under development
                          </p>
                        </div>
                      </div>
                    }
                  />

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </ServiceProviderProvider>
      </ResidentProvider>
    </AdminDataProvider>
  </QueryClientProvider>
);

export default App;
