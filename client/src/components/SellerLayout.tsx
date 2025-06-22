import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SellerLayout() {
  return (
    <ProtectedRoute requireAuth requireRoaster>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}