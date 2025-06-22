import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Gift, Calendar, Mail, Phone, CreditCard, Heart, Star, Sparkles, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const giftCardCategories = [
  {
    id: "appreciation",
    name: "Appreciation",
    icon: Heart,
    description: "Show your gratitude with the perfect coffee gift",
    designs: [
      { id: "appreciation-1", name: "Warm Thanks", preview: "🤎 Thank You" },
      { id: "appreciation-2", name: "Golden Gratitude", preview: "💛 Grateful" },
      { id: "appreciation-3", name: "Coffee Hearts", preview: "☕ ❤️ Thanks" },
    ]
  },
  {
    id: "congratulations",
    name: "Congratulations",
    icon: Star,
    description: "Celebrate achievements with specialty coffee",
    designs: [
      { id: "congratulations-1", name: "Success Brew", preview: "⭐ Congrats!" },
      { id: "congratulations-2", name: "Achievement Roast", preview: "🏆 Well Done" },
      { id: "congratulations-3", name: "Victory Cup", preview: "🎉 Success!" },
    ]
  },
  {
    id: "celebration",
    name: "Celebration",
    icon: Sparkles,
    description: "Perfect for birthdays, anniversaries, and special moments",
    designs: [
      { id: "celebration-1", name: "Party Blend", preview: "🎉 Celebrate!" },
      { id: "celebration-2", name: "Festive Roast", preview: "🎈 Party Time" },
      { id: "celebration-3", name: "Joyful Java", preview: "✨ Joy & Coffee" },
    ]
  },
  {
    id: "any-occasion",
    name: "Any Occasion",
    icon: Coffee,
    description: "Versatile designs perfect for any time",
    designs: [
      { id: "any-1", name: "Classic Coffee", preview: "☕ Enjoy!" },
      { id: "any-2", name: "Simple Brew", preview: "🤎 Coffee Time" },
      { id: "any-3", name: "Daily Grind", preview: "☕ Perfect Day" },
    ]
  },
  {
    id: "seasonal",
    name: "Seasonal",
    icon: Calendar,
    description: "Holiday and seasonal themed designs",
    designs: [
      { id: "seasonal-1", name: "Winter Warmth", preview: "❄️ Warm Up" },
      { id: "seasonal-2", name: "Spring Bloom", preview: "🌸 Fresh Start" },
      { id: "seasonal-3", name: "Summer Vibes", preview: "☀️ Iced Coffee" },
      { id: "seasonal-4", name: "Autumn Harvest", preview: "🍂 Cozy Cup" },
    ]
  },
];

const presetAmounts = [25, 50, 75, 100, 150, 200];

const giftCardSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  design: z.string().min(1, "Please select a design"),
  amount: z.string().min(1, "Please select an amount"),
  customAmount: z.string().optional(),
  deliveryMethod: z.enum(["email", "phone"]),
  recipientEmail: z.string().email("Please enter a valid email").optional(),
  recipientPhone: z.string().optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  senderName: z.string().min(1, "Your name is required"),
  message: z.string().max(500, "Message must be 500 characters or less"),
  deliveryDate: z.date(),
}).refine(data => {
  if (data.deliveryMethod === "email" && !data.recipientEmail) {
    return false;
  }
  if (data.deliveryMethod === "phone" && !data.recipientPhone) {
    return false;
  }
  if (data.amount === "custom" && (!data.customAmount || parseFloat(data.customAmount) < 10)) {
    return false;
  }
  return true;
}, {
  message: "Please fill in all required fields",
});

type GiftCardForm = z.infer<typeof giftCardSchema>;

export default function GiftCards() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<GiftCardForm>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      deliveryMethod: "email",
      deliveryDate: new Date(),
      senderName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    },
  });

  const watchDeliveryMethod = watch("deliveryMethod");
  const watchAmount = watch("amount");

  const purchaseGiftCardMutation = useMutation({
    mutationFn: async (data: GiftCardForm) => {
      const finalAmount = data.amount === "custom" ? parseFloat(data.customAmount!) : parseFloat(data.amount);
      
      const giftCardData = {
        category: data.category,
        design: data.design,
        amount: finalAmount.toString(),
        recipientEmail: data.deliveryMethod === "email" ? data.recipientEmail : null,
        recipientPhone: data.deliveryMethod === "phone" ? data.recipientPhone : null,
        recipientName: data.recipientName,
        senderName: data.senderName,
        message: data.message,
        deliveryDate: data.deliveryDate.toISOString(),
      };

      return await apiRequest("POST", "/api/gift-cards", giftCardData);
    },
    onSuccess: () => {
      toast({
        title: "Gift Card Purchased!",
        description: "Your gift card has been created and will be delivered as scheduled.",
      });
      reset();
      setSelectedCategory("");
      setSelectedDesign("");
      setSelectedAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase gift card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GiftCardForm) => {
    purchaseGiftCardMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Gift className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to purchase gift cards.
            </p>
            <Button asChild>
              <a to="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Coffee Gift Cards</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share the perfect cup with friends and family. Choose from beautiful designs and send instantly or schedule for later.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Choose Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {giftCardCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <div
                          key={category.id}
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                            selectedCategory === category.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200"
                          )}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSelectedDesign("");
                            setValue("category", category.id);
                            setValue("design", "");
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <IconComponent className="h-6 w-6 text-orange-500" />
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      );
                    })}
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2">{errors.category.message}</p>
                  )}
                </CardContent>
              </Card>

              {/* Design Selection */}
              {selectedCategory && (
                <Card>
                  <CardHeader>
                    <CardTitle>2. Choose Design</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {giftCardCategories
                        .find(cat => cat.id === selectedCategory)
                        ?.designs.map((design) => (
                          <div
                            key={design.id}
                            className={cn(
                              "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md text-center",
                              selectedDesign === design.id
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            )}
                            onClick={() => {
                              setSelectedDesign(design.id);
                              setValue("design", design.id);
                            }}
                          >
                            <div className="text-2xl mb-2">{design.preview}</div>
                            <h3 className="font-medium text-sm text-gray-900">{design.name}</h3>
                          </div>
                        ))}
                    </div>
                    {errors.design && (
                      <p className="text-red-500 text-sm mt-2">{errors.design.message}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Amount Selection */}
              {selectedDesign && (
                <Card>
                  <CardHeader>
                    <CardTitle>3. Choose Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedAmount === amount.toString() ? "default" : "outline"}
                          onClick={() => {
                            setSelectedAmount(amount.toString());
                            setValue("amount", amount.toString());
                          }}
                          className="h-16"
                        >
                          ${amount}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant={selectedAmount === "custom" ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount("custom");
                          setValue("amount", "custom");
                        }}
                        className="h-16"
                      >
                        Custom
                      </Button>
                    </div>
                    
                    {selectedAmount === "custom" && (
                      <div>
                        <Label htmlFor="customAmount">Custom Amount ($10 minimum)</Label>
                        <Input
                          id="customAmount"
                          type="number"
                          min="10"
                          step="0.01"
                          placeholder="Enter amount"
                          {...register("customAmount")}
                        />
                        {errors.customAmount && (
                          <p className="text-red-500 text-sm mt-1">{errors.customAmount.message}</p>
                        )}
                      </div>
                    )}
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-2">{errors.amount.message}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recipient Information */}
              {selectedAmount && (
                <Card>
                  <CardHeader>
                    <CardTitle>4. Recipient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Delivery Method</Label>
                      <RadioGroup
                        value={watchDeliveryMethod}
                        onValueChange={(value) => setValue("deliveryMethod", value as "email" | "phone")}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" />
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="phone" />
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            SMS/Text
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {watchDeliveryMethod === "email" && (
                      <div>
                        <Label htmlFor="recipientEmail">Recipient Email *</Label>
                        <Input
                          id="recipientEmail"
                          type="email"
                          placeholder="recipient@example.com"
                          {...register("recipientEmail")}
                        />
                        {errors.recipientEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.recipientEmail.message}</p>
                        )}
                      </div>
                    )}

                    {watchDeliveryMethod === "phone" && (
                      <div>
                        <Label htmlFor="recipientPhone">Recipient Phone *</Label>
                        <Input
                          id="recipientPhone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...register("recipientPhone")}
                        />
                        {errors.recipientPhone && (
                          <p className="text-red-500 text-sm mt-1">{errors.recipientPhone.message}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="recipientName">Recipient Name *</Label>
                      <Input
                        id="recipientName"
                        placeholder="John Smith"
                        {...register("recipientName")}
                      />
                      {errors.recipientName && (
                        <p className="text-red-500 text-sm mt-1">{errors.recipientName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="senderName">Your Name *</Label>
                      <Input
                        id="senderName"
                        placeholder="Your name"
                        {...register("senderName")}
                      />
                      {errors.senderName && (
                        <p className="text-red-500 text-sm mt-1">{errors.senderName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a personal touch to your gift..."
                        maxLength={500}
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Delivery Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-2",
                              !deliveryDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={deliveryDate}
                            onSelect={(date) => {
                              if (date) {
                                setDeliveryDate(date);
                                setValue("deliveryDate", date);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.deliveryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliveryDate.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Preview & Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Gift Card Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCategory && selectedDesign && selectedAmount ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-6 rounded-lg text-center">
                          <div className="text-3xl mb-2">
                            {giftCardCategories
                              .find(cat => cat.id === selectedCategory)
                              ?.designs.find(design => design.id === selectedDesign)
                              ?.preview}
                          </div>
                          <h3 className="font-bold text-lg text-gray-900">Roastah Gift Card</h3>
                          <p className="text-2xl font-bold text-orange-600 mt-2">
                            ${watchAmount === "custom" ? watch("customAmount") || "0" : selectedAmount}
                          </p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">
                              {giftCardCategories.find(cat => cat.id === selectedCategory)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Design:</span>
                            <span className="font-medium">
                              {giftCardCategories
                                .find(cat => cat.id === selectedCategory)
                                ?.designs.find(design => design.id === selectedDesign)
                                ?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery:</span>
                            <span className="font-medium">
                              {deliveryDate ? format(deliveryDate, "MMM dd, yyyy") : "Not set"}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={purchaseGiftCardMutation.isPending}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {purchaseGiftCardMutation.isPending ? "Processing..." : "Purchase Gift Card"}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Select options to see preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Gift Card Features</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      <span>Valid for 1 year</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      <span>Works at all partner roasters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      <span>Instant or scheduled delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      <span>No additional fees</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}