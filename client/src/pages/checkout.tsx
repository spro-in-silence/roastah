import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { MapPin, Plus } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useConfig } from "@/hooks/useConfig";
import { Address, CartItem, User } from "@/lib/types";

// Stripe will be loaded dynamically from the backend configuration
let stripePromise: Promise<any> | null = null;

function loadStripeFromConfig(publicKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publicKey, {
      betas: ['process_order_beta_1']
    }).catch((error) => {
      console.error('Failed to load Stripe.js:', error);
      return null;
    });
  }
  return stripePromise;
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" }
];

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  phone: z.string().min(10, "Phone number is required"),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface ShippingAddress {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

// AddressForm component
interface AddressFormProps {
  form: any;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

function AddressForm({ form, onSubmit, onCancel, isLoading = false }: AddressFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="123 Coffee Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2 (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Apartment, suite, unit, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deliveryInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special delivery instructions..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default address</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : 'Save Address'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Address form for new address
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      isDefault: false,
    },
  });

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  // Query for all shipping addresses
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery<ShippingAddress[]>({
    queryKey: ["/api/shipping/addresses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/shipping/addresses");
      return response.json();
    },
  });

  // Find default address and set it as selected
  const defaultAddress = addresses.find((addr: ShippingAddress) => addr.isDefault);
  const selectedAddress = selectedAddressId 
    ? addresses.find(addr => addr.id === selectedAddressId)
    : defaultAddress;

  // Set initial selected address to default
  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress, selectedAddressId]);

  // Mutation for creating new address
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: AddressFormData) => {
      const response = await apiRequest("POST", "/api/shipping/addresses", addressData);
      return response.json();
    },
    onSuccess: (newAddress) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping/addresses"] });
      setSelectedAddressId(newAddress.id);
      setShowNewAddressForm(false);
      addressForm.reset();
      toast({
        title: "Address Added",
        description: "Your new address has been saved and selected for delivery.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add address",
        variant: "destructive",
      });
    },
  });

  const subtotal = (cartItems as CartItem[]).reduce((sum: number, item: CartItem) => {
    return sum + (parseFloat(item.product?.price || "0") * item.quantity);
  }, 0);

  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setShowNewAddressForm(true);
    } else {
      setSelectedAddressId(parseInt(addressId));
      setShowNewAddressForm(false);
    }
  };

  // Handle new address form submission
  const handleAddAddress = (data: AddressFormData) => {
    createAddressMutation.mutate(data);
  };

  const onSubmit = async (data: any) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
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
          description: "Thank you for your purchase!",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {addresses.length > 0 ? "Delivering to" : "Shipping Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-roastah-teal border-t-transparent rounded-full"></div>
                      <span className="ml-2 text-gray-600">Loading addresses...</span>
                    </div>
                  ) : addresses.length > 0 && !showNewAddressForm ? (
                    // Show address dropdown when addresses exist
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address-select">Select delivery address</Label>
                        <Select
                          value={selectedAddressId?.toString() || ""}
                          onValueChange={handleAddressSelect}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id.toString()}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {address.firstName} {address.lastName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {address.addressLine1}
                                      {address.addressLine2 && `, ${address.addressLine2}`}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {address.city}, {address.state} {address.zipCode}
                                    </div>
                                  </div>
                                  {address.isDefault && (
                                    <span className="text-xs bg-roastah-teal text-white px-2 py-1 rounded ml-2">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="new">
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Ship to a new address
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedAddress && (
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-roastah-teal" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedAddress.firstName} {selectedAddress.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {selectedAddress.addressLine1}
                                {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                              </p>
                              {selectedAddress.deliveryInstructions && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Instructions: {selectedAddress.deliveryInstructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show new address form
                    <div className="space-y-4">
                      {addresses.length > 0 && (
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Add New Address</h3>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowNewAddressForm(false)}
                          >
                            Back to Address List
                          </Button>
                        </div>
                      )}
                      <AddressForm
                        form={addressForm}
                        onSubmit={handleAddAddress}
                        onCancel={addresses.length > 0 ? () => setShowNewAddressForm(false) : undefined}
                        isLoading={createAddressMutation.isPending}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentElement 
                    options={{
                      layout: {
                        type: 'tabs',
                        defaultCollapsed: false,
                      },
                      wallets: {
                        applePay: 'auto',
                        googlePay: 'auto',
                      },
                      paymentMethodOrder: ['card', 'paypal', 'amazon_pay'],
                      fields: {
                        billingDetails: 'auto',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {(cartItems as CartItem[]).map((item: CartItem) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&fit=crop&w=60&h=60"}
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6"
                    disabled={isProcessing || (!selectedAddress && addresses.length > 0)}
                  >
                    {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { data: config } = useConfig();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { amount: 100 }) // Placeholder amount
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      });
  }, []);

  if (!config?.stripe?.publicKey) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Preparing payment...</p>
        </div>
      </div>
    );
  }

  const stripePromise = loadStripeFromConfig(config.stripe.publicKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}