import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, MapPin, Star, ExternalLink, Package, Coffee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FavoriteButton } from "@/components/favorite-button";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-yellow-400 via-orange-400 to-teal-600 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <Heart className="h-16 w-16 mx-auto mb-6 text-white" />
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                My Favorites
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Please sign in to view your favorite roasters
              </p>
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                <a href="/api/login">Sign In</a>
              </Button>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-yellow-400 via-orange-400 to-teal-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              My Favorites
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your curated collection of trusted coffee roasters
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            {isLoading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-500 mb-4">
                  <Heart className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Error Loading Favorites
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Unable to load your favorite roasters. Please try again.
                </p>
              </div>
            ) : !favorites || favorites.length === 0 ? (
              <div className="text-center py-16">
                <Coffee className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Favorites Yet
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Start exploring roasters and add your favorites to build your collection. Discover amazing coffee roasters and save the ones you love.
                </p>
                <div className="space-x-4">
                  <Button asChild size="lg">
                    <Link href="/leaderboard">Browse Roasters</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/products">View Products</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {favorites.length} Favorite {favorites.length === 1 ? 'Roaster' : 'Roasters'}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Your trusted collection of coffee artisans
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {favorites.map((favorite) => (
                    <Card key={favorite.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={favorite.profileImageUrl} 
                                alt={favorite.businessName}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
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
                          <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-3">
                            {favorite.description}
                          </CardDescription>
                        )}

                        {/* Owner Info */}
                        {(favorite.firstName || favorite.lastName) && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Roasted by {favorite.firstName} {favorite.lastName}
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
                            <Link href="/leaderboard">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>

                        {/* Added Date */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                          Favorited on {new Date(favorite.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="text-center">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/leaderboard">
                      <Coffee className="h-5 w-5 mr-2" />
                      Discover More Roasters
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}