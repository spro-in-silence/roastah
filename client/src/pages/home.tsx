import { useQuery } from "@tanstack/react-query";
import { useQueryWithLoading } from "@/hooks/use-query-with-loading";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { useUser } from "@/contexts/UserContext";
import { Product } from "@/lib/types";

export default function Home() {
  const { isRoaster } = useUser();

  const { data: featuredProducts = [] } = useQueryWithLoading({
    queryKey: ["/api/products"],
  });

  // Show only first 4 products as featured
  const limitedProducts = featuredProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-96 lg:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Discover Exceptional Coffee</h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200">
              Connect directly with passionate micro-roasters and home roasters crafting the perfect cup
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-roastah-yellow text-gray-900 hover:bg-yellow-500 font-semibold">
                  Shop Coffee
                </Button>
              </Link>
              {!isRoaster && (
                <Link to="/become-roastah">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold"
                  >
                    Become a Roastah
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Explore by Roast</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/products?roastLevel=light" className="group cursor-pointer">
              <div
                className="bg-cover bg-center h-64 rounded-xl mb-4 group-hover:scale-105 transition-transform"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end p-6">
                  <h3 className="text-white text-xl font-semibold">Light Roast</h3>
                </div>
              </div>
              <p className="text-roastah-warm-gray">Bright, acidic, and full of origin flavors</p>
            </Link>

            <Link to="/products?roastLevel=medium" className="group cursor-pointer">
              <div
                className="bg-cover bg-center h-64 rounded-xl mb-4 group-hover:scale-105 transition-transform"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end p-6">
                  <h3 className="text-white text-xl font-semibold">Medium Roast</h3>
                </div>
              </div>
              <p className="text-roastah-warm-gray">Balanced sweetness and body</p>
            </Link>

            <Link to="/products?roastLevel=dark" className="group cursor-pointer">
              <div
                className="bg-cover bg-center h-64 rounded-xl mb-4 group-hover:scale-105 transition-transform"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              >
                <div className="h-full bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end p-6">
                  <h3 className="text-white text-xl font-semibold">Dark Roast</h3>
                </div>
              </div>
              <p className="text-roastah-warm-gray">Bold, smoky, with caramelized notes</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Coffee</h2>
            <Link to="/products">
              <Button variant="ghost" className="text-roastah-teal hover:text-roastah-dark-teal font-semibold">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {limitedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {limitedProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-roastah-warm-gray text-lg">No products available at the moment.</p>
              {isRoaster && (
                <Link to="/seller/products/new" className="mt-4 inline-block">
                  <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
