import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface Review {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated, user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: ""
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      await apiRequest("POST", `/api/products/${productId}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setShowReviewForm(false);
      setNewReview({ rating: 5, title: "", content: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteHelpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const result = await apiRequest("POST", `/api/reviews/${reviewId}/helpful`);
      return { reviewId, result };
    },
    onSuccess: ({ reviewId }) => {
      // Update cache immediately for instant UI response
      queryClient.setQueryData([`/api/products/${productId}/reviews`], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) {
          return oldData;
        }
        return oldData.map((review: any) => 
          review.id === reviewId 
            ? { ...review, helpfulVotes: review.helpfulVotes + 1 }
            : review
        );
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
    },
  });

  // Calculate review statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => filterRating === "all" || review.rating === parseInt(filterRating))
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return b.helpfulVotes - a.helpfulVotes;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number, interactive = false, size = "w-4 h-4") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? "fill-roastah-yellow text-roastah-yellow" 
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-roastah-yellow" : ""}`}
            onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: star })) : undefined}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = () => {
    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Incomplete Review",
        description: "Please provide both a title and review content.",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate(newReview);
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(averageRating), false, "w-6 h-6")}
                </div>
                <div className="text-sm text-gray-600">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-roastah-yellow text-roastah-yellow" />
                  </div>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-gray-600 w-10">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {isAuthenticated && (
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
              >
                Write a Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              {renderStars(newReview.rating, true, "w-8 h-8")}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-roastah-teal focus:border-roastah-teal"
                placeholder="Summarize your experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tell others about your experience with this coffee..."
                className="min-h-[120px] focus:ring-roastah-teal focus:border-roastah-teal"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
                className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
              >
                Submit Review
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {totalReviews > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Reviews ({totalReviews})</CardTitle>
              <div className="flex gap-2">
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.profileImageUrl} />
                      <AvatarFallback>
                        {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {review.user.firstName} {review.user.lastName?.[0]}.
                        </span>
                        {review.verifiedPurchase && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                        <p className="text-gray-700">{review.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => voteHelpfulMutation.mutate(review.id)}
                          className="text-gray-600 hover:text-roastah-teal"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpfulVotes})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}