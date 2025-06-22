import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Product } from "@/lib/types";

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    roastLevel: [] as string[],
    origin: [] as string[],
    priceRange: "",
  });
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL search params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const roastLevelParam = urlParams.get('roastLevel');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get unique origins and roast levels for filter options
  const availableOrigins = products ? [...new Set(products.map((p: Product) => p.origin))].filter(Boolean) : [];
  const availableRoastLevels = products ? [...new Set(products.map((p: Product) => p.roastLevel))].filter(Boolean) : [];

  const handleRoastLevelChange = (roastLevel: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      roastLevel: checked
        ? [...prev.roastLevel, roastLevel]
        : prev.roastLevel.filter(level => level !== roastLevel)
    }));
  };

  const handleOriginChange = (origin: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      origin: checked
        ? [...prev.origin, origin]
        : prev.origin.filter(o => o !== origin)
    }));
  };

  // Filter and search products
  let filteredProducts = products || [];

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter((product: Product) =>
      product.name.toLowerCase().includes(query) ||
      product.origin.toLowerCase().includes(query) ||
      product.tastingNotes.toLowerCase().includes(query) ||
      product.roastLevel.toLowerCase().includes(query)
    );
  }

  if (roastLevelParam) {
    filteredProducts = filteredProducts.filter((product: Product) =>
      product.roastLevel.toLowerCase() === roastLevelParam.toLowerCase()
    );
  }

  if (filters.roastLevel.length > 0) {
    filteredProducts = filteredProducts.filter((product: Product) =>
      filters.roastLevel.some(level => 
        product.roastLevel.toLowerCase().includes(level.toLowerCase())
      )
    );
  }

  if (filters.origin.length > 0) {
    filteredProducts = filteredProducts.filter((product: Product) =>
      filters.origin.some(origin => 
        product.origin?.toLowerCase().includes(origin.toLowerCase())
      )
    );
  }

  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange === "under-15" 
      ? [0, 15]
      : filters.priceRange === "15-20"
      ? [15, 20]
      : [20, 1000];
    
    filteredProducts = filteredProducts.filter((product: Product) => {
      const price = parseFloat(product.price);
      return price >= minPrice && (maxPrice === 1000 || price <= maxPrice);
    });
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Roast Level */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Roast Level</h4>
                <div className="space-y-2">
                  {["light", "medium", "dark"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={filters.roastLevel.includes(level)}
                        onCheckedChange={(checked) => handleRoastLevelChange(level, checked as boolean)}
                      />
                      <Label htmlFor={level} className="text-sm capitalize">
                        {level} Roast
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Origin */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Origin</h4>
                <div className="space-y-2">
                  {["Ethiopia", "Guatemala", "Colombia", "Costa Rica", "Brazil", "Kenya"].map((origin) => (
                    <div key={origin} className="flex items-center space-x-2">
                      <Checkbox
                        id={origin.toLowerCase()}
                        checked={filters.origin.includes(origin)}
                        onCheckedChange={(checked) => handleOriginChange(origin, checked as boolean)}
                      />
                      <Label htmlFor={origin.toLowerCase()} className="text-sm">
                        {origin}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <RadioGroup value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="under-15" id="under-15" />
                    <Label htmlFor="under-15" className="text-sm">Under $15</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15-20" id="15-20" />
                    <Label htmlFor="15-20" className="text-sm">$15 - $20</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="20-plus" id="20-plus" />
                    <Label htmlFor="20-plus" className="text-sm">$20+</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search coffee by name, origin, tasting notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border-gray-300 rounded-lg focus:ring-roastah-teal focus:border-roastah-teal"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {roastLevelParam ? `${roastLevelParam.charAt(0).toUpperCase() + roastLevelParam.slice(1)} Roast Coffee` : 'All Coffee'}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Sort by: Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-roastah-warm-gray text-lg">No products found matching your criteria.</p>
                <p className="text-roastah-warm-gray text-sm mt-2">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
