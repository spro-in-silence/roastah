import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useConfig } from "@/hooks/useConfig";
import { apiRequest } from "@/lib/queryClient";

// Stripe will be loaded dynamically from the backend configuration
let stripePromise: Promise<any> | null = null;

function loadStripeFromConfig(publicKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publicKey).catch((error) => {
      console.error('Failed to load Stripe.js:', error);
      return null;
    });
  }
  return stripePromise;
}

function TestPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Stripe is not loaded properly",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Test payment completed!",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Payment Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PaymentElement />
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Pay $10.00"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestPayment() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const { config, loading: configLoading, error: configError } = useConfig();

  const createTestPayment = async () => {
    try {
      const data = await apiRequest("POST", "/api/create-payment-intent", { 
        amount: 10.00 
      });
      setClientSecret(data.clientSecret);
      toast({
        title: "Payment Intent Created",
        description: "Ready to test payment",
      });
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to create payment intent",
        variant: "destructive",
      });
    }
  };

  // Show loading state while configuration is loading
  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Payment System Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full" />
                <span className="ml-3">Loading configuration...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if configuration failed to load
  if (configError || !config?.stripe?.publicKey) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                {configError || 'Payment configuration is not available.'}
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Payment System Test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={createTestPayment} className="w-full">
                Create Test Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Load Stripe with the public key from configuration
  const stripePromise = loadStripeFromConfig(config.stripe.publicKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <TestPaymentForm />
    </Elements>
  );
}