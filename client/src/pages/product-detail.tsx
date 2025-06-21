import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Heart, Truck, Shield, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Product } from "@/lib/types";

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [grindSize, setGrindSize] = useState("whole_bean");

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: parseInt(id!),
        quantity,
        grindSize,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product?.name} has been added to your cart.`,
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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    addToCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-roastah-warm-gray mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const roastLevelColors = {
    light: "bg-yellow-100 text-yellow-800",
    "medium-light": "bg-orange-100 text-orange-800",
    medium: "bg-amber-100 text-amber-800",
    "medium-dark": "bg-red-100 text-red-800",
    dark: "bg-gray-100 text-gray-800",
  };

  const defaultColor = "bg-gray-100 text-gray-800";
  const roastLevelClass = roastLevelColors[product.roastLevel?.toLowerCase() as keyof typeof roastLevelColors] || defaultColor;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-roastah-warm-gray mb-8">
          <a href="/" className="hover:text-roastah-teal">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-roastah-teal">Coffee</a>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-xl mb-4">
              <img
                src={product.images?.[0] || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&fit=crop&w=800&h=800"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg cursor-pointer">
                  <img
                    src={`https://images.unsplash.com/photo-155982726${index}-dc66d52bef19?ixlib=rb-4.0.3&fit=crop&w=200&h=200`}
                    alt={`${product.name} view ${index}`}
                    className="w-full h-full object-cover hover:opacity-75 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center mb-4">
              <Badge className={roastLevelClass}>
                {product.roastLevel}
              </Badge>
              <div className="flex items-center ml-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'fill-current text-roastah-yellow' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-roastah-warm-gray">(124 reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <span className="ml-4 text-sm text-roastah-warm-gray">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Tasting Notes */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Tasting Notes</h3>
                <p className="text-roastah-warm-gray">{product.tastingNotes}</p>
              </CardContent>
            </Card>

            {/* Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="space-y-2 text-sm text-roastah-warm-gray">
                <div className="flex justify-between">
                  <span>Origin:</span>
                  <span>{product.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Process:</span>
                  <span>{product.process}</span>
                </div>
                <div className="flex justify-between">
                  <span>Altitude:</span>
                  <span>{product.altitude}</span>
                </div>
                <div className="flex justify-between">
                  <span>Varietal:</span>
                  <span>{product.varietal}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Grind Size */}
            <div className="mb-6">
              <Label className="block font-medium mb-2">Grind Size</Label>
              <Select value={grindSize} onValueChange={setGrindSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whole_bean">Whole Bean</SelectItem>
                  <SelectItem value="coarse">Coarse (French Press)</SelectItem>
                  <SelectItem value="medium">Medium (Drip)</SelectItem>
                  <SelectItem value="fine">Fine (Espresso)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <Label className="block font-medium mb-2">Quantity</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-roastah-warm-gray">12oz bags</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || addToCartMutation.isPending}
                className="flex-1 bg-roastah-teal text-white hover:bg-roastah-dark-teal"
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="text-sm text-roastah-warm-gray space-y-2">
              <p className="flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Free shipping on orders over $35
              </p>
              <p className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Freshness guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
