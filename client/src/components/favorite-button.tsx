import { useState } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { updateCachedData } from "@/lib/cache-utils";

interface FavoriteButtonProps {
  roasterId: number;
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ roasterId, className = "", showText = false }: FavoriteButtonProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Check if roaster is favorited
  const { data: favoriteStatus, isLoading } = useQuery({
    queryKey: ['/api/favorites/roasters', roasterId, 'check'],
    enabled: isAuthenticated,
  });

  const isFavorite = favoriteStatus?.isFavorite || false;

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/favorites/roasters/${roasterId}`),
    onSuccess: () => {
      // Update cache for check query
      updateCachedData(
        queryClient,
        ['/api/favorites/roasters', roasterId, 'check'],
        { isFavorite: true }
      );
      
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/roasters'] });
      
      toast({
        title: "Added to Favorites",
        description: "This roaster has been added to your favorites.",
      });
    },
    onError: (error: any) => {
      console.error("Error adding favorite:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/favorites/roasters/${roasterId}`),
    onSuccess: () => {
      // Update cache for check query
      updateCachedData(
        queryClient,
        ['/api/favorites/roasters', roasterId, 'check'],
        { isFavorite: false }
      );
      
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/roasters'] });
      
      toast({
        title: "Removed from Favorites",
        description: "This roaster has been removed from your favorites.",
      });
    },
    onError: (error: any) => {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add favorites.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const isPending = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading || isPending}
      className={`flex items-center gap-2 ${className}`}
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite ? "fill-current text-white" : "text-current"
        } ${isPending ? "animate-pulse" : ""}`}
      />
      {showText && (
        <span>
          {isFavorite ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}