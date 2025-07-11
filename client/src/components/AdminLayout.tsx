import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  Database,
  Monitor,
  Smartphone,
  Building,
  Menu,
  X,
  Coffee
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/system', icon: Monitor, label: 'System Status' },
    { path: '/pwa-settings', icon: Smartphone, label: 'PWA Settings' },
    { path: '/seller/medusa-admin', icon: Building, label: 'E-Commerce Admin' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <Link to="/admin/dashboard" className="flex items-center">
                <div className="bg-purple-600 text-white rounded-lg p-2 mr-3">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">Admin Portal</span>
                  <span className="text-xs text-purple-600 font-medium -mt-1">System Administration</span>
                </div>
              </Link>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Back to Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMenu}></div>
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-purple-600 text-white rounded-lg p-2 mr-3">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Admin Portal</h2>
                    <p className="text-sm text-gray-500">System Administration</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenu}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {menuItems.map(({ path, icon: Icon, label }) => (
                  <Link key={path} to={path} onClick={closeMenu}>
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      isActive(path) ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                    }`}>
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t my-4"></div>

              {/* Quick Actions */}
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</span>
              </div>
              
              <Link to="/dev-login" onClick={closeMenu}>
                <div className="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-gray-700">
                  <Coffee className="h-5 w-5" />
                  <span className="font-medium">Dev Console</span>
                </div>
              </Link>

              <div className="border-t my-4"></div>

              {/* Exit */}
              <div className="mt-4">
                <a 
                  href="/" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <span className="font-medium">Exit Admin Portal</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;