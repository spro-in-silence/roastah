import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/contexts/loading-context";
import Navbar from "@/components/layout/navbar";
import { useQueryWithLoading, useMutationWithLoading } from "@/hooks/use-query-with-loading";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function LoadingDemo() {
  const { showLoader, hideLoader } = useLoading();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Demo query with global loading
  const { data: products, refetch: refetchProducts } = useQueryWithLoading({
    queryKey: ["/api/products"],
    enabled: false, // Don't auto-fetch
  });

  // Demo mutation with global loading
  const testMutation = useMutationWithLoading({
    mutationFn: async () => {
      // Simulate a slow operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      console.log("Test mutation completed");
    },
  });

  const startManualLoading = () => {
    const id = `manual-${Date.now()}`;
    setLoadingId(id);
    showLoader(id);
  };

  const stopManualLoading = () => {
    if (loadingId) {
      hideLoader(loadingId);
      setLoadingId(null);
    }
  };

  const startSlowQuery = () => {
    refetchProducts();
  };

  const startSlowMutation = () => {
    testMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Global Loading System Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual Loading Control */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Loading Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Manually trigger the global loading indicator with the coffee roaster animation.
              </p>
              <div className="flex gap-2">
                <Button onClick={startManualLoading} disabled={!!loadingId}>
                  Start Loading
                </Button>
                <Button 
                  onClick={stopManualLoading} 
                  disabled={!loadingId}
                  variant="outline"
                >
                  Stop Loading
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Automatic Query Loading */}
          <Card>
            <CardHeader>
              <CardTitle>Automatic Query Loading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Queries that take longer than 500ms will automatically show the loading indicator.
              </p>
              <Button onClick={startSlowQuery}>
                Trigger Slow Query
              </Button>
              {products && (
                <p className="text-sm text-green-600">
                  Query completed! Found {products.length} products.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Automatic Mutation Loading */}
          <Card>
            <CardHeader>
              <CardTitle>Automatic Mutation Loading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Mutations that take longer than 500ms will automatically show the loading indicator.
              </p>
              <Button 
                onClick={startSlowMutation}
                disabled={testMutation.isPending}
              >
                {testMutation.isPending ? "Processing..." : "Trigger Slow Mutation"}
              </Button>
              {testMutation.isSuccess && (
                <p className="text-sm text-green-600">
                  Mutation completed successfully!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Global loading context manages all loading states</p>
                <p>• 500ms delay prevents flash for quick operations</p>
                <p>• Coffee roaster animation appears in modal overlay</p>
                <p>• Automatic integration with React Query</p>
                <p>• Manual control for custom operations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}