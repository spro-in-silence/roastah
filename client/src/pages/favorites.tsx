import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star, ExternalLink, Package, Coffee, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface FavoriteProduct {
  id: number;
  productId: number;
  createdAt: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  roaster: {
    id: number;
    businessName: string;
  };
}

export default function Favorites() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("roasters");

  const { data: favoriteRoasters = [], isLoading: roastersLoading, error: roastersError } = useQuery<FavoriteRoaster[]>({
    queryKey: ['/api/favorites/roasters'],
    enabled: isAuthenticated,
  });

  const { data: favoriteProducts = [], isLoading: productsLoading, error: productsError } = useQuery<FavoriteProduct[]>({
    queryKey: ['/api/favorites/products'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your favorites.
            </p>
            <Button asChild>
              <Link to="/api/login">Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your curated collection of favorite roasters and coffee beans
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="roasters" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Roasters
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Coffee Beans
            </TabsTrigger>
          </TabsList>

          {/* Roasters Tab */}
          <TabsContent value="roasters" className="mt-6">
            {roastersLoading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : roastersError ? (
              <div className="text-center py-16">
                <div className="text-red-500 mb-4">
                  <Heart className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Error Loading Favorites
                </h2>
                <p className="text-gray-600">
                  Unable to load your favorite roasters. Please try again.
                </p>
              </div>
            ) : !favoriteRoasters || favoriteRoasters.length === 0 ? (
              <div className="text-center py-16">
                <Coffee className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Favorite Roasters Yet
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Start exploring roasters and add your favorites to build your collection. Discover amazing coffee roasters and save the ones you love.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/leaderboard">Browse Roasters</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/products">View Products</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRoasters.map((favorite) => (
                  <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={favorite.profileImageUrl} 
                              alt={favorite.businessName}
                            />
                            <AvatarFallback className="bg-orange-100 text-orange-700">
                              {favorite.businessName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg text-gray-900">
                              {favorite.businessName}
                            </CardTitle>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
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
                            <span className="font-medium text-gray-900">
                              {parseFloat(favorite.averageRating).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ({favorite.totalReviews} {favorite.totalReviews === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {favorite.description && (
                        <CardDescription className="text-gray-600 line-clamp-3">
                          {favorite.description}
                        </CardDescription>
                      )}

                      {/* Owner Info */}
                      {(favorite.firstName || favorite.lastName) && (
                        <div className="text-sm text-gray-600">
                          Roasted by {favorite.firstName} {favorite.lastName}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link to={`/products?roaster=${favorite.roasterId}`}>
                            <Package className="h-4 w-4 mr-2" />
                            View Products
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/leaderboard">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      {/* Added Date */}
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        Favorited on {new Date(favorite.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            {productsLoading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : productsError ? (
              <div className="text-center py-16">
                <div className="text-red-500 mb-4">
                  <Heart className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Error Loading Favorites
                </h2>
                <p className="text-gray-600">
                  Unable to load your favorite products. Please try again.
                </p>
              </div>
            ) : !favoriteProducts || favoriteProducts.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Favorite Coffee Beans Yet
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Start exploring coffee beans and add your favorites to build your collection. Discover amazing coffee and save the ones you love.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/products">Browse Coffee</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/leaderboard">View Roasters</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProducts.map((favorite) => (
                  <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={favorite.images && favorite.images.length > 0 ? favorite.images[0] : '/api/placeholder/60/60'}
                            alt={favorite.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <CardTitle className="text-lg text-gray-900">
                              {favorite.name}
                            </CardTitle>
                            <div className="text-sm text-gray-600">
                              by {favorite.roaster.businessName}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            // TODO: Implement remove favorite product
                            console.log('Remove favorite product:', favorite.productId);
                          }}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Description */}
                      {favorite.description && (
                        <CardDescription className="text-gray-600 line-clamp-3">
                          {favorite.description}
                        </CardDescription>
                      )}

                      {/* Price */}
                      <div className="text-lg font-semibold text-gray-900">
                        ${favorite.price.toFixed(2)}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link to={`/product/${favorite.productId}`}>
                            <Package className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/products?roaster=${favorite.roaster.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      {/* Added Date */}
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        Favorited on {new Date(favorite.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}