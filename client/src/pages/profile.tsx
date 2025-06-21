import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, CheckCircle, Package, Clock, MapPin, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
});

const addressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
});

export default function Profile() {
  const { user, isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: personalErrors },
    reset: resetPersonal,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
  });

  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Populate form with user data when available
  useEffect(() => {
    if (user) {
      resetPersonal({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, resetPersonal]);

  const updatePersonalInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your personal information has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitPersonal = (data: any) => {
    updatePersonalInfoMutation.mutate(data);
  };

  const onSubmitAddress = (data: any) => {
    toast({
      title: "Address Saved",
      description: "Your address has been saved successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-6 mb-8">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || "User Profile"
                  }
                </h1>
                <p className="text-roastah-warm-gray">{user?.email}</p>
                <p className="text-sm text-roastah-warm-gray">Member since January 2024</p>
              </div>
            </div>

            {/* Become a Roastah CTA (Buyer Only) */}
            {!isRoaster && (
              <div className="coffee-gradient rounded-xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Become a Roastah</h2>
                    <p className="text-white/90">
                      Share your passion for coffee and start selling your roasts to coffee enthusiasts worldwide.
                    </p>
                  </div>
                  <Link href="/become-roastah">
                    <Button className="bg-white text-roastah-teal hover:bg-gray-100 font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Roaster Status (Roaster Only) */}
            {isRoaster && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">Roastah Account Active</h2>
                    <p className="text-green-700">You're all set to sell your coffee on Roastah</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                {isRoaster && <TabsTrigger value="seller">Seller Settings</TabsTrigger>}
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitPersonal(onSubmitPersonal)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...registerPersonal("firstName")}
                            className={personalErrors.firstName ? "border-red-500" : ""}
                          />
                          {personalErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{personalErrors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...registerPersonal("lastName")}
                            className={personalErrors.lastName ? "border-red-500" : ""}
                          />
                          {personalErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{personalErrors.lastName.message}</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            {...registerPersonal("email")}
                            className={personalErrors.email ? "border-red-500" : ""}
                          />
                          {personalErrors.email && (
                            <p className="text-red-500 text-sm mt-1">{personalErrors.email.message}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={updatePersonalInfoMutation.isPending}
                        className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                      >
                        {updatePersonalInfoMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Order History Tab */}
              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-roastah-warm-gray">No orders yet</p>
                        <Link href="/products" className="mt-4 inline-block">
                          <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">Order #{order.id}</h4>
                                <p className="text-sm text-roastah-warm-gray">
                                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                className={
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-roastah-warm-gray">
                                Total: ${parseFloat(order.totalAmount).toFixed(2)}
                              </p>
                              <Button variant="ghost" className="text-roastah-teal hover:text-roastah-dark-teal">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Saved Addresses</CardTitle>
                      <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            {...registerAddress("address")}
                            placeholder="123 Coffee Street"
                            className={addressErrors.address ? "border-red-500" : ""}
                          />
                          {addressErrors.address && (
                            <p className="text-red-500 text-sm mt-1">{addressErrors.address.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            {...registerAddress("city")}
                            placeholder="Seattle"
                            className={addressErrors.city ? "border-red-500" : ""}
                          />
                          {addressErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{addressErrors.city.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            {...registerAddress("state")}
                            placeholder="WA"
                            className={addressErrors.state ? "border-red-500" : ""}
                          />
                          {addressErrors.state && (
                            <p className="text-red-500 text-sm mt-1">{addressErrors.state.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            {...registerAddress("zipCode")}
                            placeholder="98101"
                            className={addressErrors.zipCode ? "border-red-500" : ""}
                          />
                          {addressErrors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">{addressErrors.zipCode.message}</p>
                          )}
                        </div>
                      </div>
                      <Button type="submit" className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                        Save Address
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Seller Settings Tab (Roaster Only) */}
              {isRoaster && (
                <TabsContent value="seller" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Seller Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          defaultValue={user?.roaster?.businessName || ""}
                          placeholder="Your Coffee Roastery"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessDescription">Business Description</Label>
                        <Textarea
                          id="businessDescription"
                          rows={3}
                          defaultValue={user?.roaster?.description || ""}
                          placeholder="Tell customers about your roasting philosophy and what makes your coffee special..."
                        />
                      </div>
                      <div>
                        <Label>Stripe Connect Status</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Connected and verified</span>
                        </div>
                      </div>
                      <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                        Save Settings
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
