import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
        grindSize: "whole_bean",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    addToCartMutation.mutate(product.id);
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
      <Link href={`/products/${product.id}`}>
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

        <Link href={`/products/${product.id}`}>
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

        <Button
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0 || addToCartMutation.isPending}
          className="w-full bg-roastah-teal text-white hover:bg-roastah-dark-teal disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
