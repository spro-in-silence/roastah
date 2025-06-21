import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Package, RefreshCw, Database, ShoppingCart, Users } from "lucide-react";

export default function MedusaAdmin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch MedusaJS-formatted products
  const { data: medusaProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/medusa/products"],
  });

  // Sync products to MedusaJS
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/medusa/sync-products");
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.count} products to MedusaJS`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medusa/products"] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync products to MedusaJS",
        variant: "destructive",
      });
    },
  });

  const handleSyncProducts = () => {
    syncProductsMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MedusaJS Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your e-commerce integration and sync data between Roastah and MedusaJS
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleSyncProducts}
            disabled={syncProductsMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Sync className="w-4 h-4 mr-2" />
            {syncProductsMutation.isPending ? "Syncing..." : "Sync Products"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medusaProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for MedusaJS sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              MedusaJS bridge running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-commerce Features</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enhanced</div>
            <p className="text-xs text-muted-foreground">
              Advanced cart & checkout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-vendor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enabled</div>
            <p className="text-xs text-muted-foreground">
              Roaster management
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MedusaJS Products Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>MedusaJS Product Sync</CardTitle>
          <CardDescription>
            View and manage products synchronized with MedusaJS e-commerce engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : medusaProducts.length > 0 ? (
            <div className="space-y-4">
              {medusaProducts.slice(0, 5).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        {product.metadata?.roast_level || 'Unknown Roast'}
                      </Badge>
                      <Badge variant="outline">
                        {product.metadata?.origin || 'Unknown Origin'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${product.variants?.[0]?.prices?.[0]?.amount ? 
                        (product.variants[0].prices[0].amount / 100).toFixed(2) : 
                        'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.variants?.[0]?.inventory_quantity || 0}
                    </div>
                  </div>
                </div>
              ))}
              {medusaProducts.length > 5 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    And {medusaProducts.length - 5} more products...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products synced yet</p>
              <Button
                onClick={handleSyncProducts}
                className="mt-4 bg-teal-600 hover:bg-teal-700"
                disabled={syncProductsMutation.isPending}
              >
                Sync Products Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>E-commerce Features</CardTitle>
            <CardDescription>
              Enhanced by MedusaJS integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Advanced product catalog management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Multi-vendor order processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Enhanced inventory tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automated payment processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Scalable order management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Synchronization</CardTitle>
            <CardDescription>
              Keep your data in sync across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Products</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Synced
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Roaster Profiles</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Synced
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Order Processing</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Inventory Updates</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Real-time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}