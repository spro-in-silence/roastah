import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, MapPin, Star, ExternalLink, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FavoriteButton } from "@/components/favorite-button";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteRoaster {
  id: number;
  roasterId: number;
  createdAt: string;
  businessName: string;
  description: string;
  city: string;
  state: string;
  averageRating: string;
  totalReviews: number;
  roasterUserId: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

export default function Favorites() {
  const { isAuthenticated, user } = useAuth();

  const { data: favorites, isLoading, error } = useQuery<FavoriteRoaster[]>({
    queryKey: ['/api/favorites/roasters'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please sign in to view your favorite roasters.
            </p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Unable to load your favorite roasters. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Favorite Roasters
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Your curated collection of trusted coffee roasters
          </p>
        </div>

        {/* Favorites Grid */}
        {!favorites || favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start exploring roasters and add your favorites to build your collection.
            </p>
            <Button asChild>
              <Link href="/products">Browse Roasters</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={favorite.profileImageUrl} 
                          alt={favorite.businessName}
                        />
                        <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                          {favorite.businessName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {favorite.businessName}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-3 w-3" />
                          {favorite.city && favorite.state && (
                            <span>{favorite.city}, {favorite.state}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <FavoriteButton roasterId={favorite.roasterId} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating */}
                  {favorite.averageRating && parseFloat(favorite.averageRating) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(favorite.averageRating).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        ({favorite.totalReviews} {favorite.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {favorite.description && (
                    <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {favorite.description}
                    </CardDescription>
                  )}

                  {/* Owner Info */}
                  {(favorite.firstName || favorite.lastName) && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Roaster: {favorite.firstName} {favorite.lastName}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/products?roaster=${favorite.roasterId}`}>
                        <Package className="h-4 w-4 mr-2" />
                        View Products
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/leaderboard`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Added Date */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    Added {new Date(favorite.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {favorites && favorites.length > 0 && (
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/products">
                <Package className="h-4 w-4 mr-2" />
                Discover More Roasters
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}