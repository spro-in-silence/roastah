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
              <div className="coffee-gradient text-white rounded-lg p-1 mr-3">
                <svg width="35" height="35" viewBox="-25 -50 50 50" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
                  <path 
                    d="M -14 -13 A 50 32 0 0 1 -19 -41 C -16 -45 -14 -45 -10 -44 C -5 -42 0 -37 3 -34 C 6 -30 9 -26 11 -21 C 13 -16 13 -14 7 -11 C 3 -10 -2 -9 -8 -12 C -11 -15 -19 -21 -17 -31 C -14 -41 -7 -36 -7 -36 C -3 -34 3 -30 5 -24 C 6 -19 7 -14 3 -14 C -8 -13 -12 -20 -13 -22 C -15 -25 -16 -34 -9 -34 C -5 -35 1 -24 2 -21 C 4 -17 0 -14 -4 -17 C -13 -22 -14 -36 -7 -28 C -2 -24 -1 -20 -1 -18 C -1 -8 -10 -10 -14 -13" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-900">
                  <span className="text-roastah-teal italic">α</span>
                  <span className="text-gray-500">-</span>
                  <span className="font-roastah">roastah</span>
                </span>
                <span className="text-xs text-yellow-400 font-medium -mt-1">Experimental Alpha Release</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
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

            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Discover Exceptional Coffee</h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200">
              Connect directly with passionate micro-roasters and home roasters crafting the perfect cup
            </p>
            <Link to="/learn-more">
              <Button
                size="lg"
                className="bg-roastah-yellow text-gray-900 hover:bg-yellow-500 font-semibold"
              >
                Learn More
              </Button>
            </Link>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="coffee-gradient rounded-2xl p-10 md:p-12 text-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Are You a Coffee Roaster?</h2>
              <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl mx-auto leading-relaxed">
                Join our marketplace and share your passion for coffee with enthusiasts worldwide
              </p>
              <Button
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="bg-roastah-yellow text-gray-900 hover:bg-yellow-500 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                Become a Roastah
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="coffee-gradient text-white rounded-lg p-1 mr-3">
              <svg width="42" height="42" viewBox="-25 -50 50 50" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
                <path 
                  d="M -14 -13 A 50 32 0 0 1 -19 -41 C -16 -45 -14 -45 -10 -44 C -5 -42 0 -37 3 -34 C 6 -30 9 -26 11 -21 C 13 -16 13 -14 7 -11 C 3 -10 -2 -9 -8 -12 C -11 -15 -19 -21 -17 -31 C -14 -41 -7 -36 -7 -36 C -3 -34 3 -30 5 -24 C 6 -19 7 -14 3 -14 C -8 -13 -12 -20 -13 -22 C -15 -25 -16 -34 -9 -34 C -5 -35 1 -24 2 -21 C 4 -17 0 -14 -4 -17 C -13 -22 -14 -36 -7 -28 C -2 -24 -1 -20 -1 -18 C -1 -8 -10 -10 -14 -13" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-roastah-teal italic">α</span>
              <span className="text-gray-400">-</span>
              <span className="font-roastah">roastah</span>
            </span>
          </div>
          <p className="text-gray-400 mb-4">Connecting coffee lovers with passionate roasters worldwide.</p>
          <p className="text-gray-500">&copy; 2024 Roastah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
