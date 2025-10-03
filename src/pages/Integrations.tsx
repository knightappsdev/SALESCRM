import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  Search, 
  Settings, 
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MessageSquare,
  Calendar,
  Database,
  CreditCard,
  BarChart3,
  Link,
  Zap,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { integrationManager, IntegrationConfig, setupCommonIntegrations } from '../utils/integrationManager';

const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    const loadIntegrations = async () => {
      // Setup common integrations if not already done
      await setupCommonIntegrations();
      
      // Load all integrations
      const allIntegrations = integrationManager.listIntegrations();
      setIntegrations(allIntegrations);
      setLoading(false);
    };

    loadIntegrations();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'storage':
        return <Database className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Link className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setLoading(true);
    try {
      const success = await integrationManager.testIntegration(integrationId);
      // Refresh integrations list
      const allIntegrations = integrationManager.listIntegrations();
      setIntegrations(allIntegrations);
    } catch (error) {
      console.error('Test connection failed:', error);
    }
    setLoading(false);
  };

  const handleToggleIntegration = async (integrationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await integrationManager.updateIntegration(integrationId, { status: newStatus });
    
    // Refresh integrations list
    const allIntegrations = integrationManager.listIntegrations();
    setIntegrations(allIntegrations);
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || integration.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getIntegrationMetrics = (integrationId: string) => {
    return integrationManager.getMetrics(integrationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect with external services and automate your workflows</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
          <Button onClick={() => setShowConfigModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Link className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Syncing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.settings.syncEnabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="calendar">Calendar</option>
              <option value="storage">Storage</option>
              <option value="payment">Payment</option>
              <option value="analytics">Analytics</option>
              <option value="communication">Communication</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const metrics = getIntegrationMetrics(integration.id);
          
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getCategoryIcon(integration.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {integration.category} • {integration.provider}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Integration Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sync Enabled:</span>
                    <span className={integration.settings.syncEnabled ? 'text-green-600' : 'text-gray-600'}>
                      {integration.settings.syncEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {integration.settings.syncEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sync Interval:</span>
                      <span>{integration.settings.syncInterval} min</span>
                    </div>
                  )}
                  {integration.settings.lastSync && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span>{new Date(integration.settings.lastSync).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                {integration.status === 'active' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">24h Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Requests:</span>
                        <span className="ml-1 font-medium">{metrics.totalRequests}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success:</span>
                        <span className="ml-1 font-medium text-green-600">
                          {metrics.successfulRequests}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Failed:</span>
                        <span className="ml-1 font-medium text-red-600">
                          {metrics.failedRequests}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Response:</span>
                        <span className="ml-1 font-medium">
                          {Math.round(metrics.averageResponseTime)}ms
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIntegration(integration)}
                    className="flex-1"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={loading}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={integration.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleIntegration(integration.id, integration.status)}
                  >
                    {integration.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Popular Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Integrations</CardTitle>
          <CardDescription>
            Connect with these popular services to enhance your CRM workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Mailchimp', category: 'email', description: 'Email marketing automation' },
              { name: 'Zapier', category: 'automation', description: 'Connect 5000+ apps' },
              { name: 'Slack', category: 'communication', description: 'Team communication' },
              { name: 'DocuSign', category: 'documents', description: 'Electronic signatures' }
            ].map((service, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-xs text-gray-600 capitalize">{service.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">{selectedIntegration.name} Configuration</h2>
                <p className="text-gray-600">Configure your {selectedIntegration.provider} integration</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedIntegration(null)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* API Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your API key"
                      value={selectedIntegration.credentials.apiKey || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-secret">API Secret (if required)</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="Enter your API secret"
                      value={selectedIntegration.credentials.apiSecret || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Sync Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Sync Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sync-enabled"
                      checked={selectedIntegration.settings.syncEnabled}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="sync-enabled">Enable automatic sync</Label>
                  </div>
                  <div>
                    <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                    <Input
                      id="sync-interval"
                      type="number"
                      value={selectedIntegration.settings.syncInterval}
                      min="1"
                      max="1440"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-4">Webhook Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      value={selectedIntegration.settings.webhookUrl || ''}
                      placeholder="https://your-app.com/webhooks/integration"
                      disabled
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Use this URL in your {selectedIntegration.provider} webhook configuration
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancel
              </Button>
              <Button>
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;