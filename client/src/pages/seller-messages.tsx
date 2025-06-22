import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSellerMessageSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send, Users, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

// Form schema for message creation
const messageFormSchema = insertSellerMessageSchema.extend({
  subjectId: z.string().min(1, "Please select a message subject"),
  title: z.string().min(1, "Message title is required").max(200, "Title must be under 200 characters"),
  content: z.string().min(10, "Message content must be at least 10 characters").max(5000, "Content must be under 5000 characters"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export default function SellerMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Fetch message subjects
  const { data: subjects = [] } = useQuery<any[]>({
    queryKey: ["/api/message-subjects"],
  });

  // Fetch seller's sent messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/seller/messages"],
  });

  // Form setup
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subjectId: "",
      title: "",
      content: "",
    },
  });

  // Message creation mutation
  const createMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const response = await apiRequest("POST", "/api/seller/messages", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Message Published Successfully",
        description: `Your message has been sent to ${data.recipientsCount} customers. ${data.note || ""}`,
      });
      
      // Reset form
      form.reset();
      
      // Refresh messages list
      queryClient.invalidateQueries({ queryKey: ["/api/seller/messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "There was an error publishing your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MessageFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    createMessageMutation.mutate(data);
  };

  // Add debugging for form state
  console.log("Form validation state:", {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    values: form.getValues()
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Customer Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send updates and announcements to customers who have favorited your products or made purchases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Message Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose New Message
            </CardTitle>
            <CardDescription>
              Create a message to send to your customers. Only customers who have favorited your products or made purchases will receive it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a message category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject: any) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a compelling title for your message"
                          {...field}
                          maxLength={200}
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 text-right">
                        {field.value?.length || 0}/200
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your message content here. This will be sent to customers who have favorited your products or made purchases from you."
                          className="min-h-[200px]"
                          {...field}
                          maxLength={5000}
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 text-right">
                        {field.value?.length || 0}/5000
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMessageMutation.isPending}
                >
                  {createMessageMutation.isPending ? (
                    "Publishing Message..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sent Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sent Messages
            </CardTitle>
            <CardDescription>
              View your previously sent customer messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages sent yet</p>
                <p className="text-sm">Create your first customer message using the form</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? "border-[#8B4513] bg-[#8B4513]/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {message.subjectName}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(message.publishedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {message.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {message.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {message.recipientCount || 0} recipients
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message Details Modal/Panel */}
      {selectedMessage && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Message Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline">{selectedMessage.subjectName}</Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Published: {format(new Date(selectedMessage.publishedAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedMessage.title}</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedMessage.recipientCount || 0} customers notified
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Message delivered successfully
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}