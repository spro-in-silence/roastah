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
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['/api/favorites/roasters', roasterId, 'check'] });

      // Snapshot the previous value
      const previousFavorite = queryClient.getQueryData(['/api/favorites/roasters', roasterId, 'check']);

      // Optimistically update to the new value
      queryClient.setQueryData(['/api/favorites/roasters', roasterId, 'check'], (old: any) => ({
        isFavorite: !old?.isFavorite
      }));

      // Return a context object with the snapshotted value
      return { previousFavorite };
    },
    onSuccess: (data: any) => {
      console.log("Toggle favorite response:", data);
      const newFavoriteStatus = data.isFavorite;
      
      // Update cache with server response
      queryClient.setQueryData(
        ['/api/favorites/roasters', roasterId, 'check'],
        { isFavorite: newFavoriteStatus }
      );
      
      // Only invalidate the favorites list, not the check query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/favorites/roasters'],
        exact: true
      });
      
      toast({
        title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
        description: newFavoriteStatus 
          ? "This roaster has been added to your favorites." 
          : "This roaster has been removed from your favorites.",
      });
    },
    onError: (error: any, variables, context) => {
      console.error("Error toggling favorite:", error);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorite) {
        queryClient.setQueryData(['/api/favorites/roasters', roasterId, 'check'], context.previousFavorite);
      }
      
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
      className={`flex items-center gap-2 transition-all duration-200 ${className}`}
      style={{
        backgroundColor: isFavorite ? "#eab308" : "transparent",
        borderColor: isFavorite ? "#eab308" : "#0d9488",
        color: isFavorite ? "white" : "#0d9488"
      }}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${isPending ? "animate-pulse" : ""}`}
        style={{
          fill: isFavorite ? "white" : "none",
          color: isFavorite ? "white" : "#0d9488"
        }}
      />
      {showText && (
        <span style={{ color: isFavorite ? "white" : "#0d9488" }}>
          {isFavorite ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}