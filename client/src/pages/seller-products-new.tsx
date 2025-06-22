import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  origin: z.string().min(1, "Origin is required"),
  roastLevel: z.string().min(1, "Roast level is required"),
  process: z.string().min(1, "Process is required"),
  altitude: z.string().optional(),
  varietal: z.string().optional(),
  tastingNotes: z.string().min(1, "Tasting notes are required"),
});

type ProductForm = z.infer<typeof productSchema>;

export default function SellerProductsNew() {
  const { isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();
  const navigate = useLocation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stockQuantity: 50,
      price: 0,
    },
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

  // Redirect if not a roaster
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isRoaster) {
      toast({
        title: "Access Denied",
        description: "You need to be a roaster to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/become-roastah";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, isRoaster, toast]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const result = await apiRequest("POST", "/api/roaster/products", {
        ...data,
        price: data.price.toString(),
        stockQuantity: data.stockQuantity,
        status: "published",
        images: [], // TODO: Implement image upload
      });
      return result;
    },
    onSuccess: (newProduct) => {
      // Update cache immediately by adding the new product
      queryClient.setQueryData(["/api/roaster/products"], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) {
          return [newProduct];
        }
        return [newProduct, ...oldData];
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      toast({
        title: "Product Created",
        description: "Your product has been successfully created and published.",
      });
      navigate("/seller/products");
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
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      await apiRequest("POST", "/api/roaster/products", {
        ...data,
        price: data.price.toString(),
        stockQuantity: data.stockQuantity,
        status: "draft",
        images: [], // TODO: Implement image upload
      });
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your product has been saved as a draft.",
      });
      navigate("/seller/products");
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
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    createProductMutation.mutate(data);
  };

  const onSaveDraft = () => {
    const formData = watch();
    saveDraftMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!isRoaster) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link to="/seller/products">
            <Button variant="ghost" size="sm" className="mr-4 text-roastah-teal hover:text-roastah-dark-teal">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Ethiopian Yirgacheffe"
                      {...register("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="18.99"
                      {...register("price", { valueAsNumber: true })}
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      placeholder="50"
                      {...register("stockQuantity", { valueAsNumber: true })}
                      className={errors.stockQuantity ? "border-red-500" : ""}
                    />
                    {errors.stockQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Describe your coffee's unique characteristics, flavor profile, and origin story..."
                      {...register("description")}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coffee Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Coffee Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      placeholder="e.g. Ethiopia, Yirgacheffe"
                      {...register("origin")}
                      className={errors.origin ? "border-red-500" : ""}
                    />
                    {errors.origin && (
                      <p className="text-red-500 text-sm mt-1">{errors.origin.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="roastLevel">Roast Level</Label>
                    <Select onValueChange={(value) => setValue("roastLevel", value)}>
                      <SelectTrigger className={errors.roastLevel ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select roast level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Roast</SelectItem>
                        <SelectItem value="medium-light">Medium-Light Roast</SelectItem>
                        <SelectItem value="medium">Medium Roast</SelectItem>
                        <SelectItem value="medium-dark">Medium-Dark Roast</SelectItem>
                        <SelectItem value="dark">Dark Roast</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.roastLevel && (
                      <p className="text-red-500 text-sm mt-1">{errors.roastLevel.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="process">Process</Label>
                    <Select onValueChange={(value) => setValue("process", value)}>
                      <SelectTrigger className={errors.process ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select process" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="washed">Washed</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="honey">Honey</SelectItem>
                        <SelectItem value="wet-hulled">Wet-hulled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.process && (
                      <p className="text-red-500 text-sm mt-1">{errors.process.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="altitude">Altitude</Label>
                    <Input
                      id="altitude"
                      placeholder="e.g. 1,800-2,200m"
                      {...register("altitude")}
                      className={errors.altitude ? "border-red-500" : ""}
                    />
                    {errors.altitude && (
                      <p className="text-red-500 text-sm mt-1">{errors.altitude.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="varietal">Varietal</Label>
                    <Input
                      id="varietal"
                      placeholder="e.g. Bourbon, Typica"
                      {...register("varietal")}
                      className={errors.varietal ? "border-red-500" : ""}
                    />
                    {errors.varietal && (
                      <p className="text-red-500 text-sm mt-1">{errors.varietal.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="tastingNotes">Tasting Notes</Label>
                    <Input
                      id="tastingNotes"
                      placeholder="e.g. Floral, citrus, bright acidity"
                      {...register("tastingNotes")}
                      className={errors.tastingNotes ? "border-red-500" : ""}
                    />
                    {errors.tastingNotes && (
                      <p className="text-red-500 text-sm mt-1">{errors.tastingNotes.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Product Images</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-roastah-warm-gray mb-2">Drop your images here or click to browse</p>
                  <p className="text-sm text-roastah-warm-gray">PNG, JPG up to 10MB each</p>
                  <Button type="button" variant="outline" className="mt-4">
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="flex-1 bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                >
                  {createProductMutation.isPending ? "Publishing..." : "Publish Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                </Button>
                <Link to="/seller/products">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
