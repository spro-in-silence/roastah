import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";
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
import SellerOrders from "@/pages/seller-orders";
import ProductionDemo from "@/pages/production-demo";
import MedusaAdmin from "@/pages/medusa-admin";
import SecurityDashboard from "@/pages/security-dashboard";
import TestPayment from "@/pages/test-payment";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/profile" component={Profile} />
          <Route path="/become-roastah" component={BecomeRoastah} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/seller/products" component={SellerProducts} />
          <Route path="/seller/products/new" component={SellerProductsNew} />
          <Route path="/seller/orders" component={SellerOrders} />
          <Route path="/production-demo" component={ProductionDemo} />
          <Route path="/medusa-admin" component={MedusaAdmin} />
          <Route path="/security" component={SecurityDashboard} />
          <Route path="/test-payment" component={TestPayment} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
