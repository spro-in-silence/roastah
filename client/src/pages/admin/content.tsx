import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Flag, 
  Eye, 
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  MessageSquare,
  Star,
  Clock
} from 'lucide-react';

const AdminContent = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const contentStats = {
    totalProducts: 3456,
    pendingReviews: 23,
    flaggedContent: 8,
    totalReviews: 12847,
    avgRating: 4.3,
    totalReports: 45
  };

  const flaggedContent = [
    {
      id: 'flag_001',
      type: 'product',
      title: 'Premium Coffee Beans - Organic',
      seller: 'Mountain View Roasters',
      reason: 'Misleading description',
      reporter: 'john.doe@email.com',
      status: 'pending',
      created: '2025-01-11T10:30:00Z',
      priority: 'high'
    },
    {
      id: 'flag_002',
      type: 'review',
      title: 'Review for Ethiopian Single Origin',
      reviewer: 'coffee_lover_123',
      reason: 'Inappropriate language',
      reporter: 'system',
      status: 'under_review',
      created: '2025-01-10T16:45:00Z',
      priority: 'medium'
    },
    {
      id: 'flag_003',
      type: 'seller_message',
      title: 'Message from Highland Beans',
      sender: 'Highland Beans',
      reason: 'Spam/promotional',
      reporter: 'sarah.smith@email.com',
      status: 'resolved',
      created: '2025-01-09T14:20:00Z',
      priority: 'low'
    }
  ];

  const pendingReviews = [
    {
      id: 'review_001',
      product: 'Colombian Dark Roast',
      seller: 'Artisan Coffee Co.',
      reviewer: 'mike.johnson@email.com',
      rating: 4,
      content: 'Great coffee, really enjoyed the rich flavor profile. Would definitely order again.',
      created: '2025-01-11T09:15:00Z',
      status: 'pending'
    },
    {
      id: 'review_002',
      product: 'Brazilian Medium Roast',
      seller: 'Highland Beans',
      reviewer: 'emma.wilson@email.com',
      rating: 5,
      content: 'Excellent quality beans, perfect roasting. Fast shipping too!',
      created: '2025-01-11T08:30:00Z',
      status: 'pending'
    },
    {
      id: 'review_003',
      product: 'Costa Rican Light Roast',
      seller: 'Pacific Roasters',
      reviewer: 'david.brown@email.com',
      rating: 3,
      content: 'Good coffee but a bit pricey for the quality. Packaging was nice though.',
      created: '2025-01-10T20:45:00Z',
      status: 'pending'
    }
  ];

  const recentReports = [
    {
      id: 'report_001',
      type: 'product',
      subject: 'False organic certification claim',
      reporter: 'quality_inspector@email.com',
      target: 'Ethiopian Single Origin - Mountain View Roasters',
      severity: 'high',
      status: 'investigating',
      created: '2025-01-11T11:20:00Z'
    },
    {
      id: 'report_002',
      type: 'seller',
      subject: 'Delayed shipping without notification',
      reporter: 'customer_service@email.com',
      target: 'Highland Beans',
      severity: 'medium',
      status: 'pending',
      created: '2025-01-10T15:30:00Z'
    },
    {
      id: 'report_003',
      type: 'review',
      subject: 'Fake positive review',
      reporter: 'fraud_detection@email.com',
      target: 'Review for Colombian Dark Roast',
      severity: 'medium',
      status: 'resolved',
      created: '2025-01-09T13:15:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage products, reviews, and reported content</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {contentStats.pendingReviews} pending reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.flaggedContent}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {contentStats.avgRating} avg rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Content reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Content that requires immediate attention</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search flagged content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flaggedContent.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Flag className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.title}</span>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.type} • {item.reason}
                    </div>
                    <div className="text-xs text-gray-500">
                      Reported by: {item.reporter} • {new Date(item.created).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Reviews awaiting moderation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Approve
                      </Button>
                      <Button variant="outline" size="sm">
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{review.product}</div>
                  <div className="text-xs text-gray-600 mb-2">{review.seller}</div>
                  <div className="text-sm text-gray-700 mb-2">{review.content}</div>
                  <div className="text-xs text-gray-500">
                    By: {review.reviewer} • {new Date(review.created).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Latest content reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{report.subject}</div>
                  <div className="text-xs text-gray-600 mb-2">{report.target}</div>
                  <div className="text-xs text-gray-500">
                    Reported by: {report.reporter} • {new Date(report.created).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContent;