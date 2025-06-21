import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Coffee, User, Package, BarChart3, ShoppingBag, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CartItem } from "@/lib/types";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, isRoaster } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = (cartItems as CartItem[]).reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="coffee-gradient text-white rounded-lg p-2 mr-3">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Roastah</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for premium coffee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 focus:ring-2 focus:ring-roastah-teal focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </form>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Buyer Navigation */}
                {!isRoaster && (
                  <div className="flex items-center space-x-6">
                    <Link
                      href="/products"
                      className={`transition-colors ${
                        location.startsWith('/products') ? 'text-roastah-teal' : 'text-gray-700 hover:text-roastah-teal'
                      }`}
                    >
                      Browse
                    </Link>
                    <Link href="/cart" className="relative">
                      <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-roastah-teal transition-colors" />
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-roastah-yellow text-gray-900 text-xs h-5 w-5 flex items-center justify-center p-0">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Link>
                  </div>
                )}

                {/* Roaster Navigation */}
                {isRoaster && (
                  <div className="flex items-center space-x-6">
                    <Link
                      href="/seller/dashboard"
                      className={`transition-colors ${
                        location === '/seller/dashboard' ? 'text-roastah-teal' : 'text-gray-700 hover:text-roastah-teal'
                      }`}
                    >
                      <BarChart3 className="h-5 w-5 inline mr-1" />
                      Dashboard
                    </Link>
                    <Link
                      href="/seller/products"
                      className={`transition-colors ${
                        location.startsWith('/seller/products') ? 'text-roastah-teal' : 'text-gray-700 hover:text-roastah-teal'
                      }`}
                    >
                      <Package className="h-5 w-5 inline mr-1" />
                      Products
                    </Link>
                    <Link
                      href="/seller/orders"
                      className={`transition-colors ${
                        location === '/seller/orders' ? 'text-roastah-teal' : 'text-gray-700 hover:text-roastah-teal'
                      }`}
                    >
                      <ShoppingBag className="h-5 w-5 inline mr-1" />
                      Orders
                    </Link>
                    <Link
                      href="/medusa-admin"
                      className={`transition-colors ${
                        location === '/medusa-admin' ? 'text-roastah-teal' : 'text-gray-700 hover:text-roastah-teal'
                      }`}
                    >
                      <Database className="h-5 w-5 inline mr-1" />
                      E-commerce
                    </Link>
                  </div>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-roastah-teal transition-colors"
                  >
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                    <span className="hidden sm:block">Profile</span>
                  </Link>
                  
                  {isRoaster && (
                    <Link href="/">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-roastah-teal text-white border-roastah-teal hover:bg-roastah-dark-teal"
                      >
                        Switch to Buyer
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
