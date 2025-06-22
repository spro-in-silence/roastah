import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Search, Edit, Trash2, Package, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function SellerProducts() {
  const { user, isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("manage");

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
                                  onClick={() => setLocation(`/seller/products/${product.id}/edit`)}
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
                  <Plus className="h-5 w-5" />
                  Add New Product
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a single product with detailed information and images.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-roastah-teal mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Your Product</h3>
                  <p className="text-roastah-warm-gray mb-6">
                    Add detailed information about your coffee including origin, roast level, and tasting notes.
                  </p>
                  <Link href="/seller/products/new">
                    <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Product
                    </Button>
                  </Link>
                </div>
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
