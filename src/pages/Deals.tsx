import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Search, Filter, Edit, Trash2, DollarSign, Calendar, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  isWon: boolean;
  contact?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DealFormData {
  title: string;
  description: string;
  value: string;
  currency: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: string;
  expectedCloseDate: string;
  contactId: string;
}

const Deals: React.FC = () => {
  const { user, token } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [pipelineView, setPipelineView] = useState(true);
  
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    description: '',
    value: '',
    currency: 'USD',
    stage: 'new',
    probability: '0',
    expectedCloseDate: '',
    contactId: '',
  });

  const stageColumns = [
    { key: 'new', title: 'New', color: 'bg-gray-100 border-gray-300' },
    { key: 'contacted', title: 'Contacted', color: 'bg-blue-100 border-blue-300' },
    { key: 'qualified', title: 'Qualified', color: 'bg-purple-100 border-purple-300' },
    { key: 'proposal', title: 'Proposal', color: 'bg-yellow-100 border-yellow-300' },
    { key: 'negotiation', title: 'Negotiation', color: 'bg-orange-100 border-orange-300' },
    { key: 'closed_won', title: 'Closed Won', color: 'bg-green-100 border-green-300' },
    { key: 'closed_lost', title: 'Closed Lost', color: 'bg-red-100 border-red-300' },
  ];

  const fetchDeals = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/deals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals);
      } else {
        console.error('Failed to fetch deals');
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [token]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 0,
        contactId: formData.contactId || null,
      };

      const response = await fetch('http://localhost:3001/api/deals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchDeals();
      } else {
        console.error('Failed to create deal');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      value: '',
      currency: 'USD',
      stage: 'new',
      probability: '0',
      expectedCloseDate: '',
      contactId: '',
    });
  };

  const openEditModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      value: deal.value.toString(),
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability.toString(),
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
      contactId: deal.contact?.id || '',
    });
    setShowEditModal(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    const stageInfo = stageColumns.find(col => col.key === stage);
    return stageInfo ? stageInfo.color : 'bg-gray-100 border-gray-300';
  };

  const getTotalValue = (stage?: string) => {
    const filteredDeals = stage ? deals.filter(deal => deal.stage === stage) : deals;
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const Modal = ({ show, onClose, title, children }: { 
    show: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode; 
  }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const DealForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => void; submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Deal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">Deal Value</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {stageColumns.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
        <Input
          id="expectedCloseDate"
          type="date"
          value={formData.expectedCloseDate}
          onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {submitText}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (!user) {
    return <div>Please log in to access deals.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="text-gray-600 mt-2">Track and manage your deals through the sales process</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={pipelineView ? "default" : "outline"}
              onClick={() => setPipelineView(true)}
            >
              Pipeline View
            </Button>
            <Button
              variant={!pipelineView ? "default" : "outline"}
              onClick={() => setPipelineView(false)}
            >
              List View
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalValue(), 'USD')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold">{deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Won This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalValue('closed_won'), 'USD')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold">
                  {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading deals...</div>
      ) : (
        <>
          {pipelineView ? (
            /* Pipeline View */
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {stageColumns.map((stage) => {
                const stageDeals = deals.filter(deal => deal.stage === stage.key);
                const stageValue = getTotalValue(stage.key);
                
                return (
                  <div key={stage.key} className="space-y-3">
                    <div className={`p-3 rounded-lg border-2 ${stage.color}`}>
                      <h3 className="font-semibold text-sm">{stage.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {stageDeals.length} deals • {formatCurrency(stageValue, 'USD')}
                      </p>
                    </div>
                    
                    <div className="space-y-2 min-h-[400px]">
                      {stageDeals.map((deal) => (
                        <Card 
                          key={deal.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openEditModal(deal)}
                        >
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-2">{deal.title}</h4>
                            <div className="space-y-1 text-xs text-gray-600">
                              <p className="font-semibold text-green-600">
                                {formatCurrency(deal.value, deal.currency)}
                              </p>
                              {deal.contact && (
                                <p className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {deal.contact.name}
                                </p>
                              )}
                              {deal.expectedCloseDate && (
                                <p className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-blue-600">{deal.probability}% probability</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <Card>
              <CardHeader>
                <CardTitle>All Deals ({deals.length})</CardTitle>
                <CardDescription>
                  Manage your sales pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No deals found. Add your first deal to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Deal</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Stage</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Probability</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Expected Close</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal) => (
                          <tr key={deal.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{deal.title}</div>
                              {deal.description && (
                                <div className="text-sm text-gray-500 mt-1">{deal.description}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium text-green-600">
                              {formatCurrency(deal.value, deal.currency)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStageColor(deal.stage).replace('border-', 'text-').replace('-300', '-800')}`}>
                                {deal.stage.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{deal.probability}%</td>
                            <td className="py-3 px-4 text-gray-600">{deal.contact?.name || '-'}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditModal(deal)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add Deal Modal */}
      <Modal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Deal"
      >
        <DealForm onSubmit={handleCreateDeal} submitText="Create Deal" />
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeal(null);
          resetForm();
        }}
        title="Edit Deal"
      >
        <DealForm onSubmit={handleCreateDeal} submitText="Update Deal" />
      </Modal>
    </div>
  );
};

export default Deals;