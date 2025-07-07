import { Button } from "@/components/ui/button";
import { Coffee, Store, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="coffee-gradient text-white rounded-lg p-2 mr-3">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Roastah</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/products" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Browse Coffee
              </Link>
              <Link to="/leaderboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Top Roasters
              </Link>
              <Button
                onClick={() => window.location.href = '/auth'}
                size="sm"
                className="bg-roastah-yellow text-gray-900 hover:bg-yellow-500"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
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
            <div className="flex items-center mb-6">
              <div className="coffee-gradient text-white rounded-lg p-3 mr-4">
                <Coffee className="h-8 w-8" />
              </div>
              <span className="text-3xl font-bold">Roastah</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Discover Exceptional Coffee</h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200">
              Connect directly with passionate micro-roasters and home roasters crafting the perfect cup
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.location.href = '/auth'}
                size="lg"
                className="bg-roastah-yellow text-gray-900 hover:bg-yellow-500 font-semibold"
              >
                Sign In to Shop Coffee
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Roastah?</h2>
            <p className="text-xl text-roastah-warm-gray max-w-2xl mx-auto">
              Join our community of coffee enthusiasts and discover amazing roasters from around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-roastah-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-roastah-yellow" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-roastah-warm-gray">
                Every roaster on our platform is carefully vetted to ensure you get the highest quality coffee beans
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-roastah-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-roastah-teal" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct from Roasters</h3>
              <p className="text-roastah-warm-gray">
                Connect directly with passionate roasters and learn the story behind every cup of coffee
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-roastah-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-roastah-yellow" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Support Small Business</h3>
              <p className="text-roastah-warm-gray">
                Every purchase supports independent roasters and helps grow the specialty coffee community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Roaster CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="coffee-gradient rounded-xl p-8 text-white">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Are You a Coffee Roaster?</h2>
            <p className="text-xl mb-6 text-white/90">
              Join our marketplace and share your passion for coffee with enthusiasts worldwide
            </p>
            <Button
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-white text-roastah-teal hover:bg-gray-100 font-semibold"
            >
              Become a Roastah
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="coffee-gradient text-white rounded-lg p-2 mr-3">
              <Coffee className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Roastah</span>
          </div>
          <p className="text-gray-400 mb-4">Connecting coffee lovers with passionate roasters worldwide.</p>
          <p className="text-gray-500">&copy; 2024 Roastah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
