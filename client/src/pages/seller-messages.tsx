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

  // Form setup
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subjectId: "",
      title: "",
      content: "",
    },
  });

  // Fetch message subjects
  const { data: messageSubjects = [] } = useQuery({
    queryKey: ['/api/message-subjects'],
  });

  // Fetch sent messages
  const { data: sentMessages = [] } = useQuery({
    queryKey: ['/api/seller/messages'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const response = await apiRequest('/api/seller/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/messages'] });
      form.reset();
      toast({
        title: "Message Sent",
        description: "Your message has been sent to customers successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  // Debug form state
  console.log("Form validation state:", {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    values: form.getValues()
  });

  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Messages</h1>
        <p className="text-gray-600">Send updates and announcements to customers who have favorited your products or made purchases.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
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
                      <FormLabel>Message Subject Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a message category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {messageSubjects.map((subject: any) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{subject.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {subject.description}
                                </Badge>
                              </div>
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
                        <Input placeholder="Enter a compelling title for your message" {...field} />
                      </FormControl>
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
                          placeholder="Write your message content here..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={sendMessageMutation.isPending}
                  className="w-full"
                >
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Message Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Message Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Messages Sent</span>
              <Badge variant="outline">{sentMessages.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">This Month</span>
              <Badge variant="outline">
                {sentMessages.filter((msg: any) => {
                  const msgDate = new Date(msg.createdAt);
                  const now = new Date();
                  return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
                }).length}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Tips</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Use clear, engaging subject lines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Keep messages concise and valuable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Include specific product information when relevant</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sent Messages History */}
      {sentMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentMessages.slice(0, 10).map((message: any) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{message.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(message.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{message.content}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {messageSubjects.find((s: any) => s.id === message.subjectId)?.name || 'General'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Sent to customers who favorited your products
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}