import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const paymentStats = {
    totalVolume: 245670.50,
    totalTransactions: 1847,
    successRate: 98.3,
    avgTransactionValue: 133.12,
    monthlyGrowth: 12.4,
    pendingPayouts: 18650.75
  };

  const recentTransactions = [
    {
      id: 'pi_1234567890',
      amount: 89.99,
      currency: 'USD',
      status: 'succeeded',
      customer: 'john.doe@email.com',
      seller: 'Mountain View Roasters',
      created: '2025-01-11T18:30:00Z',
      fees: 2.89,
      net: 87.10
    },
    {
      id: 'pi_1234567891',
      amount: 156.50,
      currency: 'USD',
      status: 'succeeded',
      customer: 'sarah.smith@email.com',
      seller: 'Artisan Coffee Co.',
      created: '2025-01-11T17:45:00Z',
      fees: 4.85,
      net: 151.65
    },
    {
      id: 'pi_1234567892',
      amount: 67.25,
      currency: 'USD',
      status: 'requires_action',
      customer: 'mike.johnson@email.com',
      seller: 'Highland Beans',
      created: '2025-01-11T16:20:00Z',
      fees: 2.25,
      net: 65.00
    }
  ];

  const stripeAccounts = [
    {
      id: 'acct_1234567890',
      email: 'mountain.view.roasters@email.com',
      businessName: 'Mountain View Roasters',
      status: 'active',
      created: '2024-12-15',
      balance: 1245.60,
      pendingBalance: 345.20
    },
    {
      id: 'acct_1234567891',
      email: 'artisan.coffee@email.com',
      businessName: 'Artisan Coffee Co.',
      status: 'active',
      created: '2024-11-22',
      balance: 2876.45,
      pendingBalance: 567.80
    },
    {
      id: 'acct_1234567892',
      email: 'highland.beans@email.com',
      businessName: 'Highland Beans',
      status: 'restricted',
      created: '2025-01-05',
      balance: 89.30,
      pendingBalance: 0.00
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires_action':
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Manage Stripe payments, accounts, and transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{paymentStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.successRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.avgTransactionValue}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.pendingPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payout
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment activity across the platform</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${transaction.amount}</span>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.customer} → {transaction.seller}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.created).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Net: ${transaction.net}</div>
                    <div className="text-gray-500">Fee: ${transaction.fees}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect Accounts</CardTitle>
          <CardDescription>Manage seller payment accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stripeAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{account.businessName}</span>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">{account.email}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(account.created).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Balance: ${account.balance}</div>
                    <div className="text-gray-500">Pending: ${account.pendingBalance}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {account.status === 'restricted' && (
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;