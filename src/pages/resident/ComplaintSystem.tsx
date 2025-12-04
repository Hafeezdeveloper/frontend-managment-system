import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Mic,
  MicOff,
  Camera,
  Upload,
  ArrowLeft,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Image,
  Trash2,
  Play,
  Pause,
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
import { Textarea } from "@/components/ui/textarea";
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
import { useResident } from "@/contexts/ResidentContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from "axios";
import { baseUrl } from "@/Helper/constants";
import Cookies from "js-cookie";

const ComplaintSystem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentResident } = useResident();
  const { getResidentComplaints, addComplaintWithResident } = useAdminData();

  // Speech recognition hooks
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const [activeTab, setActiveTab] = useState("lodge");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceNote, setVoiceNote] = useState<string>("");

  const [newComplaint, setNewComplaint] = useState({
    title: "",
    category: "",
    description: "",
    compalainText: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    voiceNote: "",
  });

  // Update description with speech recognition transcript
  useEffect(() => {
    if (transcript) {
      setNewComplaint(prev => ({
        ...prev,
        compalainText: transcript
      }));
    }
  }, [transcript]);

  // Get user's complaints from shared context
  const userComplaints = currentResident
    ? getResidentComplaints(currentResident.id)
    : [];

  // Redirect if not authenticated
  if (!currentResident) {
    navigate("/resident/auth");
    return null;
  }

  const categories = [
    { value: "Plumbing", label: "Plumbing" },
    { value: "Electrical", label: "Electrical" },
    { value: "Elevator", label: "Elevator/Lift" },
    { value: "HVAC", label: "AC/Heating" },
    { value: "Security", label: "Security" },
    { value: "Parking", label: "Parking" },
    { value: "Neighbor", label: "Noise Complaint" },
    { value: "Maintenance", label: "General Maintenance" },
    { value: "Sanitation", label: "Cleanliness" },
    { value: "Utilities", label: "Utilities" },
    { value: "Amenities", label: "Amenities" },
    { value: "Other", label: "Other" },
  ];

  const handleInputChange = (field: keyof typeof newComplaint, value: any) => {
    setNewComplaint((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image should not exceed 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewComplaint((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewComplaint((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const startRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      setError("Your browser doesn't support speech recognition. Please use Chrome or Edge.");
      return;
    }

    if (!isMicrophoneAvailable) {
      setError("Microphone access is required for voice recording. Please check your permissions.");
      return;
    }

    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    setRecordingTime(0);

    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // Auto stop after 60 seconds
    setTimeout(() => {
      stopRecording();
      clearInterval(timer);
    }, 60000);
  };

  const stopRecording = () => {
    SpeechRecognition.stopListening();
    if (transcript) {
      setVoiceNote(transcript);
      setNewComplaint(prev => ({
        ...prev,
        compalainText: transcript
      }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateForm = (): boolean => {
    if (!newComplaint.title || !newComplaint.category || !newComplaint.description) {
      setError("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(`${baseUrl}/residents/complaints`,
        {
          ...newComplaint,
          residentId: currentResident.id,
          compalainText:voiceNote
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('authToken')}`
          },
        },
        
      );

      console.log(response)
     

      setSuccess(
        "Complaint submitted successfully! You will receive updates on the status.",
      );
      toast.success("Complaint submitted successfully!");

      // Reset form
      setNewComplaint({
        title: "",
        category: "",
        description: "",
        priority: "Medium",
        voiceNote: "",
        compalainText: ""
      });
      setVoiceNote("");
      resetTranscript();
      setActiveTab("history");
    } catch (err) {
      setError(err.message || "Failed to submit complaint. Please try again.");
      toast.error("Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Clock className="w-4 h-4" />;
      case "in progress":
        return <AlertTriangle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const ComplaintDetailModal = ({ complaint }: { complaint: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{complaint.title}</h3>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(complaint.status)}>
                {getStatusIcon(complaint.status)}
                <span className="ml-1 capitalize">{complaint.status}</span>
              </Badge>
              <Badge className={getPriorityColor(complaint.priority)}>
                {complaint.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Complaint ID:</strong> #{complaint.id}
            </div>
            <div>
              <strong>Category:</strong> {complaint.category}
            </div>
            <div>
              <strong>Created:</strong> {complaint.date}
            </div>
            <div>
              <strong>Last Updated:</strong>{" "}
              {complaint.timestamp.toLocaleDateString()}
            </div>
          </div>

          <div>
            <strong>Description:</strong>
            <p className="mt-1 text-gray-700">{complaint.description}</p>
          </div>

          {complaint.images && complaint.images.length > 0 && (
            <div>
              <strong>Attached Images:</strong>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {complaint.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="w-full h-24 bg-gray-100 border rounded overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {complaint.voiceNote && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <strong className="text-purple-800">Voice Note:</strong>
              <p className="mt-1 text-purple-700">{complaint.voiceNote}</p>
            </div>
          )}

          {complaint.adminResponse && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <strong className="text-blue-800">Admin Response:</strong>
              <p className="mt-1 text-blue-700">{complaint.adminResponse}</p>
              {complaint.responseDate && (
                <p className="text-xs text-blue-600 mt-2">
                  Responded on: {complaint.responseDate}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/resident/dashboard")}
            className="mb-4 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Complaint Management
            </h1>
            <p className="text-gray-600">
              Lodge complaints and track their resolution status
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: {currentResident.name} ({currentResident.apartment})
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200">
                <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                  <TabsTrigger
                    value="lodge"
                    className="flex-1 py-4 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Lodge Complaint
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex-1 py-4 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    My Complaints ({userComplaints.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="lodge" className="p-8">
                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Complaint Details
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-gray-700 font-medium"
                          >
                            Complaint Title *
                          </Label>
                          <Input
                            id="title"
                            value={newComplaint.title}
                            onChange={(e) =>
                              handleInputChange("title", e.target.value)
                            }
                            placeholder="Brief description of the issue"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="category"
                              className="text-gray-700 font-medium"
                            >
                              Category *
                            </Label>
                            <Select
                              value={newComplaint.category}
                              onValueChange={(value) =>
                                handleInputChange("category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.value}
                                    value={category.value}
                                  >
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="priority"
                              className="text-gray-700 font-medium"
                            >
                              Priority Level
                            </Label>
                            <Select
                              value={newComplaint.priority}
                              onValueChange={(value) =>
                                handleInputChange("priority", value as any)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-gray-700 font-medium"
                          >
                            Detailed Description *
                          </Label>
                          <Textarea
                            id="description"
                            value={newComplaint.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            placeholder="Provide detailed information about the issue, including location, time, and any other relevant details..."
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 min-h-[120px]"
                            required
                          />
                        </div>

                        {/* Voice Note Section */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">
                            Voice Note (Optional)
                          </Label>
                          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                            {!browserSupportsSpeechRecognition && (
                              <Alert variant="destructive" className="mb-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Your browser doesn't support speech recognition. Please use Chrome or Edge.
                                </AlertDescription>
                              </Alert>
                            )}

                            {!voiceNote && !listening && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={startRecording}
                                className="w-full"
                                disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
                              >
                                <Mic className="w-4 h-4 mr-2" />
                                Start Voice Recording
                              </Button>
                            )}

                            {listening && (
                              <div className="flex items-center justify-between bg-red-50 p-3 rounded border border-red-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-red-700">
                                    Recording... {formatTime(recordingTime)}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={stopRecording}
                                  className="text-red-600 border-red-300"
                                >
                                  <MicOff className="w-4 h-4 mr-1" />
                                  Stop
                                </Button>
                              </div>
                            )}

                            {voiceNote && !listening && (
                              <div className="flex flex-col space-y-3 bg-green-50 p-3 rounded border border-green-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-green-700">
                                    Recorded Note
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setNewComplaint(prev => ({
                                        ...prev,
                                        compalainText: "",
                                      }));
                                      resetTranscript();
                                    }}
                                    className="text-red-600 border-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-sm text-green-700">{voiceNote}</p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500">
                              Record your complaint in English. Click stop when finished.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Media Upload */}
                 
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-8"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Complaint
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="history" className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      My Complaints
                    </h3>
                    <Badge className="bg-red-100 text-red-800">
                      {userComplaints.length} Total Complaints
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {userComplaints.map((complaint) => (
                      <Card
                        key={complaint.id}
                        className="border border-gray-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {complaint.title}
                                </h4>
                                <Badge
                                  className={getStatusColor(complaint.status)}
                                >
                                  {getStatusIcon(complaint.status)}
                                  <span className="ml-1 capitalize">
                                    {complaint.status}
                                  </span>
                                </Badge>
                                <Badge
                                  className={getPriorityColor(
                                    complaint.priority,
                                  )}
                                >
                                  {complaint.priority.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-600 mb-3">
                                <strong>ID:</strong> #{complaint.id} |{" "}
                                <strong>Category:</strong> {complaint.category}{" "}
                                | <strong>Created:</strong> {complaint.date}
                              </div>

                              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                {complaint.description}
                              </p>

                              {complaint.voiceNote && (
                                <div className="bg-purple-50 p-3 rounded border border-purple-200 mb-3">
                                  <p className="text-sm text-purple-700">
                                    <strong>Voice Note:</strong> {complaint.voiceNote}
                                  </p>
                                </div>
                              )}

                              {complaint.adminResponse && (
                                <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                                  <p className="text-sm text-blue-700">
                                    <strong>Admin Response:</strong>{" "}
                                    {complaint.adminResponse}
                                  </p>
                                  {complaint.responseDate && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Responded on: {complaint.responseDate}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {complaint.images &&
                                  complaint.images.length > 0 && (
                                    <span className="flex items-center">
                                      <Image className="w-3 h-3 mr-1" />
                                      {complaint.images.length} images
                                    </span>
                                  )}
                                <span>
                                  Updated:{" "}
                                  {complaint.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="ml-4">
                              <ComplaintDetailModal complaint={complaint} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {userComplaints.length === 0 && (
                      <Card className="border border-gray-200">
                        <CardContent className="p-12 text-center">
                          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            No Complaints Yet
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Haven't lodged any complaints yet. If you face any
                            issues, feel free to submit a complaint.
                          </p>
                          <Button
                            onClick={() => setActiveTab("lodge")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Lodge Your First Complaint
                          </Button>
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
    </div>
  );
};

export default ComplaintSystem;