import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  stockQuantity: z.number().min(0, "Stock quantity must be 0 or greater"),
  origin: z.string().optional(),
  roastLevel: z.string().min(1, "Roast level is required"),
  process: z.string().optional(),
  altitude: z.string().optional(),
  varietal: z.string().optional(),
  tastingNotes: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function SellerProductsEdit() {
  const [, params] = useRoute("/seller/products/:id/edit");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  const productId = params?.id;
  const isRoaster = (user as any)?.isRoasterApproved;

  // Fetch product data
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/roaster/products", productId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/roaster/products/${productId}`);
      return response.json();
    },
    enabled: !!productId,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      origin: "",
      roastLevel: "",
      process: "",
      altitude: "",
      varietal: "",
      tastingNotes: "",
    },
  });

  // Update form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        price: parseFloat(product.price) || 0,
        stockQuantity: product.stockQuantity || 0,
        origin: product.origin || "",
        roastLevel: product.roastLevel || "",
        process: product.process || "",
        altitude: product.altitude || "",
        varietal: product.varietal || "",
        tastingNotes: product.tastingNotes || "",
      });
    }
  }, [product, form]);

  // Redirect if not authenticated or not a roaster
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

    if (!isLoading && isAuthenticated && !isRoaster) {
      setLocation("/");
      return;
    }
  }, [isAuthenticated, isLoading, isRoaster, toast, setLocation]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      await apiRequest("PUT", `/api/roaster/products/${productId}`, {
        ...data,
        price: data.price.toString(),
        stockQuantity: data.stockQuantity,
        status: product?.status || "published",
        images: product?.images || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      toast({
        title: "Product Updated",
        description: "Your product has been successfully updated.",
      });
      setLocation("/seller/products");
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
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      await apiRequest("PUT", `/api/roaster/products/${productId}`, {
        ...data,
        price: data.price.toString(),
        stockQuantity: data.stockQuantity,
        status: "draft",
        images: product?.images || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      toast({
        title: "Draft Saved",
        description: "Your product has been saved as a draft.",
      });
      setLocation("/seller/products");
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
    updateProductMutation.mutate(data);
  };

  const onSaveDraft = () => {
    const formData = form.getValues();
    saveDraftMutation.mutate(formData);
  };

  if (isLoading || productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="bg-white rounded-xl p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRoaster || !product) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Update your coffee product details. Changes will be visible to customers immediately.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="e.g., Ethiopian Yirgacheffe"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    {...form.register("stockQuantity", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.stockQuantity && (
                    <p className="text-sm text-red-600">{form.formState.errors.stockQuantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roastLevel">Roast Level *</Label>
                  <Select
                    value={form.watch("roastLevel")}
                    onValueChange={(value) => form.setValue("roastLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select roast level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium-light">Medium-Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.roastLevel && (
                    <p className="text-sm text-red-600">{form.formState.errors.roastLevel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    {...form.register("origin")}
                    placeholder="e.g., Ethiopia, Colombia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="process">Processing Method</Label>
                  <Input
                    id="process"
                    {...form.register("process")}
                    placeholder="e.g., Washed, Natural, Honey"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altitude">Altitude</Label>
                  <Input
                    id="altitude"
                    {...form.register("altitude")}
                    placeholder="e.g., 1800m"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="varietal">Varietal</Label>
                  <Input
                    id="varietal"
                    {...form.register("varietal")}
                    placeholder="e.g., Bourbon, Typica"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your coffee's unique characteristics..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tastingNotes">Tasting Notes</Label>
                <Textarea
                  id="tastingNotes"
                  {...form.register("tastingNotes")}
                  placeholder="e.g., Bright acidity with notes of citrus, chocolate, and floral undertones"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProductMutation.isPending ? "Updating..." : "Update Product"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  disabled={saveDraftMutation.isPending}
                  onClick={onSaveDraft}
                  className="border-roastah-warm-gray text-roastah-warm-gray hover:bg-roastah-warm-gray hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {saveDraftMutation.isPending ? "Saving..." : "Save as Draft"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}