import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Package, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Product } from "@/lib/types";
import { 
  getStateColor, 
  getStateLabel, 
  getTagColor, 
  getTagLabel, 
  getActiveTags, 
  canEditProduct, 
  canDeleteProduct,
  type ProductState,
  type ProductWithState
} from "@/lib/product-state";
import BulkProductUpload from "@/components/bulk-product-upload";

// Product form schema
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
  // Product tags
  isUnlisted: z.boolean().default(false),
  isPreorder: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  isScheduled: z.boolean().default(false),
  // Scheduling dates
  scheduledPublishAt: z.string().optional(),
  preorderShippingDate: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function SellerProducts() {
  const { user, isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("manage");
  const [editingProduct, setEditingProduct] = useState<ProductWithState | null>(null);

  // Product form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stockQuantity: 50,
      price: 0,
      isUnlisted: false,
      isPreorder: false,
      isPrivate: false,
      isScheduled: false,
    },
  });

  // Function to handle product editing
  const handleEditProduct = (product: ProductWithState) => {
    setEditingProduct(product);
    
    // Populate the form with product data
    reset({
      name: product.name,
      description: product.description || "",
      price: parseFloat(product.price),
      stockQuantity: product.stockQuantity,
      origin: product.origin || "",
      roastLevel: product.roastLevel,
      process: product.process || "",
      altitude: product.altitude || "",
      varietal: product.varietal || "",
      tastingNotes: product.tastingNotes || "",
      isUnlisted: product.isUnlisted || false,
      isPreorder: product.isPreorder || false,
      isPrivate: product.isPrivate || false,
      isScheduled: product.isScheduled || false,
      scheduledPublishAt: product.scheduledPublishAt ? new Date(product.scheduledPublishAt).toISOString().slice(0, 16) : "",
      preorderShippingDate: product.preorderShippingDate ? new Date(product.preorderShippingDate).toISOString().slice(0, 16) : "",
    });
    
    // Switch to the Add Product tab
    setActiveTab("add-single");
  };

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

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithState[]>({
    queryKey: ["/api/roaster/products"],
    enabled: isAuthenticated && isRoaster,
  });

  // Get roaster info to get the roaster ID
  const { data: roasterInfo } = useQuery<{id: number}>({
    queryKey: ["/api/roaster/profile"],
    enabled: isAuthenticated && isRoaster,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/roaster/products/${productId}`);
      return productId;
    },
    onSuccess: (deletedProductId) => {
      // Update cache immediately by removing the deleted product
      queryClient.setQueryData(["/api/roaster/products"], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) {
          return oldData;
        }
        return oldData.filter((product: any) => product.id !== deletedProductId);
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
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
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Product creation/update mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const endpoint = editingProduct 
        ? `/api/roaster/products/${editingProduct.id}`
        : "/api/roaster/products";
      const method = editingProduct ? "PUT" : "POST";
      
      const result = await apiRequest(method, endpoint, {
        ...data,
        price: data.price.toString(),
        stockQuantity: data.stockQuantity,
        status: "published",
        images: [],
      });
      return result;
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(["/api/roaster/products"], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) {
          return [updatedProduct];
        }
        
        if (editingProduct) {
          // Update existing product
          return oldData.map((product: any) => 
            product.id === editingProduct.id ? updatedProduct : product
          );
        } else {
          // Add new product
          return [updatedProduct, ...oldData];
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      toast({
        title: editingProduct ? "Product Updated" : "Product Created",
        description: editingProduct 
          ? "Your product has been successfully updated."
          : "Your product has been successfully created and published.",
      });
      reset();
      setEditingProduct(null);
      setActiveTab("manage");
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
        description: editingProduct 
          ? "Failed to update product. Please try again."
          : "Failed to create product. Please try again.",
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
        images: [],
      });
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your product has been saved as a draft.",
      });
      reset();
      setActiveTab("manage");
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

  // Filter products based on search and state
  const filteredProducts = products.filter((product: ProductWithState) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.origin?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = stateFilter === "all" || product.state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!isRoaster) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your coffee products and inventory with individual or bulk operations.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Manage Products
            </TabsTrigger>
            <TabsTrigger value="add-single" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </TabsTrigger>
            <TabsTrigger value="bulk-upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </TabsTrigger>
          </TabsList>

          {/* Manage Products Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Your Products</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 min-w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          </div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {products.length === 0 ? "No products yet" : "No products found"}
                    </h3>
                    <p className="text-roastah-warm-gray mb-6">
                      {products.length === 0 
                        ? "Start by adding your first coffee product to share with customers"
                        : "Try adjusting your search or filter criteria"
                      }
                    </p>
                    {products.length === 0 && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => setActiveTab('add-single')}
                          className="bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Single Product
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('bulk-upload')}
                          variant="outline"
                          className="border-roastah-teal text-roastah-teal hover:bg-roastah-teal hover:text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Bulk Upload CSV
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>State & Tags</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product: ProductWithState) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.images?.[0] || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&fit=crop&w=60&h=60"}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                  <div className="text-sm text-roastah-warm-gray">
                                    {product.roastLevel} • {product.origin}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              ${parseFloat(product.price).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span className={product.stockQuantity === 0 ? "text-red-600" : "text-gray-900 dark:text-white"}>
                                {product.stockQuantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {/* Main State Badge */}
                                <Badge className={getStateColor(product.state as ProductState)}>
                                  {getStateLabel(product.state as ProductState)}
                                </Badge>
                                
                                {/* Tag Badges */}
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
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  className="text-roastah-teal hover:text-roastah-dark-teal"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={deleteProductMutation.isPending}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Single Product Tab */}
          <TabsContent value="add-single" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingProduct ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {editingProduct 
                    ? `Update product details and settings. Created on ${new Date(editingProduct.createdAt).toLocaleDateString()}`
                    : "Create a single product with detailed information and images."
                  }
                </p>
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

                  {/* Product Settings */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Product Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Private Product Toggle */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Private Product</Label>
                          <p className="text-xs text-gray-500">Only visible to you and invited customers</p>
                        </div>
                        <Switch
                          checked={watch("isPrivate") ?? false}
                          onCheckedChange={(checked) => setValue("isPrivate", checked)}
                        />
                      </div>

                      {/* Unlisted Product Toggle */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Unlisted Product</Label>
                          <p className="text-xs text-gray-500">Hidden from search results and listings</p>
                        </div>
                        <Switch
                          checked={watch("isUnlisted") ?? false}
                          onCheckedChange={(checked) => setValue("isUnlisted", checked)}
                        />
                      </div>

                      {/* Pre-order Toggle */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Pre-order Product</Label>
                          <p className="text-xs text-gray-500">Allow customers to pre-order before availability</p>
                        </div>
                        <Switch
                          checked={watch("isPreorder") ?? false}
                          onCheckedChange={(checked) => setValue("isPreorder", checked)}
                        />
                      </div>

                      {/* Scheduled Publishing Toggle */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Scheduled Publishing</Label>
                          <p className="text-xs text-gray-500">Schedule when product becomes available</p>
                        </div>
                        <Switch
                          checked={watch("isScheduled") ?? false}
                          onCheckedChange={(checked) => setValue("isScheduled", checked)}
                        />
                      </div>
                    </div>

                    {/* Conditional Date Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {watch("isPreorder") && (
                        <div>
                          <Label htmlFor="preorderShippingDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pre-order Shipping Date
                          </Label>
                          <Input
                            id="preorderShippingDate"
                            type="datetime-local"
                            {...register("preorderShippingDate")}
                            className="mt-1"
                          />
                          {errors.preorderShippingDate && (
                            <p className="text-red-600 text-sm mt-1">{errors.preorderShippingDate.message}</p>
                          )}
                        </div>
                      )}

                      {watch("isScheduled") && (
                        <div>
                          <Label htmlFor="scheduledPublishAt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Scheduled Publish Date
                          </Label>
                          <Input
                            id="scheduledPublishAt"
                            type="datetime-local"
                            {...register("scheduledPublishAt")}
                            className="mt-1"
                          />
                          {errors.scheduledPublishAt && (
                            <p className="text-red-600 text-sm mt-1">{errors.scheduledPublishAt.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Images */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Product Images</h2>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-roastah-warm-gray mb-2">Drop your images here or click to browse</p>
                      <p className="text-sm text-roastah-warm-gray">PNG, JPG up to 10MB each</p>
                      <Button type="button" variant="outline" className="mt-4">
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={createProductMutation.isPending}
                      className="flex-1 bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                    >
                      {createProductMutation.isPending 
                        ? (editingProduct ? "Updating..." : "Publishing...") 
                        : (editingProduct ? "Update Product" : "Publish Product")
                      }
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onSaveDraft}
                      disabled={saveDraftMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setEditingProduct(null);
                        setActiveTab("manage");
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Upload Tab */}
          <TabsContent value="bulk-upload" className="space-y-6">
            {products.length > 0 && products[0]?.roasterId ? (
              <BulkProductUpload roasterId={products[0].roasterId} />
            ) : roasterInfo?.id ? (
              <BulkProductUpload roasterId={roasterInfo.id} />
            ) : (
              <BulkProductUpload roasterId={1} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
