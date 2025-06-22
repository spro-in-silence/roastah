import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="coffee-gradient text-white rounded-lg p-2 mr-3">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Roastah</span>
            </div>
            <p className="text-gray-400">Connecting coffee lovers with passionate roasters worldwide.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Coffee
                </Link>
              </li>
              <li>
                <Link href="/products?roastLevel=light" className="hover:text-white transition-colors">
                  Light Roast
                </Link>
              </li>
              <li>
                <Link href="/products?roastLevel=medium" className="hover:text-white transition-colors">
                  Medium Roast
                </Link>
              </li>
              <li>
                <Link href="/products?roastLevel=dark" className="hover:text-white transition-colors">
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
                <Link href="/become-roastah" className="hover:text-white transition-colors">
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
