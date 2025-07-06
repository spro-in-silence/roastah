import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SellerLayout from "@/components/SellerLayout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Profile from "@/pages/profile";
import BecomeRoastah from "@/pages/become-roastah";
import SellerDashboard from "@/pages/seller-dashboard";
import SellerProducts from "@/pages/seller-products";
import SellerProductsNew from "@/pages/seller-products-new";
import SellerProductsEdit from "@/pages/seller-products-edit";
import SellerOrders from "@/pages/seller-orders";
import SellerMessages from "@/pages/seller-messages";
import ProductionDemo from "@/pages/production-demo";
import MedusaAdmin from "@/pages/medusa-admin";
import SecurityDashboard from "@/pages/security-dashboard";
import TestPayment from "@/pages/test-payment";
import TrackingDemo from "@/pages/tracking-demo";
import Leaderboard from "@/pages/leaderboard";
import Favorites from "@/pages/favorites";
import GiftCards from "@/pages/gift-cards";
import BuyerMessages from "@/pages/buyer-messages";
import DevLogin from "@/pages/dev-login";

function DevAwareLanding() {
  const isDev = window.location.hostname.includes('replit.dev') || window.location.hostname === 'localhost';
  
  if (isDev) {
    return <DevLogin />;
  }
  
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/home">
      <Landing />
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<DevAwareLanding />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/production-demo" element={<ProductionDemo />} />
        <Route path="/tracking-demo" element={<TrackingDemo />} />
        <Route path="/dev-login" element={<DevLogin />} />
        
        {/* Authentication Required Routes */}
        <Route path="/home" element={
          <ProtectedRoute requireAuth>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute requireAuth>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute requireAuth>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requireAuth>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute requireAuth>
            <Favorites />
          </ProtectedRoute>
        } />
        <Route path="/gift-cards" element={
          <ProtectedRoute requireAuth>
            <GiftCards />
          </ProtectedRoute>
        } />
        <Route path="/buyer-messages" element={
          <ProtectedRoute requireAuth>
            <BuyerMessages />
          </ProtectedRoute>
        } />
        <Route path="/become-roastah" element={
          <ProtectedRoute requireAuth>
            <BecomeRoastah />
          </ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute requireAuth>
            <SecurityDashboard />
          </ProtectedRoute>
        } />
        <Route path="/test-payment" element={
          <ProtectedRoute requireAuth>
            <TestPayment />
          </ProtectedRoute>
        } />
        <Route path="/medusa-admin" element={
          <ProtectedRoute requireAuth>
            <MedusaAdmin />
          </ProtectedRoute>
        } />
        
        {/* Seller Routes - Nested under seller layout */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<SellerProductsNew />} />
          <Route path="products/edit/:id" element={<SellerProductsEdit />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="messages" element={<SellerMessages />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
