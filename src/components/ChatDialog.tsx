import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "resident" | "service_provider";
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientType: "resident" | "service_provider";
  currentUserId: string;
  currentUserName: string;
  currentUserType: "resident" | "service_provider";
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientType,
  currentUserId,
  currentUserName,
  currentUserType,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: recipientId,
      senderName: recipientName,
      senderType: recipientType,
      content:
        "Hello! I received your service booking request. When would be the best time to schedule the work?",
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      type: "text",
    },
    {
      id: "2",
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: currentUserType,
      content:
        "Hi! Thank you for responding so quickly. I'm available this weekend, preferably Saturday morning.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: "text",
    },
    {
      id: "3",
      senderId: recipientId,
      senderName: recipientName,
      senderType: recipientType,
      content:
        "Perfect! Saturday morning works for me. I'll be there around 10 AM. Is that okay?",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: "text",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: currentUserType,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate typing indicator and response (in real app, this would be WebSocket/real-time)
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        if (Math.random() > 0.5) {
          // 50% chance of auto-response for demo
          const responses = [
            "Got it! I'll see you then.",
            "Thanks for the update.",
            "Sounds good to me!",
            "I'll confirm the timing shortly.",
            "Perfect, looking forward to it!",
          ];
          const autoResponse: Message = {
            id: (Date.now() + 1).toString(),
            senderId: recipientId,
            senderName: recipientName,
            senderType: recipientType,
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
            type: "text",
          };
          setMessages((prev) => [...prev, autoResponse]);
        }
      }, 2000);
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getRecipientInitials = () => {
    return recipientName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback
                  className={`${recipientType === "service_provider" ? "bg-green-500" : "bg-blue-500"} text-white`}
                >
                  {getRecipientInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">{recipientName}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      recipientType === "service_provider"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {recipientType === "service_provider"
                      ? "Service Provider"
                      : "Resident"}
                  </Badge>
                  <span className="text-xs text-green-600">● Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Block User</DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${message.senderId === currentUserId ? "order-2" : "order-1"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.senderId === currentUserId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p
                    className={`text-xs text-gray-500 mt-1 ${message.senderId === currentUserId ? "text-right" : "text-left"}`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.senderId !== currentUserId && (
                  <Avatar className="w-6 h-6 order-1 mr-2">
                    <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
