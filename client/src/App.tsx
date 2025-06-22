import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/contexts/UserContext";
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

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  const isApprovedRoaster = (user as any)?.isRoasterApproved;

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route component={Landing} />
        </>
      ) : isApprovedRoaster ? (
        // Approved roasters only get seller routes
        <>
          <Route path="/" component={SellerDashboard} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/seller/products" component={SellerProducts} />
          <Route path="/seller/products/new" component={SellerProductsNew} />
          <Route path="/seller/products/:id/edit" component={SellerProductsEdit} />
          <Route path="/seller/orders" component={SellerOrders} />
          <Route path="/seller/messages" component={SellerMessages} />
          <Route path="/profile" component={Profile} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/production-demo" component={ProductionDemo} />
          <Route path="/medusa-admin" component={MedusaAdmin} />
          <Route path="/security" component={SecurityDashboard} />
          <Route path="/test-payment" component={TestPayment} />
          <Route path="/tracking-demo" component={TrackingDemo} />
          {/* Redirect buyer routes to seller dashboard */}
          <Route path="/products"><Redirect to="/seller/dashboard" /></Route>
          <Route path="/products/:id"><Redirect to="/seller/dashboard" /></Route>
          <Route path="/cart"><Redirect to="/seller/dashboard" /></Route>
          <Route path="/checkout"><Redirect to="/seller/dashboard" /></Route>
          <Route path="/become-roastah"><Redirect to="/seller/dashboard" /></Route>
        </>
      ) : (
        // Non-approved users get buyer routes
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/profile" component={Profile} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/gift-cards" component={GiftCards} />
          <Route path="/messages" component={BuyerMessages} />
          <Route path="/become-roastah" component={BecomeRoastah} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/seller/products" component={SellerProducts} />
          <Route path="/seller/products/new" component={SellerProductsNew} />
          <Route path="/seller/orders" component={SellerOrders} />
          <Route path="/production-demo" component={ProductionDemo} />
          <Route path="/medusa-admin" component={MedusaAdmin} />
          <Route path="/security" component={SecurityDashboard} />
          <Route path="/test-payment" component={TestPayment} />
          <Route path="/tracking-demo" component={TrackingDemo} />
          <Route path="/leaderboard" component={Leaderboard} />
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
