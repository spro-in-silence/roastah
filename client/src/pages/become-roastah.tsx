import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Store, Users, TrendingUp, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

const roastahApplicationSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  roastingExperience: z.string().min(1, "Please select your experience level"),
  philosophy: z.string().min(10, "Please tell us about your roasting philosophy (minimum 10 characters)"),
});

type RoastahApplicationForm = z.infer<typeof roastahApplicationSchema>;

export default function BecomeRoastah() {
  const { isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RoastahApplicationForm>({
    resolver: zodResolver(roastahApplicationSchema),
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

  // Redirect if already a roaster
  useEffect(() => {
    if (isRoaster) {
      navigate("/seller/dashboard");
    }
  }, [isRoaster, navigate]);

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: RoastahApplicationForm) => {
      await apiRequest("POST", "/api/roaster/apply", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your Roastah application has been submitted successfully. We'll review it and get back to you soon.",
      });
      
      // Simulate successful roaster approval and redirect
      setTimeout(() => {
        toast({
          title: "Welcome to Roastah!",
          description: "Your application has been approved. Welcome to the Roastah community!",
        });
        navigate("/seller/dashboard");
      }, 2000);
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
        title: "Application Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RoastahApplicationForm) => {
    submitApplicationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="bg-white rounded-xl p-8">
              <div className="space-y-6">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
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
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="h-8 w-8 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Become a Roastah</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community of passionate coffee roasters and share your craft with the world
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-roastah-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-roastah-yellow" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Your Own Storefront</h3>
            <p className="text-roastah-warm-gray">
              Create a beautiful profile showcasing your roasts and tell your story
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-roastah-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-roastah-teal" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Reach Coffee Lovers</h3>
            <p className="text-roastah-warm-gray">
              Connect with customers who appreciate quality, artisanal coffee
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-roastah-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-roastah-yellow" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Grow Your Business</h3>
            <p className="text-roastah-warm-gray">
              Access tools and analytics to help scale your roasting operation
            </p>
          </div>
        </div>

        {/* Onboarding Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g. Verde Coffee Works"
                      {...register("businessName")}
                      className={errors.businessName ? "border-red-500" : ""}
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select onValueChange={(value) => setValue("businessType", value)}>
                      <SelectTrigger className={errors.businessType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home_roaster">Home Roaster</SelectItem>
                        <SelectItem value="micro_roastery">Micro Roastery</SelectItem>
                        <SelectItem value="small_business">Small Business</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.businessType && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input
                      id="businessAddress"
                      placeholder="Street address"
                      {...register("businessAddress")}
                      className={errors.businessAddress ? "border-red-500" : ""}
                    />
                    {errors.businessAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessAddress.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select onValueChange={(value) => setValue("state", value)}>
                      <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="OR">Oregon</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register("zipCode")}
                      className={errors.zipCode ? "border-red-500" : ""}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Roasting Experience */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Roasting Journey</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roastingExperience">How long have you been roasting coffee?</Label>
                    <Select onValueChange={(value) => setValue("roastingExperience", value)}>
                      <SelectTrigger className={errors.roastingExperience ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less_than_1_year">Less than 1 year</SelectItem>
                        <SelectItem value="1_2_years">1-2 years</SelectItem>
                        <SelectItem value="3_5_years">3-5 years</SelectItem>
                        <SelectItem value="5_plus_years">5+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.roastingExperience && (
                      <p className="text-red-500 text-sm mt-1">{errors.roastingExperience.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="philosophy">Tell us about your roasting philosophy</Label>
                    <Textarea
                      id="philosophy"
                      rows={4}
                      placeholder="What makes your coffee special? What's your approach to roasting?"
                      {...register("philosophy")}
                      className={errors.philosophy ? "border-red-500" : ""}
                    />
                    {errors.philosophy && (
                      <p className="text-red-500 text-sm mt-1">{errors.philosophy.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Setup */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Setup</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 12h20v-2H2v2zm0 4h20v-2H2v2zm0-8h20V6H2v2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Stripe Connect Setup</h4>
                  <p className="text-sm text-roastah-warm-gray mb-4">
                    We'll help you set up Stripe Connect to receive payments securely
                  </p>
                  <p className="text-xs text-roastah-warm-gray">
                    This will be completed after your initial application
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={submitApplicationMutation.isPending}
                  className="flex-1 bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                >
                  {submitApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="px-6"
                  onClick={() => toast({ title: "Draft Saved", description: "Your application has been saved as a draft." })}
                >
                  Save Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
