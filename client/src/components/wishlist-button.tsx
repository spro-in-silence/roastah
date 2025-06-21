import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
}

export default function WishlistButton({ 
  productId, 
  size = "md", 
  variant = "icon" 
}: WishlistButtonProps) {
  const { isAuthenticated } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlistItems.some((item: any) => item.productId === productId);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isInWishlist) {
        await apiRequest("DELETE", `/api/wishlist/${productId}`);
      } else {
        await apiRequest("POST", "/api/wishlist", { productId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: isInWishlist 
          ? "Item removed from your wishlist" 
          : "Item saved to your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    toggleWishlistMutation.mutate();
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }[size];

  const buttonSize = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }[size];

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={toggleWishlistMutation.isPending}
        className={`${buttonSize} p-0 hover:bg-red-50 transition-colors group`}
      >
        <Heart
          className={`${iconSize} transition-all duration-200 ${
            isInWishlist 
              ? "fill-red-500 text-red-500" 
              : "text-gray-400 group-hover:text-red-500"
          }`}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      onClick={handleClick}
      disabled={toggleWishlistMutation.isPending}
      className={`${
        isInWishlist 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "border-red-200 text-red-600 hover:bg-red-50"
      }`}
    >
      <Heart className={`${iconSize} mr-2 ${isInWishlist ? "fill-current" : ""}`} />
      {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  );
}