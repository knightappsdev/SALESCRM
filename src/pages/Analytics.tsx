import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Phone,
  Mail,
  FileText,
  PenTool,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  sales: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    averageDealSize: number;
    dealVelocity: number;
    conversionRate: number;
  };
  pipeline: {
    totalValue: number;
    activeDeals: number;
    dealsWon: number;
    dealsLost: number;
    winRate: number;
  };
  activities: {
    callsMade: number;
    emailsSent: number;
    meetingsScheduled: number;
    documentsGenerated: number;
    signaturesCompleted: number;
  };
  contacts: {
    totalContacts: number;
    newContacts: number;
    leadConversion: number;
    activeClients: number;
  };
  performance: {
    topPerformers: Array<{
      name: string;
      revenue: number;
      deals: number;
    }>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
    }>;
    dealsByStage: Array<{
      stage: string;
      count: number;
      value: number;
    }>;
  };
}

const Analytics: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sales: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      averageDealSize: 0,
      dealVelocity: 0,
      conversionRate: 0,
    },
    pipeline: {
      totalValue: 0,
      activeDeals: 0,
      dealsWon: 0,
      dealsLost: 0,
      winRate: 0,
    },
    activities: {
      callsMade: 0,
      emailsSent: 0,
      meetingsScheduled: 0,
      documentsGenerated: 0,
      signaturesCompleted: 0,
    },
    contacts: {
      totalContacts: 0,
      newContacts: 0,
      leadConversion: 0,
      activeClients: 0,
    },
    performance: {
      topPerformers: [],
      revenueByMonth: [],
      dealsByStage: [],
    },
  });

  const fetchAnalytics = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // For now, using mock data since backend doesn't return real analytics
        setAnalytics({
          sales: {
            totalRevenue: 847350,
            monthlyRevenue: 125480,
            revenueGrowth: 12.5,
            averageDealSize: 15750,
            dealVelocity: 28,
            conversionRate: 23.4,
          },
          pipeline: {
            totalValue: 2450000,
            activeDeals: 47,
            dealsWon: 32,
            dealsLost: 8,
            winRate: 80.0,
          },
          activities: {
            callsMade: 234,
            emailsSent: 1847,
            meetingsScheduled: 89,
            documentsGenerated: 156,
            signaturesCompleted: 78,
          },
          contacts: {
            totalContacts: 1247,
            newContacts: 89,
            leadConversion: 18.5,
            activeClients: 234,
          },
          performance: {
            topPerformers: [
              { name: 'Sarah Johnson', revenue: 145000, deals: 12 },
              { name: 'Mike Wilson', revenue: 134500, deals: 10 },
              { name: 'Emily Davis', revenue: 128000, deals: 14 },
              { name: 'John Smith', revenue: 115000, deals: 9 },
            ],
            revenueByMonth: [
              { month: 'Jan', revenue: 98000 },
              { month: 'Feb', revenue: 112000 },
              { month: 'Mar', revenue: 125000 },
              { month: 'Apr', revenue: 108000 },
              { month: 'May', revenue: 134000 },
              { month: 'Jun', revenue: 125480 },
            ],
            dealsByStage: [
              { stage: 'New', count: 12, value: 180000 },
              { stage: 'Contacted', count: 8, value: 126000 },
              { stage: 'Qualified', count: 15, value: 367500 },
              { stage: 'Proposal', count: 7, value: 178500 },
              { stage: 'Negotiation', count: 5, value: 125000 },
            ],
          },
        });
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    isPositive, 
    format = 'number' 
  }: {
    title: string;
    value: number;
    icon: any;
    change?: number;
    isPositive?: boolean;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency': return formatCurrency(val);
        case 'percentage': return formatPercentage(val);
        default: return val.toLocaleString();
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
              {change !== undefined && (
                <div className="flex items-center mt-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(Math.abs(change))}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${
              isPositive !== false ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon className={`h-6 w-6 ${
                isPositive !== false ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return <div>Please log in to access analytics.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your sales performance and business metrics</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 Days' : 
                 range === '30d' ? '30 Days' : 
                 range === '90d' ? '90 Days' : '1 Year'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={analytics.sales.totalRevenue}
                icon={DollarSign}
                change={analytics.sales.revenueGrowth}
                isPositive={true}
                format="currency"
              />
              <MetricCard
                title="Active Deals"
                value={analytics.pipeline.activeDeals}
                icon={Target}
                change={8.2}
                isPositive={true}
              />
              <MetricCard
                title="Win Rate"
                value={analytics.pipeline.winRate}
                icon={TrendingUp}
                change={2.1}
                isPositive={true}
                format="percentage"
              />
              <MetricCard
                title="Total Contacts"
                value={analytics.contacts.totalContacts}
                icon={Users}
                change={12.3}
                isPositive={true}
              />
            </div>
          </div>

          {/* Sales Performance */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.revenueByMonth.map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(month.revenue / Math.max(...analytics.performance.revenueByMonth.map(m => m.revenue))) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{formatCurrency(month.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Highest revenue generators this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.topPerformers.map((performer, index) => (
                      <div key={performer.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                            <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{performer.name}</p>
                            <p className="text-xs text-gray-500">{performer.deals} deals closed</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(performer.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pipeline Analysis */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pipeline Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deals by Stage</CardTitle>
                  <CardDescription>Distribution of deals across pipeline stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.dealsByStage.map((stage) => (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{stage.stage}</span>
                          <span>{stage.count} deals • {formatCurrency(stage.value)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(stage.value / analytics.pipeline.totalValue) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Deal Size</span>
                      <span className="font-semibold">{formatCurrency(analytics.sales.averageDealSize)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deal Velocity (days)</span>
                      <span className="font-semibold">{analytics.sales.dealVelocity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{formatPercentage(analytics.sales.conversionRate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lead Conversion</span>
                      <span className="font-semibold">{formatPercentage(analytics.contacts.leadConversion)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Calls Made"
                value={analytics.activities.callsMade}
                icon={Phone}
              />
              <MetricCard
                title="Emails Sent"
                value={analytics.activities.emailsSent}
                icon={Mail}
              />
              <MetricCard
                title="Meetings Scheduled"
                value={analytics.activities.meetingsScheduled}
                icon={Calendar}
              />
              <MetricCard
                title="Documents Generated"
                value={analytics.activities.documentsGenerated}
                icon={FileText}
              />
              <MetricCard
                title="Signatures Completed"
                value={analytics.activities.signaturesCompleted}
                icon={PenTool}
              />
            </div>
          </div>

          {/* Insights and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered insights to improve your sales performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900">Strong Performance</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Your win rate of {formatPercentage(analytics.pipeline.winRate)} is above industry average. 
                        Focus on increasing deal velocity to maximize revenue.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900">Opportunity</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Consider increasing follow-up activities. Your pipeline has {analytics.pipeline.activeDeals} active deals 
                        worth {formatCurrency(analytics.pipeline.totalValue)} that could benefit from more engagement.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Lead Generation</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        You've added {analytics.contacts.newContacts} new contacts this period. 
                        Consider implementing more lead generation strategies to maintain growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;