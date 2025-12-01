import { useState } from "react";
import { Star, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminData } from "@/contexts/AdminDataContext";
import { toast } from "sonner";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProviderId: number;
  serviceProviderName: string;
  serviceCategory: string;
  bookingId: number;
  residentId: number;
  residentName: string;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  isOpen,
  onClose,
  serviceProviderId,
  serviceProviderName,
  serviceCategory,
  bookingId,
  residentId,
  residentName,
}) => {
  const { addServiceReview } = useAdminData();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    setError("");
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        bookingId,
        residentId,
        residentName,
        serviceProviderId,
        serviceProviderName,
        rating,
        review: reviewText.trim(),
        reviewDate: new Date().toISOString().split("T")[0],
        serviceCategory,
      };

      addServiceReview(reviewData);

      setSuccess(true);
      toast.success("Review submitted successfully!");

      // Reset form after short delay
      setTimeout(() => {
        setRating(0);
        setReviewText("");
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again.");
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || "";
  };

  const getProviderInitials = () => {
    return serviceProviderName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate & Review Service</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Provider Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-green-500 text-white">
                {getProviderInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{serviceProviderName}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{serviceCategory}</Badge>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Thank you for your review! It helps other residents make
                informed decisions.
              </AlertDescription>
            </Alert>
          )}

          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="p-1 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {(rating > 0 || hoverRating > 0) && (
                <span className="text-sm font-medium text-gray-600">
                  {getRatingText(hoverRating || rating)}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this service provider..."
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Quick Review Options */}
          <div className="space-y-2">
            <Label>Quick feedback (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Professional",
                "On time",
                "Quality work",
                "Fair pricing",
                "Clean work area",
                "Good communication",
                "Would recommend",
              ].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!reviewText.includes(tag)) {
                      setReviewText((prev) =>
                        prev ? `${prev} ${tag}.` : `${tag}.`,
                      );
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0 || !reviewText.trim()}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
