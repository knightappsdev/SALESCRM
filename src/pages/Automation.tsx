import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Clock,
  Play,
  Pause,
  Settings,
  Users,
  Send,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'mixed';
  trigger: {
    type: 'contact_added' | 'deal_stage_changed' | 'appointment_scheduled' | 'time_based' | 'manual';
    conditions: any;
  };
  steps: AutomationStep[];
  status: 'active' | 'paused' | 'draft';
  stats: {
    enrolled: number;
    completed: number;
    inProgress: number;
    openRate?: number;
    clickRate?: number;
    responseRate?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AutomationStep {
  id: string;
  type: 'email' | 'sms' | 'wait' | 'condition' | 'action';
  name: string;
  config: {
    subject?: string;
    content?: string;
    delay?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks';
    };
    conditions?: any;
    action?: string;
  };
  position: { x: number; y: number };
}

interface Campaign {
  id: string;
  workflowId: string;
  workflowName: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  lastActivity?: string;
}

const Automation: React.FC = () => {
  const { user, token } = useAuth();
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflows' | 'campaigns' | 'templates'>('workflows');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockWorkflows: AutomationWorkflow[] = [
      {
        id: '1',
        name: 'New Lead Welcome Series',
        description: 'Welcome new leads with information about our services and follow up over 7 days',
        type: 'email',
        trigger: {
          type: 'contact_added',
          conditions: { source: 'website', status: 'lead' }
        },
        steps: [
          {
            id: 'step1',
            type: 'email',
            name: 'Welcome Email',
            config: {
              subject: 'Welcome to Our CRM!',
              content: 'Thank you for your interest. We\'ll be in touch soon with more information.'
            },
            position: { x: 100, y: 100 }
          },
          {
            id: 'step2',
            type: 'wait',
            name: 'Wait 2 Days',
            config: {
              delay: { value: 2, unit: 'days' }
            },
            position: { x: 100, y: 200 }
          },
          {
            id: 'step3',
            type: 'email',
            name: 'Follow-up Email',
            config: {
              subject: 'Here\'s how we can help',
              content: 'Learn more about our services and how we can assist with your needs.'
            },
            position: { x: 100, y: 300 }
          }
        ],
        status: 'active',
        stats: {
          enrolled: 45,
          completed: 32,
          inProgress: 13,
          openRate: 68.5,
          clickRate: 15.2
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: '2',
        name: 'Appointment Reminder SMS',
        description: 'Send SMS reminders for upcoming appointments',
        type: 'sms',
        trigger: {
          type: 'time_based',
          conditions: { schedule: '24_hours_before_appointment' }
        },
        steps: [
          {
            id: 'step1',
            type: 'sms',
            name: 'Reminder SMS',
            config: {
              content: 'Hi {firstName}, this is a reminder about your appointment tomorrow at {appointmentTime}. Reply CONFIRM to confirm or RESCHEDULE to change.'
            },
            position: { x: 100, y: 100 }
          }
        ],
        status: 'active',
        stats: {
          enrolled: 128,
          completed: 115,
          inProgress: 13,
          responseRate: 89.2
        },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z'
      },
      {
        id: '3',
        name: 'Property Listing Updates',
        description: 'Notify interested buyers about new properties matching their criteria',
        type: 'mixed',
        trigger: {
          type: 'manual',
          conditions: {}
        },
        steps: [
          {
            id: 'step1',
            type: 'email',
            name: 'New Listing Email',
            config: {
              subject: 'New Property Alert: {propertyAddress}',
              content: 'A new property matching your criteria is now available. Check it out!'
            },
            position: { x: 100, y: 100 }
          },
          {
            id: 'step2',
            type: 'wait',
            name: 'Wait 1 Hour',
            config: {
              delay: { value: 1, unit: 'hours' }
            },
            position: { x: 100, y: 200 }
          },
          {
            id: 'step3',
            type: 'sms',
            name: 'Follow-up SMS',
            config: {
              content: 'Did you see our new listing at {propertyAddress}? Schedule a viewing today!'
            },
            position: { x: 100, y: 300 }
          }
        ],
        status: 'paused',
        stats: {
          enrolled: 76,
          completed: 62,
          inProgress: 14,
          openRate: 72.1,
          clickRate: 18.5,
          responseRate: 12.3
        },
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-22T00:00:00Z'
      }
    ];

    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        workflowId: '1',
        workflowName: 'New Lead Welcome Series',
        contactId: 'contact1',
        contactName: 'John Smith',
        contactEmail: 'john.smith@email.com',
        contactPhone: '(555) 123-4567',
        status: 'active',
        currentStep: 2,
        totalSteps: 3,
        startedAt: '2024-01-20T10:30:00Z',
        lastActivity: '2024-01-22T14:15:00Z'
      },
      {
        id: '2',
        workflowId: '2',
        workflowName: 'Appointment Reminder SMS',
        contactId: 'contact2',
        contactName: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@email.com',
        contactPhone: '(555) 234-5678',
        status: 'completed',
        currentStep: 1,
        totalSteps: 1,
        startedAt: '2024-01-21T09:00:00Z',
        completedAt: '2024-01-21T09:01:00Z',
        lastActivity: '2024-01-21T09:01:00Z'
      }
    ];

    setWorkflows(mockWorkflows);
    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'mixed':
        return <Send className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'mixed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { 
            ...workflow, 
            status: workflow.status === 'active' ? 'paused' : 'active',
            updatedAt: new Date().toISOString()
          }
        : workflow
    ));
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading automation...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Automation</h1>
          <p className="text-gray-600">Create and manage email & SMS campaigns and workflows</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => w.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.reduce((sum, w) => sum + w.stats.enrolled, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.reduce((sum, w) => sum + w.stats.inProgress, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.reduce((sum, w) => sum + w.stats.completed, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('workflows')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'workflows'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Workflows ({workflows.length})
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Campaigns ({campaigns.filter(c => c.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Templates
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {activeTab === 'workflows' ? (
                  <>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="paused">Paused</option>
                  </>
                )}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'workflows' && (
              <div className="space-y-4">
                {filteredWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(workflow.type)}`}>
                              {getTypeIcon(workflow.type)}
                              <span className="ml-1 capitalize">{workflow.type}</span>
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(workflow.status)}`}>
                              {workflow.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{workflow.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">{workflow.stats.enrolled}</div>
                              <div className="text-sm text-gray-500">Enrolled</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">{workflow.stats.completed}</div>
                              <div className="text-sm text-gray-500">Completed</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{workflow.stats.inProgress}</div>
                              <div className="text-sm text-gray-500">In Progress</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">
                                {workflow.stats.openRate ? `${workflow.stats.openRate}%` : 
                                 workflow.stats.responseRate ? `${workflow.stats.responseRate}%` : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {workflow.type === 'email' ? 'Open Rate' : 'Response Rate'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{workflow.steps.length} steps</span>
                            <span className="mx-2">•</span>
                            <span>Updated {formatDate(workflow.updatedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            onClick={() => toggleWorkflowStatus(workflow.id)}
                            size="sm"
                            variant={workflow.status === 'active' ? 'outline' : 'default'}
                          >
                            {workflow.status === 'active' ? (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{campaign.contactName}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{campaign.workflowName}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500">Contact Info</div>
                              <div className="font-medium">{campaign.contactEmail}</div>
                              <div className="text-sm text-gray-600">{campaign.contactPhone}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Progress</div>
                              <div className="font-medium">
                                Step {campaign.currentStep} of {campaign.totalSteps}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all" 
                                  style={{ width: `${(campaign.currentStep / campaign.totalSteps) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Timeline</div>
                              <div className="font-medium">Started {formatDate(campaign.startedAt)}</div>
                              {campaign.lastActivity && (
                                <div className="text-sm text-gray-600">
                                  Last activity {formatDate(campaign.lastActivity)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                          {campaign.status === 'active' && (
                            <Button variant="outline" size="sm">
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email & SMS Templates</h3>
                <p className="text-gray-600 mb-6">Create reusable templates for your automation campaigns</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Automation;