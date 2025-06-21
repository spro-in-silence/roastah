import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Star, TrendingUp, MapPin, Calendar, Award, Coffee, Target } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

interface LeaderboardEntry {
  id: number;
  userId: string;
  businessName: string;
  description: string;
  city: string;
  state: string;
  createdAt: string;
  averageRating: string;
  totalReviews: number;
  totalSales: number;
  totalRevenue: string;
  responseTime: string;
  completionRate: string;
  leaderboardScore: string;
  profileImageUrl: string;
  rank: number;
}

const dateRangeOptions = [
  { value: 'week', label: 'Last Week', icon: Calendar },
  { value: 'month', label: 'Last Month', icon: Calendar },
  { value: 'quarter', label: 'Last Quarter', icon: TrendingUp },
  { value: '6m', label: 'Last 6 Months', icon: TrendingUp },
  { value: 'year', label: 'Last Year', icon: TrendingUp },
  { value: '3year', label: 'Last 3 Years', icon: Target },
  { value: '5year', label: 'Last 5 Years', icon: Target },
  { value: 'all', label: 'All Time', icon: Award },
];

const rankingTiers = [
  { rank: 1, title: 'Champion Roastah', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: '🏆' },
  { rank: 2, title: 'Master Roastah', color: 'bg-gradient-to-r from-gray-300 to-gray-500', icon: '🥈' },
  { rank: 3, title: 'Expert Roastah', color: 'bg-gradient-to-r from-amber-600 to-amber-800', icon: '🥉' },
];

export default function Leaderboard() {
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [limit, setLimit] = useState(10);

  const { data: leaderboard, isLoading, refetch } = useQuery({
    queryKey: ['/api/leaderboard', selectedDateRange, limit],
    queryFn: () => 
      fetch(`/api/leaderboard?dateRange=${selectedDateRange}&limit=${limit}`)
        .then(res => res.json()) as Promise<LeaderboardEntry[]>,
  });

  const getRankingTier = (rank: number) => {
    return rankingTiers.find(tier => tier.rank === rank);
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Roastah Leaderboard</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the top coffee roasters based on customer reviews, sales performance, 
            and overall quality excellence
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-500" />
                <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="25">Top 25</SelectItem>
                    <SelectItem value="50">Top 50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={() => refetch()} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Rankings
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse flex items-center space-x-4">
                    <div className="rounded-full bg-gray-300 h-16 w-16"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Leaderboard Results */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="space-y-4">
            {leaderboard.map((roaster) => {
              const tier = getRankingTier(roaster.rank);
              const score = parseFloat(roaster.leaderboardScore);
              
              return (
                <Card key={roaster.id} className={`overflow-hidden transition-all hover:shadow-lg ${
                  roaster.rank <= 3 ? 'ring-2 ring-yellow-200' : ''
                }`}>
                  <CardContent className="p-0">
                    <div className="flex items-center p-6">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0 mr-6">
                        {tier ? (
                          <div className={`${tier.color} text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg`}>
                            {tier.icon}
                          </div>
                        ) : (
                          <div className="bg-gray-200 text-gray-700 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
                            #{roaster.rank}
                          </div>
                        )}
                      </div>

                      {/* Roaster Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={roaster.profileImageUrl} alt={roaster.businessName} />
                              <AvatarFallback>
                                {roaster.businessName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 truncate">
                                {roaster.businessName}
                              </h3>
                              
                              {tier && (
                                <Badge variant="secondary" className="mt-1">
                                  {tier.title}
                                </Badge>
                              )}
                              
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                {roaster.city && roaster.state ? (
                                  `${roaster.city}, ${roaster.state}`
                                ) : (
                                  'Location not specified'
                                )}
                                <span className="mx-2">•</span>
                                <Coffee className="h-4 w-4 mr-1" />
                                Since {formatDate(roaster.createdAt)}
                              </div>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                            {score.toFixed(1)} pts
                          </div>
                        </div>

                        {/* Description */}
                        {roaster.description && (
                          <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                            {roaster.description}
                          </p>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-lg font-semibold text-gray-900">
                                {parseFloat(roaster.averageRating).toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {roaster.totalReviews} reviews
                            </p>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {roaster.totalSales}
                            </div>
                            <p className="text-xs text-gray-500">Sales</p>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(roaster.totalRevenue)}
                            </div>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {parseFloat(roaster.completionRate).toFixed(0)}%
                            </div>
                            <p className="text-xs text-gray-500">Completion</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {leaderboard && leaderboard.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No rankings available
              </h3>
              <p className="text-gray-500">
                No roasters found for the selected time period. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ranking Methodology */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              How Rankings Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Rating Quality</h4>
                <p className="text-sm text-gray-600">40% - Average customer rating</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Review Volume</h4>
                <p className="text-sm text-gray-600">30% - Total number of reviews</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Coffee className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Sales Activity</h4>
                <p className="text-sm text-gray-600">20% - Recent sales performance</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold mb-2">Reliability</h4>
                <p className="text-sm text-gray-600">10% - Order completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}