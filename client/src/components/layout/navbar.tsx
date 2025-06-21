import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Coffee, User, Package, BarChart3, ShoppingBag, Database, Trophy, Menu, X, Bell, Shield, RotateCcw } from "lucide-react";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { CartItem } from "@/lib/types";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, isRoaster: contextIsRoaster } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Initialize mode from localStorage or default to buyer mode
  const [isRoaster, setIsRoaster] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('userMode');
      if (savedMode !== null) {
        return savedMode === 'seller';
      }
    }
    return contextIsRoaster;
  });

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = (cartItems as CartItem[]).reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Only sync with context on initial load if no saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('userMode');
      if (savedMode === null) {
        setIsRoaster(contextIsRoaster);
        localStorage.setItem('userMode', contextIsRoaster ? 'seller' : 'buyer');
      }
    }
  }, [contextIsRoaster]);

  // Handle mode switching with persistence and navigation
  const handleModeSwitch = () => {
    const newMode = !isRoaster;
    setIsRoaster(newMode);
    localStorage.setItem('userMode', newMode ? 'seller' : 'buyer');
    closeMenu();
    
    // Navigate to appropriate page based on new mode
    if (newMode) {
      // Switching to seller mode - go to seller dashboard
      window.location.href = '/seller/dashboard';
    } else {
      // Switching to buyer mode - go to products page
      window.location.href = '/products';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              <Link href="/" className="flex items-center">
                <div className="coffee-gradient text-white rounded-lg p-2 mr-3">
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Roastah</span>
              </Link>
            </div>

            {/* Center: Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
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

            {/* Right: Action Icons */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {/* Real-time Notifications */}
                  <RealtimeNotifications showAsDropdown={true} />

                  {/* Cart Toggle - always show when in buyer mode or on cart/checkout pages */}
                  {(!isRoaster || location === '/cart' || location === '/checkout') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative p-2"
                      onClick={() => setIsCartOpen(!isCartOpen)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-roastah-yellow text-gray-900 text-xs h-5 w-5 flex items-center justify-center p-0">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  )}

                  {/* Profile */}
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="p-2">
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt="Profile"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25" 
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Coffee className="h-6 w-6 text-roastah-teal" />
                <span className="text-lg font-bold text-gray-900">Navigation</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={closeMenu}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-2">
              {/* Common Navigation - Always visible */}
              <Link href="/products" onClick={closeMenu}>
                <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                  location.startsWith('/products') ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                }`}>
                  <Coffee className="h-5 w-5" />
                  <span className="font-medium">Browse Products</span>
                </div>
              </Link>

              <Link href="/leaderboard" onClick={closeMenu}>
                <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                  location === '/leaderboard' ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                }`}>
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">Roastah Leaderboard</span>
                </div>
              </Link>

              {/* Buyer-specific Navigation - Only show for non-roasters */}
              {!isRoaster && (
                <Link href="/become-roastah" onClick={closeMenu}>
                  <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                    location === '/become-roastah' ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                  }`}>
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Become a Roastah</span>
                  </div>
                </Link>
              )}

              {/* Seller Navigation - Only show in seller mode */}
              {isRoaster && (
                <>
                  <div className="border-t my-4"></div>
                  
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller Tools</span>
                  </div>

                  <Link href="/seller/dashboard" onClick={closeMenu}>
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      location.startsWith('/seller/dashboard') ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                    }`}>
                      <BarChart3 className="h-5 w-5" />
                      <span className="font-medium">Seller Dashboard</span>
                    </div>
                  </Link>

                  <Link href="/seller/products" onClick={closeMenu}>
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      location.startsWith('/seller/products') ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                    }`}>
                      <Package className="h-5 w-5" />
                      <span className="font-medium">My Products</span>
                    </div>
                  </Link>

                  <Link href="/seller/orders" onClick={closeMenu}>
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      location.startsWith('/seller/orders') ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                    }`}>
                      <ShoppingBag className="h-5 w-5" />
                      <span className="font-medium">Orders</span>
                    </div>
                  </Link>

                  <Link href="/medusa-admin" onClick={closeMenu}>
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      location === '/medusa-admin' ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                    }`}>
                      <Database className="h-5 w-5" />
                      <span className="font-medium">E-commerce Admin</span>
                    </div>
                  </Link>
                </>
              )}

              <div className="border-t my-4"></div>

              {/* Common Navigation */}
              <Link href="/security" onClick={closeMenu}>
                <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                  location === '/security' ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                }`}>
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Security Dashboard</span>
                </div>
              </Link>

              <Link href="/profile" onClick={closeMenu}>
                <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                  location === '/profile' ? 'bg-roastah-teal/10 text-roastah-teal' : 'text-gray-700'
                }`}>
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile Settings</span>
                </div>
              </Link>

              {/* Mode Switch - Only for approved roasters */}
              {user?.role === 'roaster' && user?.isRoasterApproved && (
                <>
                  <div className="border-t my-4"></div>
                  
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode</span>
                  </div>
                  
                  <button 
                    onClick={handleModeSwitch}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-left text-gray-700"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span className="font-medium">Switch to {isRoaster ? 'Buyer' : 'Seller'} Mode</span>
                  </button>
                </>
              )}

              <div className="border-t my-4"></div>

              {/* Sign Out */}
              <div className="mt-4">
                <a 
                  href="/api/logout" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                >
                  <span className="font-medium">Sign Out</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25" 
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Cart Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCartOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-2">Add some coffee to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(cartItems as CartItem[]).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <img 
                        src={item.product?.imageUrl || '/placeholder-coffee.jpg'} 
                        alt={item.product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.product?.name}</h3>
                        <p className="text-sm text-gray-500">${item.product?.price}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">
                    ${(cartItems as CartItem[]).reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <Link href="/checkout">
                  <Button 
                    className="w-full bg-roastah-teal hover:bg-roastah-dark-teal text-white"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setIsCartOpen(false)}
                  >
                    View Full Cart
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}