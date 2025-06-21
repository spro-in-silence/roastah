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
  const { data: favoriteStatus, isLoading } = useQuery<{ isFavorite: boolean }>({
    queryKey: ['/api/favorites/roasters', roasterId, 'check'],
    enabled: isAuthenticated,
  });

  const isFavorite = favoriteStatus?.isFavorite ?? false;

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/favorites/roasters/${roasterId}`),
    onSuccess: (data: any) => {
      const newFavoriteStatus = data.isFavorite;
      
      // Update cache for check query
      updateCachedData(
        queryClient,
        ['/api/favorites/roasters', roasterId, 'check'],
        { isFavorite: newFavoriteStatus }
      );
      
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/roasters'] });
      
      toast({
        title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
        description: newFavoriteStatus 
          ? "This roaster has been added to your favorites." 
          : "This roaster has been removed from your favorites.",
      });
    },
    onError: (error: any) => {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
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

    toggleFavoriteMutation.mutate();
  };

  const isPending = toggleFavoriteMutation.isPending;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading || isPending}
      className={`flex items-center gap-2 transition-all duration-200 ${
        isFavorite 
          ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white" 
          : "border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
      } ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${
          isFavorite 
            ? "fill-current text-white" 
            : "text-teal-600"
        } ${isPending ? "animate-pulse" : ""}`}
      />
      {showText && (
        <span className={isFavorite ? "text-white" : "text-teal-600"}>
          {isFavorite ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}