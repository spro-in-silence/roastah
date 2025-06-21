import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Test Stripe loading
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('VITE_STRIPE_PUBLIC_KEY is missing');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <TestPaymentForm />
    </Elements>
  );
}