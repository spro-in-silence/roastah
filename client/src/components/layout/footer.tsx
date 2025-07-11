import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
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
                <span className="text-xl font-bold text-white">
                  <span className="text-yellow-400 italic">α</span>
                  <span className="text-gray-400">-</span>
                  <span className="font-roastah">roastah</span>
                </span>
                <span className="text-xs text-roastah-teal font-medium -mt-1">Experimental Alpha Release</span>
              </div>
            </div>
            <p className="text-gray-400">Connecting coffee lovers with passionate roasters worldwide.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Coffee
                </Link>
              </li>
              <li>
                <Link to="/products?roastLevel=light" className="hover:text-white transition-colors">
                  Light Roast
                </Link>
              </li>
              <li>
                <Link to="/products?roastLevel=medium" className="hover:text-white transition-colors">
                  Medium Roast
                </Link>
              </li>
              <li>
                <Link to="/products?roastLevel=dark" className="hover:text-white transition-colors">
                  Dark Roast
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Sell</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/become-roastah" className="hover:text-white transition-colors">
                  Become a Roastah
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Seller Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Roastah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
