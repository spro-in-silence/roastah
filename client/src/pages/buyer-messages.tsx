import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Calendar, CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function BuyerMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Fetch buyer's messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/buyer/messages"],
  });

  // Fetch unread message count
  const { data: unreadCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ["/api/buyer/messages/unread-count"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest("POST", `/api/buyer/messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      // Refresh messages and unread count
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/messages/unread-count"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark message as read",
        variant: "destructive",
      });
    },
  });

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    
    // Mark as read if not already read
    if (!message.readAt) {
      markAsReadMutation.mutate(message.messageId);
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  if (selectedMessage) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">{selectedMessage.message.subjectName}</Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(selectedMessage.message.publishedAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {selectedMessage.readAt && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Read
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{selectedMessage.message.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From: {selectedMessage.message.sellerName}
                </p>
              </div>
              
              <Separator />
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                  {selectedMessage.message.content}
                </p>
              </div>
              
              <Separator />
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Message delivered on {format(new Date(selectedMessage.createdAt), "MMM d, yyyy 'at' h:mm a")}
                {selectedMessage.readAt && (
                  <span className="ml-4">
                    Read on {format(new Date(selectedMessage.readAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Updates and announcements from your favorite roasters
            </p>
          </div>
          {unreadCount.count > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount.count} new message{unreadCount.count !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Your Messages
          </CardTitle>
          <CardDescription>
            Messages from roasters whose products you've favorited or purchased from
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
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
              <p className="text-sm max-w-md mx-auto">
                Messages from roasters will appear here when you favorite their products or make purchases. 
                Start exploring our marketplace to connect with roasters!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    !message.readAt
                      ? "border-[#8B4513] bg-[#8B4513]/5 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={!message.readAt ? "default" : "outline"} 
                          className="text-xs"
                        >
                          {message.message.subjectName}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(message.message.publishedAt), "MMM d, yyyy")}
                        </span>
                        {!message.readAt && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <h4 className={`font-medium truncate ${
                        !message.readAt 
                          ? "text-gray-900 dark:text-white" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {message.message.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {message.message.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>From: {message.message.sellerName}</span>
                        {message.readAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                    {!message.readAt && (
                      <div className="w-3 h-3 bg-[#8B4513] rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}