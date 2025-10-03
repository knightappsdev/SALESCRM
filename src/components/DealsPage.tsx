import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Filter,
  Briefcase
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  contactName: string;
  createdAt: string;
}

const DealsPage: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    setDeals([
      {
        id: '1',
        title: 'Brooklyn Condo Sale',
        value: 850000,
        stage: 'negotiation',
        probability: 75,
        expectedCloseDate: '2025-02-15',
        contactName: 'John Smith',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Commercial Property Investment',
        value: 1200000,
        stage: 'proposal',
        probability: 50,
        expectedCloseDate: '2025-03-01',
        contactName: 'Emily Rodriguez',
        createdAt: '2025-01-02T00:00:00Z'
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Layout currentPage="deals">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="deals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="text-sm text-gray-600">Track your sales pipeline and opportunities</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {deals.map((deal) => (
            <div key={deal.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{deal.title}</h3>
                <Briefcase className="h-5 w-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Value</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${deal.value.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stage</span>
                  <span className="capitalize text-sm font-medium text-gray-900">{deal.stage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Probability</span>
                  <span className="text-sm font-medium text-gray-900">{deal.probability}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contact</span>
                  <span className="text-sm font-medium text-gray-900">{deal.contactName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DealsPage;