import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { Product } from "@/lib/types";

interface ProductRecommendationsProps {
  currentProduct?: Product;
  title?: string;
  limit?: number;
}

export default function ProductRecommendations({ 
  currentProduct, 
  title = "You Might Also Like",
  limit = 4 
}: ProductRecommendationsProps) {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Smart recommendation algorithm
  const getRecommendations = () => {
    if (!products.length) return [];

    let recommendations = products;

    if (currentProduct) {
      // Filter out current product
      recommendations = recommendations.filter(p => p.id !== currentProduct.id);

      // Prioritize similar products
      recommendations = recommendations.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Same origin gets higher score
        if (a.origin === currentProduct.origin) scoreA += 3;
        if (b.origin === currentProduct.origin) scoreB += 3;

        // Same roast level gets score
        if (a.roastLevel === currentProduct.roastLevel) scoreA += 2;
        if (b.roastLevel === currentProduct.roastLevel) scoreB += 2;

        // Similar price range gets score
        const currentPrice = parseFloat(currentProduct.price);
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        
        if (Math.abs(priceA - currentPrice) < 5) scoreA += 1;
        if (Math.abs(priceB - currentPrice) < 5) scoreB += 1;

        return scoreB - scoreA;
      });
    } else {
      // For general recommendations, show highest rated/newest
      recommendations = recommendations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return recommendations.slice(0, limit);
  };

  const recommendedProducts = getRecommendations();

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button variant="ghost" className="text-roastah-teal hover:text-roastah-dark-teal">
          View All
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}