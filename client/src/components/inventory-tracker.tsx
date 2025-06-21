import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Package, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types";

interface InventoryTrackerProps {
  product: Product;
}

export default function InventoryTracker({ product }: InventoryTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(product.stockQuantity);

  const updateStockMutation = useMutation({
    mutationFn: async (quantity: number) => {
      await apiRequest("PUT", `/api/products/${product.id}`, {
        stockQuantity: quantity
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roaster/products"] });
      toast({
        title: "Stock Updated",
        description: `${product.name} stock updated to ${newStock} units.`,
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update stock level.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (newStock < 0) {
      toast({
        title: "Invalid Stock",
        description: "Stock quantity cannot be negative.",
        variant: "destructive",
      });
      return;
    }
    updateStockMutation.mutate(newStock);
  };

  const handleCancel = () => {
    setNewStock(product.stockQuantity);
    setIsEditing(false);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (quantity <= 5) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    if (quantity <= 20) return { label: "In Stock", color: "bg-blue-100 text-blue-800" };
    return { label: "Well Stocked", color: "bg-green-100 text-green-800" };
  };

  const stockStatus = getStockStatus(product.stockQuantity);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </CardTitle>
          <Badge className={stockStatus.color}>
            {stockStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Stock:</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="w-20 h-8"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateStockMutation.isPending}
                  className="h-8 px-2"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{product.stockQuantity} units</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {product.stockQuantity <= 5 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-yellow-600">
                  {product.stockQuantity === 0 
                    ? "This product is out of stock and won't appear in search results."
                    : "Consider restocking this product soon to avoid running out."
                  }
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Last updated: {new Date(product.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}