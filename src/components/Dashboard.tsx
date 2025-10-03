import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { api } from '../services/api';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Activity,
  Building,
  Stethoscope,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  activeAppointments: number;
  conversionRate: number;
  monthlyGrowth: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
}> = ({ title, value, icon: Icon, trend, trendLabel }) => {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend !== undefined && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" />
                  )}
                  <span className="sr-only">
                    {trend >= 0 ? 'Increased' : 'Decreased'}
                  </span>
                  {Math.abs(trend)}%
                </div>
              )}
            </dd>
            {trendLabel && (
              <dd className="text-sm text-gray-500">{trendLabel}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalRevenue: 0,
    activeAppointments: 0,
    conversionRate: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard analytics
      const response = await api.analytics.getDashboard();
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Set mock data for demo
      setStats({
        totalContacts: 1247,
        totalDeals: 89,
        totalRevenue: 432100,
        activeAppointments: 23,
        conversionRate: 24.5,
        monthlyGrowth: 12.3
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts.toLocaleString()}
            icon={Users}
            trend={8.2}
            trendLabel="vs last month"
          />
          <StatCard
            title="Active Deals"
            value={stats.totalDeals}
            icon={Briefcase}
            trend={-2.1}
            trendLabel="vs last month"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            trend={stats.monthlyGrowth}
            trendLabel="vs last month"
          />
          <StatCard
            title="Appointments"
            value={stats.activeAppointments}
            icon={Calendar}
            trend={15.3}
            trendLabel="this week"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={TrendingUp}
            trend={3.2}
            trendLabel="vs last quarter"
          />
          <StatCard
            title="Monthly Growth"
            value={`${stats.monthlyGrowth}%`}
            icon={Activity}
            trend={stats.monthlyGrowth}
            trendLabel="this month"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => window.location.href = '/contacts'}
                className="btn-secondary flex items-center justify-center py-3"
              >
                <Users className="h-5 w-5 mr-2" />
                Add Contact
              </button>
              <button
                onClick={() => window.location.href = '/deals'}
                className="btn-secondary flex items-center justify-center py-3"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Create Deal
              </button>
              <button
                onClick={() => window.location.href = '/calendar'}
                className="btn-secondary flex items-center justify-center py-3"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Meeting
              </button>
              <button
                onClick={() => window.location.href = '/analytics'}
                className="btn-secondary flex items-center justify-center py-3"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Industry Sections */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="card">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Real Estate</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Manage properties, track listings, and monitor real estate performance.
            </p>
            <button
              onClick={() => window.location.href = '/properties'}
              className="btn-primary"
            >
              View Properties
            </button>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Stethoscope className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Dental Practice</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Manage patient records, treatment plans, and dental appointments.
            </p>
            <button
              onClick={() => window.location.href = '/patients'}
              className="btn-primary"
            >
              View Patients
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;