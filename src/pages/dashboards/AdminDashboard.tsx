import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  Users,
  AlertTriangle,
  DollarSign,
  Activity,
  Home,
  Wrench,
  Building2,
  RefreshCw,
  Calculator,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminData } from "@/contexts/AdminDataContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getStatistics, serviceProviders } = useAdminData();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    navigate("/home");
  };

  // Get real-time statistics
  const statistics = getStatistics();

  // Real-time update mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const stats = [
    {
      title: "Total Residents",
      value: statistics.totalResidents.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Active residents",
    },
    {
      title: "Active Complaints",
      value: statistics.activeComplaints.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Open + In Progress",
    },
    {
      title: "Pending Payments",
      value: statistics.pendingPayments,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Maintenance dues",
    },
    {
      title: "Gate Entries Today",
      value: statistics.gateEntriesToday.toString(),
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "All entries today",
    },
  ];

  const quickActions = [
    {
      title: "Resident Management",
      description: "View and manage resident profiles",
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      route: "/admin/residents",
      stats: `${statistics.totalResidents} active residents`,
    },
    {
      title: "Complaint Management",
      description: "Review and respond to complaints",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      route: "/admin/complaints",
      stats: `${statistics.openComplaints} open, ${statistics.inProgressComplaints} in progress`,
    },
    {
      title: "Gate Management",
      description: "View gate entry and exit logs",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      route: "/admin/gate-management",
      stats: `${statistics.gateEntriesToday} entries today`,
    },
    {
      title: "Announcements",
      description: "Create and manage society announcements",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      route: "/admin/announcements",
      stats: "Broadcast to all residents",
    },
    {
      title: "Maintenance Management",
      description: "Generate and manage maintenance bills",
      icon: Calculator,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      route: "/admin/maintenance",
      stats: `${statistics.totalResidents} residents to bill`,
    },
    {
      title: "Service Providers",
      description: "Approve and manage service providers",
      icon: Wrench,
      color: "text-green-600",
      bgColor: "bg-green-50",
      route: "/admin/service-providers",
      stats: `${serviceProviders.length} registered providers`,
    },
    {
      title: "Employee Registration",
      description: "Register employees with KYC and generate QR codes",
      icon: UserPlus,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      route: "/admin/employee-registration",
      stats: "Register new staff members",
    },
  ];

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-admin-gradient p-2 rounded-lg shadow-admin mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  AI Drivin Digital Integrated Society Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="text-gray-600"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                onClick={handleLogout}
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
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, Admin
                </h2>
                <p className="text-gray-600">
                  Here's what's happening in your society today.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Live data • Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 transition-all duration-300">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
                    onClick={() => handleQuickAction(action.route)}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`${action.bgColor} p-3 rounded-lg mb-4 w-fit`}
                      >
                        <Icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {action.description}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {action.stats}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
