import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [grindSize, setGrindSize] = useState("whole_bean");
  const [showOptions, setShowOptions] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, grindSize }: { productId: number; quantity: number; grindSize: string }) => {
      await apiRequest("POST", "/api/cart", {
        productId,
        quantity,
        grindSize,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${quantity} × ${product.name} (${grindSize.replace('_', ' ')}) added to cart.`,
      });
      setShowOptions(false);
      setQuantity(1);
      setGrindSize("whole_bean");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity: 1, grindSize: "whole_bean" });
  };

  const handleCustomAdd = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity, grindSize });
  };

  const roastLevelColors = {
    light: "bg-yellow-100 text-yellow-800",
    "medium-light": "bg-orange-100 text-orange-800",
    medium: "bg-amber-100 text-amber-800",
    "medium-dark": "bg-red-100 text-red-800",
    dark: "bg-gray-100 text-gray-800",
  };

  const defaultColor = "bg-gray-100 text-gray-800";
  const roastLevelClass = roastLevelColors[product.roastLevel.toLowerCase() as keyof typeof roastLevelColors] || defaultColor;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&fit=crop&w=400&h=400"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={roastLevelClass}>
            {product.roastLevel}
          </Badge>
          <div className="flex items-center text-sm text-roastah-warm-gray">
            <Star className="h-4 w-4 fill-current text-roastah-yellow mr-1" />
            <span>4.8 (124)</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-roastah-teal transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-roastah-warm-gray mb-2 line-clamp-2">
          {product.origin} • {product.tastingNotes}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <span className="text-sm text-roastah-warm-gray">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleQuickAdd}
            disabled={product.stockQuantity === 0 || addToCartMutation.isPending}
            className="flex-1 bg-roastah-teal text-white hover:bg-roastah-dark-teal disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stockQuantity === 0 ? 'Out of Stock' : 'Quick Add'}
          </Button>
          
          <Popover open={showOptions} onOpenChange={setShowOptions}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={product.stockQuantity === 0}
                className="px-3 border-roastah-teal text-roastah-teal hover:bg-roastah-teal hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Customize Order</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Grind Size</label>
                  <Select value={grindSize} onValueChange={setGrindSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whole_bean">Whole Bean</SelectItem>
                      <SelectItem value="coarse">Coarse Grind</SelectItem>
                      <SelectItem value="medium_coarse">Medium-Coarse</SelectItem>
                      <SelectItem value="medium">Medium Grind</SelectItem>
                      <SelectItem value="medium_fine">Medium-Fine</SelectItem>
                      <SelectItem value="fine">Fine Grind</SelectItem>
                      <SelectItem value="extra_fine">Extra Fine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCustomAdd}
                  disabled={addToCartMutation.isPending}
                  className="w-full bg-roastah-teal text-white hover:bg-roastah-dark-teal"
                >
                  Add {quantity} to Cart
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
