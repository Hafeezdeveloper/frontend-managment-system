import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Bell,
  Send,
  Calendar,
  User,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateUniqueId } from "@/lib/utils";

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  date: string;
  status: "draft" | "published";
  createdAt: string;
}

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "draft" as "draft" | "published",
  });

  const [addForm, setAddForm] = useState({
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "draft" as "draft" | "published",
  });

  // Mock announcements data - now stateful
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Society Annual Meeting",
      message:
        "Annual general meeting scheduled for next Sunday at 10 AM in the community hall. All residents are requested to attend.",
      priority: "high",
      date: "2024-01-16",
      status: "published",
      createdAt: "2024-01-16T10:00:00Z",
    },
    {
      id: 2,
      title: "Water Supply Maintenance",
      message:
        "Water supply will be interrupted on Saturday from 8 AM to 2 PM for maintenance work. Please store water in advance.",
      priority: "medium",
      date: "2024-01-15",
      status: "published",
      createdAt: "2024-01-15T08:00:00Z",
    },
    {
      id: 3,
      title: "New Security Guidelines",
      message:
        "Please ensure all guests are registered before their visit for smooth entry. New QR code system is now active.",
      priority: "low",
      date: "2024-01-14",
      status: "published",
      createdAt: "2024-01-14T14:00:00Z",
    },
    {
      id: 4,
      title: "Parking Rules Update",
      message:
        "New parking rules will be effective from next month. Visitors parking is now limited to 2 hours.",
      priority: "medium",
      date: "2024-01-13",
      status: "draft",
      createdAt: "2024-01-13T16:00:00Z",
    },
  ]);

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handler functions
  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewDialogOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setEditForm({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      status: announcement.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
    console.log("Deleted announcement:", announcement.title);
  };

  const handleSaveEdit = () => {
    if (!selectedAnnouncement) return;

    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === selectedAnnouncement.id
          ? {
              ...announcement,
              title: editForm.title,
              message: editForm.message,
              priority: editForm.priority,
              status: editForm.status,
              date: new Date().toISOString().split("T")[0],
            }
          : announcement,
      ),
    );

    setIsEditDialogOpen(false);
    console.log("Successfully updated announcement:", editForm.title);
  };

  const handleAddAnnouncement = () => {
    if (!addForm.title || !addForm.message) {
      alert("Please fill in all required fields");
      return;
    }

    const newAnnouncement: Announcement = {
      id: generateUniqueId(announcements),
      title: addForm.title,
      message: addForm.message,
      priority: addForm.priority,
      date: new Date().toISOString().split("T")[0],
      status: addForm.status,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    setAddForm({
      title: "",
      message: "",
      priority: "medium",
      status: "draft",
    });
    setIsAddDialogOpen(false);
    console.log("Successfully added new announcement:", newAnnouncement.title);
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  // Calculate dynamic stats
  const totalAnnouncements = announcements.length;
  const publishedAnnouncements = announcements.filter(
    (a) => a.status === "published",
  ).length;
  const draftAnnouncements = announcements.filter(
    (a) => a.status === "draft",
  ).length;
  const highPriorityAnnouncements = announcements.filter(
    (a) => a.priority === "high",
  ).length;

  const stats = [
    {
      title: "Total Announcements",
      value: totalAnnouncements.toString(),
      icon: Bell,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Published",
      value: publishedAnnouncements.toString(),
      icon: Send,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Drafts",
      value: draftAnnouncements.toString(),
      icon: Edit,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "High Priority",
      value: highPriorityAnnouncements.toString(),
      icon: Bell,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
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
                  Society Announcements
                </h1>
                <p className="text-sm text-gray-500">
                  Create and manage society announcements
                </p>
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleOpenAddDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
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

          {/* Search */}
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Search Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Announcements Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>All Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {announcement.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {announcement.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityColor(announcement.priority)}
                        >
                          {announcement.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(announcement.status)}>
                          {announcement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {announcement.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAnnouncement(announcement)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Announcement
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {announcement.title}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteAnnouncement(announcement)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* View Announcement Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Announcement Details</DialogTitle>
              </DialogHeader>
              {selectedAnnouncement && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Title
                    </Label>
                    <p className="text-gray-900 font-medium text-lg">
                      {selectedAnnouncement.title}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Message
                    </Label>
                    <p className="text-gray-900 mt-1">
                      {selectedAnnouncement.message}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Priority
                      </Label>
                      <Badge
                        className={getPriorityColor(
                          selectedAnnouncement.priority,
                        )}
                      >
                        {selectedAnnouncement.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Status
                      </Label>
                      <Badge
                        className={getStatusColor(selectedAnnouncement.status)}
                      >
                        {selectedAnnouncement.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Date
                      </Label>
                      <p className="text-gray-900">
                        {selectedAnnouncement.date}
                      </p>
                    </div>
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

          {/* Edit Announcement Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Announcement</DialogTitle>
                <DialogDescription>
                  Update announcement details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-message">Message *</Label>
                  <Textarea
                    id="edit-message"
                    rows={4}
                    value={editForm.message}
                    onChange={(e) =>
                      setEditForm({ ...editForm, message: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editForm.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setEditForm({ ...editForm, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value: "draft" | "published") =>
                        setEditForm({ ...editForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Announcement Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement for all residents
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="add-title">Title *</Label>
                  <Input
                    id="add-title"
                    placeholder="Enter announcement title"
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm({ ...addForm, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="add-message">Message *</Label>
                  <Textarea
                    id="add-message"
                    rows={4}
                    placeholder="Enter announcement message"
                    value={addForm.message}
                    onChange={(e) =>
                      setAddForm({ ...addForm, message: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-priority">Priority</Label>
                    <Select
                      value={addForm.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setAddForm({ ...addForm, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-status">Status</Label>
                    <Select
                      value={addForm.status}
                      onValueChange={(value: "draft" | "published") =>
                        setAddForm({ ...addForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Save as Draft</SelectItem>
                        <SelectItem value="published">Publish Now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAnnouncement}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {addForm.status === "published" ? "Publish" : "Save Draft"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default AdminAnnouncements;
