import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "react-router-dom";
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
  isUnlisted: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  isFairTrade: z.boolean().default(false),
  isRainforestAlliance: z.boolean().default(false),
  isDirect: z.boolean().default(false),
  isWomenOwned: z.boolean().default(false),
  isDriedNaturally: z.boolean().default(false),
  isSingleOrigin: z.boolean().default(false),
  isMicrolot: z.boolean().default(false),
  isEstate: z.boolean().default(false),
  isHoneyed: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function SellerProducts() {
  const { isAuthenticated, isLoading, isRoaster, user } = useUser();
  const { toast } = useToast();
  const location = useLocation();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<ProductState | "all">("all");
  const [activeTab, setActiveTab] = useState("manage");

  // Get active tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['manage', 'add-single', 'bulk-upload'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

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
      }, 2000);
      return;
    }

    // Skip roaster check for development impersonated users
    if (!isLoading && isAuthenticated && !isRoaster && !user?.id?.startsWith('dev-seller-')) {
      toast({
        title: "Access Denied",
        description: "You need to be a roaster to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [isAuthenticated, isLoading, isRoaster, toast]);

  // Fetch data
  const { data: products = [], error: productsError } = useQuery({
    queryKey: ['/api/roaster/products'],
    enabled: isAuthenticated && isRoaster,
  });

  const { data: roasterInfo, error: roasterError } = useQuery({
    queryKey: ['/api/roaster/profile'],
    enabled: isAuthenticated && isRoaster,
  });

  // Handle authentication errors
  useEffect(() => {
    if (productsError && isUnauthorizedError(productsError)) {
      window.location.href = "/api/login";
    }
    if (roasterError && isUnauthorizedError(roasterError)) {
      window.location.href = "/api/login";
    }
  }, [productsError, roasterError]);

  // Form setup
  const form = useForm<ProductFormData>({
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
      isUnlisted: false,
      isOrganic: false,
      isFairTrade: false,
      isRainforestAlliance: false,
      isDirect: false,
      isWomenOwned: false,
      isDriedNaturally: false,
      isSingleOrigin: false,
      isMicrolot: false,
      isEstate: false,
      isHoneyed: false,
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roaster/products'] });
      form.reset();
      setActiveTab("manage");
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roaster/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Add products with state information
  const productsWithState: ProductWithState[] = Array.isArray(products) 
    ? products.map((product: Product) => ({
        ...product,
        state: product.stockQuantity === 0 ? 'out-of-stock' as ProductState :
               product.isUnlisted ? 'draft' as ProductState : 'active' as ProductState
      }))
    : [];

  // Filter products
  const filteredProducts = productsWithState.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.origin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === "all" || product.state === filterState;
    return matchesSearch && matchesState;
  });

  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="bg-white rounded-xl p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRoaster) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Product Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your coffee products and inventory with individual or bulk operations.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterState} onValueChange={(value) => setFilterState(value as ProductState | "all")}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.origin}</div>
                            </div>
                          </TableCell>
                          <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell>{product.stockQuantity}</TableCell>
                          <TableCell>
                            <Badge className={getStateColor(product.state)}>
                              {getStateLabel(product.state)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getActiveTags(product).slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                                  {getTagLabel(tag)}
                                </Badge>
                              ))}
                              {getActiveTags(product).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{getActiveTags(product).length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canEditProduct(product.state) && (
                                <Link to={`/seller/products/edit/${product.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {canDeleteProduct(product.state) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterState !== "all" ? "No products found" : "No products yet"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterState !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Start by adding your first coffee product to your inventory."
                    }
                  </p>
                  {(!searchTerm && filterState === "all") && (
                    <Button onClick={() => setActiveTab("add-single")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  )}
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
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
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
                    <Label htmlFor="origin">Origin *</Label>
                    <Input
                      id="origin"
                      {...form.register("origin")}
                      placeholder="e.g., Ethiopia, Yirgacheffe"
                    />
                    {form.formState.errors.origin && (
                      <p className="text-sm text-red-600">{form.formState.errors.origin.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
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
                </div>

                {/* Coffee Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="roastLevel">Roast Level *</Label>
                    <Select onValueChange={(value) => form.setValue("roastLevel", value)}>
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
                    <Label htmlFor="process">Process *</Label>
                    <Select onValueChange={(value) => form.setValue("process", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select process" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="washed">Washed</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="honey">Honey</SelectItem>
                        <SelectItem value="semi-washed">Semi-Washed</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.process && (
                      <p className="text-sm text-red-600">{form.formState.errors.process.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altitude">Altitude</Label>
                    <Input
                      id="altitude"
                      {...form.register("altitude")}
                      placeholder="e.g., 1,200-1,800m"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="varietal">Varietal</Label>
                  <Input
                    id="varietal"
                    {...form.register("varietal")}
                    placeholder="e.g., Heirloom varieties"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Describe your coffee's unique characteristics..."
                    rows={3}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tastingNotes">Tasting Notes *</Label>
                  <Input
                    id="tastingNotes"
                    {...form.register("tastingNotes")}
                    placeholder="e.g., Floral, citrus, chocolate"
                  />
                  {form.formState.errors.tastingNotes && (
                    <p className="text-sm text-red-600">{form.formState.errors.tastingNotes.message}</p>
                  )}
                </div>

                {/* Product Tags */}
                <div className="space-y-4">
                  <Label>Product Tags</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="isOrganic" {...form.register("isOrganic")} />
                      <Label htmlFor="isOrganic">Organic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isFairTrade" {...form.register("isFairTrade")} />
                      <Label htmlFor="isFairTrade">Fair Trade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isRainforestAlliance" {...form.register("isRainforestAlliance")} />
                      <Label htmlFor="isRainforestAlliance">Rainforest Alliance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isDirect" {...form.register("isDirect")} />
                      <Label htmlFor="isDirect">Direct Trade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isWomenOwned" {...form.register("isWomenOwned")} />
                      <Label htmlFor="isWomenOwned">Women Owned</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isSingleOrigin" {...form.register("isSingleOrigin")} />
                      <Label htmlFor="isSingleOrigin">Single Origin</Label>
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div className="flex items-center space-x-2">
                  <Switch id="isUnlisted" {...form.register("isUnlisted")} />
                  <Label htmlFor="isUnlisted">Save as draft (unlisted)</Label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createProductMutation.isPending}
                    className="bg-roastah-teal hover:bg-roastah-dark-teal"
                  >
                    {createProductMutation.isPending ? "Creating..." : "Create Product"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload">
          {roasterInfo ? (
            <BulkProductUpload roasterId={roasterInfo.id} />
          ) : (
            <BulkProductUpload roasterId={1} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}