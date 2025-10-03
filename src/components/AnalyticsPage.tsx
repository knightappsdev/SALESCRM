import React from 'react';
import Layout from './Layout';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <Layout currentPage="analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600">Track your performance and business metrics</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card text-center">
            <BarChart3 className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">$432K</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="card text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">24.5%</div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
          <div className="card text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">Total Contacts</div>
          </div>
          <div className="card text-center">
            <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-600">Active Deals</div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder - Analytics coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;