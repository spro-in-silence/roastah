import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Eye, Clock, Archive, Trash2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const editProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  stockQuantity: z.number().int().min(0, "Stock quantity must be non-negative"),
  origin: z.string().optional(),
  roastLevel: z.string().optional(),
  process: z.string().optional(),
  altitude: z.string().optional(),
  varietal: z.string().optional(),
  tastingNotes: z.string().optional(),
  images: z.array(z.string()).default([]),
});
import { 
  ProductState, 
  ProductWithState,
  getStateColor, 
  getStateLabel, 
  getTagColor, 
  getTagLabel,
  getActiveTags,
  canEditProduct,
  canPublishProduct,
  canArchiveProduct,
  canDeleteProduct,
  getAvailableTransitions
} from "@/lib/product-state";

export default function SellerProductEdit() {
  const [, params] = useRoute("/seller/products/:id/edit");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const productId = parseInt(params?.id || "0");

  // Fetch product data
  const { data: product, isLoading: productLoading } = useQuery<ProductWithState>({
    queryKey: [`/api/roaster/products/${productId}`],
    enabled: !!productId,
  });

  const form = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
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
      images: [],
    },
  });

  // Update form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        price: parseFloat(product.price?.toString() || "0"),
        stockQuantity: product.stockQuantity || 0,
        origin: product.origin || "",
        roastLevel: product.roastLevel || "",
        process: product.process || "",
        altitude: product.altitude || "",
        varietal: product.varietal || "",
        tastingNotes: product.tastingNotes || "",
        images: Array.isArray(product.images) ? product.images as string[] : [],
      });
    }
  }, [product, form]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/roaster/products/${productId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // State transition mutation
  const stateTransitionMutation = useMutation({
    mutationFn: async (newState: ProductState) => {
      return apiRequest("PATCH", `/api/roaster/products/${productId}/state`, { state: newState });
    },
    onSuccess: (data, newState) => {
      // Update the cache immediately for instant UI reflection
      queryClient.setQueryData([`/api/roaster/products/${productId}`], (oldData: any) => {
        if (oldData) {
          return { ...oldData, state: newState };
        }
        return oldData;
      });
      
      toast({
        title: "State Updated",
        description: `Product state changed to ${getStateLabel(newState)}.`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/roaster/products/${productId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "State Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Tag toggle mutation
  const tagToggleMutation = useMutation({
    mutationFn: async ({ tag, value }: { tag: string; value: boolean }) => {
      return apiRequest("PATCH", `/api/roaster/products/${productId}/tags`, { [tag]: value });
    },
    onSuccess: (data, { tag, value }) => {
      // Update the cache immediately for instant UI reflection
      queryClient.setQueryData([`/api/roaster/products/${productId}`], (oldData: any) => {
        if (oldData) {
          return { ...oldData, [tag]: value };
        }
        return oldData;
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/roaster/products/${productId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Tag Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateProductMutation.mutate(data);
  };

  const handleStateTransition = (newState: ProductState) => {
    stateTransitionMutation.mutate(newState);
  };

  const handleTagToggle = (tag: string, value: boolean) => {
    tagToggleMutation.mutate({ tag, value });
  };

  if (productLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => navigate("/seller/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = canEditProduct(product.state as ProductState);
  const availableTransitions = getAvailableTransitions(product.state as ProductState);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/seller/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getStateColor(product.state as ProductState)}>
                {getStateLabel(product.state as ProductState)}
              </Badge>
              {getActiveTags(product).map((tag) => (
                <Badge 
                  key={tag}
                  variant="outline" 
                  className={`text-xs ${getTagColor(tag)}`}
                >
                  {getTagLabel(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              disabled={!canEdit}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roastLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roast Level</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange} disabled={!canEdit}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select roast level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="medium-light">Medium Light</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="medium-dark">Medium Dark</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="process"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Process</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="altitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altitude</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="varietal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Varietal</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tastingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasting Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {canEdit && (
                    <Button 
                      type="submit" 
                      disabled={updateProductMutation.isPending}
                      className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* State Management */}
          <Card>
            <CardHeader>
              <CardTitle>Product State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current State:</span>
                <Badge className={getStateColor(product.state as ProductState)}>
                  {getStateLabel(product.state as ProductState)}
                </Badge>
              </div>

              {availableTransitions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Change State:</label>
                    <Select onValueChange={handleStateTransition} disabled={stateTransitionMutation.isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new state..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTransitions.map((state) => (
                          <SelectItem key={state} value={state}>
                            <div className="flex items-center">
                              {state === 'pending_review' && <Send className="h-4 w-4 mr-2" />}
                              {state === 'published' && <Eye className="h-4 w-4 mr-2" />}
                              {state === 'archived' && <Archive className="h-4 w-4 mr-2" />}
                              {state === 'draft' && <Clock className="h-4 w-4 mr-2" />}
                              {state === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                              {getStateLabel(state)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Product Tags - Only show when editing is allowed */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Product Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Unlisted</label>
                    <Switch
                      checked={product.isUnlisted || false}
                      onCheckedChange={(checked) => handleTagToggle('isUnlisted', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Private</label>
                    <Switch
                      checked={product.isPrivate || false}
                      onCheckedChange={(checked) => handleTagToggle('isPrivate', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pre-order</label>
                    <Switch
                      checked={product.isPreorder || false}
                      onCheckedChange={(checked) => handleTagToggle('isPreorder', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Out of Stock</label>
                    <Switch
                      checked={product.isOutOfStock || false}
                      onCheckedChange={(checked) => handleTagToggle('isOutOfStock', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Scheduled</label>
                    <Switch
                      checked={product.isScheduled || false}
                      onCheckedChange={(checked) => handleTagToggle('isScheduled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          {canDeleteProduct(product.state as ProductState) && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
                      // Delete product logic here
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}