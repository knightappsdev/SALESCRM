import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Send,
  User,
  Filter,
  Search
} from 'lucide-react';

interface RecallItem {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  type: 'cleaning' | 'exam' | 'follow_up' | 'treatment' | 'custom';
  title: string;
  description: string;
  dueDate: string;
  lastContactDate?: string;
  contactAttempts: number;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  preferredContactMethod: 'phone' | 'email' | 'sms';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RecallSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecallSystem: React.FC<RecallSystemProps> = ({ isOpen, onClose }) => {
  const [recalls, setRecalls] = useState<RecallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockRecalls: RecallItem[] = [
      {
        id: '1',
        patientId: 'patient1',
        patientName: 'John Smith',
        patientPhone: '(555) 123-4567',
        patientEmail: 'john.smith@email.com',
        type: 'cleaning',
        title: '6-Month Cleaning Due',
        description: 'Regular dental cleaning and checkup',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        contactAttempts: 2,
        status: 'contacted',
        priority: 'medium',
        preferredContactMethod: 'phone',
        notes: 'Patient prefers morning appointments',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        patientId: 'patient2',
        patientName: 'Sarah Johnson',
        patientPhone: '(555) 234-5678',
        patientEmail: 'sarah.johnson@email.com',
        type: 'follow_up',
        title: 'Crown Follow-up',
        description: 'Follow-up appointment after crown placement',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Overdue by 2 days
        contactAttempts: 0,
        status: 'pending',
        priority: 'high',
        preferredContactMethod: 'email',
        notes: 'Check crown fitting and comfort',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        patientId: 'patient3',
        patientName: 'Mike Davis',
        patientPhone: '(555) 345-6789',
        patientEmail: 'mike.davis@email.com',
        type: 'exam',
        title: 'Annual Exam',
        description: 'Comprehensive dental examination',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        contactAttempts: 1,
        status: 'scheduled',
        priority: 'low',
        preferredContactMethod: 'sms',
        notes: 'Scheduled for next Thursday at 2 PM',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setRecalls(mockRecalls);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
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

  const getDueDateStatus = (dueDate: string) => {
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil < 0) {
      return { status: 'overdue', color: 'text-red-600', text: `${Math.abs(daysUntil)} days overdue` };
    } else if (daysUntil === 0) {
      return { status: 'due', color: 'text-orange-600', text: 'Due today' };
    } else if (daysUntil <= 7) {
      return { status: 'soon', color: 'text-yellow-600', text: `Due in ${daysUntil} days` };
    } else {
      return { status: 'future', color: 'text-gray-600', text: `Due in ${daysUntil} days` };
    }
  };

  const handleContact = (recallId: string, method: 'phone' | 'email' | 'sms') => {
    setRecalls(prev => prev.map(recall => 
      recall.id === recallId 
        ? { 
            ...recall, 
            contactAttempts: recall.contactAttempts + 1,
            lastContactDate: new Date().toISOString().split('T')[0],
            status: 'contacted' as const,
            updatedAt: new Date().toISOString()
          }
        : recall
    ));
  };

  const handleStatusChange = (recallId: string, newStatus: RecallItem['status']) => {
    setRecalls(prev => prev.map(recall => 
      recall.id === recallId 
        ? { ...recall, status: newStatus, updatedAt: new Date().toISOString() }
        : recall
    ));
  };

  const filteredRecalls = recalls.filter(recall => {
    const matchesSearch = 
      recall.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recall.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recall.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || recall.status === statusFilter;
    const matchesType = typeFilter === '' || recall.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const overdueRecalls = filteredRecalls.filter(recall => getDaysUntilDue(recall.dueDate) < 0);
  const dueTodayRecalls = filteredRecalls.filter(recall => getDaysUntilDue(recall.dueDate) === 0);
  const upcomingRecalls = filteredRecalls.filter(recall => {
    const days = getDaysUntilDue(recall.dueDate);
    return days > 0 && days <= 7;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recall System</h2>
            <p className="text-sm text-gray-600">Manage patient recalls and appointment reminders</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recall
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-red-900">{overdueRecalls.length}</p>
                    <p className="text-sm text-red-700">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{dueTodayRecalls.length}</p>
                    <p className="text-sm text-orange-700">Due Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-900">{upcomingRecalls.length}</p>
                    <p className="text-sm text-yellow-700">Due This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{filteredRecalls.length}</p>
                    <p className="text-sm text-blue-700">Total Recalls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search recalls by patient name or description..."
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
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="exam">Exam</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="treatment">Treatment</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Recalls List */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Recalls ({filteredRecalls.length})</CardTitle>
              <CardDescription>
                Manage and track patient recall appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Recall Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecalls.map((recall) => {
                      const dueDateStatus = getDueDateStatus(recall.dueDate);
                      return (
                        <tr key={recall.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{recall.patientName}</div>
                              <div className="text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{recall.patientPhone}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{recall.patientEmail}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{recall.title}</div>
                            <div className="text-sm text-gray-600">{recall.description}</div>
                            <div className="text-xs text-gray-500 capitalize mt-1">{recall.type.replace('_', ' ')}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{formatDate(recall.dueDate)}</div>
                            <div className={`text-sm ${dueDateStatus.color}`}>
                              {dueDateStatus.text}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="mb-1">
                              <span className="font-medium">{recall.contactAttempts}</span> attempts
                            </div>
                            {recall.lastContactDate && (
                              <div className="text-gray-500">
                                Last: {formatDate(recall.lastContactDate)}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 capitalize mt-1">
                              Prefers: {recall.preferredContactMethod}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(recall.priority)}`}>
                              {recall.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={recall.status}
                              onChange={(e) => handleStatusChange(recall.id, e.target.value as RecallItem['status'])}
                              className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(recall.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleContact(recall.id, 'phone')}
                                title="Call Patient"
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleContact(recall.id, 'email')}
                                title="Email Patient"
                              >
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleContact(recall.id, 'sms')}
                                title="Send SMS"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecallSystem;