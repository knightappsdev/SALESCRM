import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar, 
  User,
  Heart,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TreatmentPlanModal from '../components/TreatmentPlanModal';
import RecallSystem from '../components/RecallSystem';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
  dentalHistory: {
    lastCleaning: string;
    lastExam: string;
    treatments: Treatment[];
    notes: string;
  };
  appointments: {
    upcoming: number;
    completed: number;
    missed: number;
  };
  status: 'active' | 'inactive' | 'new';
  createdAt: string;
  updatedAt: string;
}

interface Treatment {
  id: string;
  date: string;
  procedure: string;
  tooth: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  cost: number;
}

interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  description: string;
  treatments: {
    procedure: string;
    tooth: string;
    estimatedCost: number;
    priority: 'high' | 'medium' | 'low';
    status: 'planned' | 'approved' | 'completed' | 'cancelled';
  }[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

const Patients: React.FC = () => {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTreatmentPlanModal, setShowTreatmentPlanModal] = useState(false);
  const [showRecallSystem, setShowRecallSystem] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1985-03-15',
        gender: 'male',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '(555) 123-4568',
          relationship: 'Spouse'
        },
        insurance: {
          provider: 'Delta Dental',
          policyNumber: 'DD123456789',
          groupNumber: 'GRP001'
        },
        medicalHistory: {
          allergies: ['Penicillin'],
          medications: ['Lisinopril'],
          conditions: ['Hypertension'],
          notes: 'Patient has anxiety about dental procedures'
        },
        dentalHistory: {
          lastCleaning: '2024-01-15',
          lastExam: '2024-01-15',
          treatments: [
            {
              id: 't1',
              date: '2024-01-15',
              procedure: 'Cleaning',
              tooth: 'Full mouth',
              status: 'completed',
              cost: 150
            },
            {
              id: 't2',
              date: '2023-07-10',
              procedure: 'Filling',
              tooth: '#14',
              status: 'completed',
              cost: 250
            }
          ],
          notes: 'Good oral hygiene, regular cleanings needed'
        },
        appointments: {
          upcoming: 1,
          completed: 12,
          missed: 2
        },
        status: 'active',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 234-5678',
        dateOfBirth: '1990-07-22',
        gender: 'female',
        address: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        emergencyContact: {
          name: 'Michael Johnson',
          phone: '(555) 234-5679',
          relationship: 'Brother'
        },
        insurance: {
          provider: 'MetLife',
          policyNumber: 'ML987654321',
          groupNumber: 'GRP002'
        },
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: [],
          notes: 'No known medical issues'
        },
        dentalHistory: {
          lastCleaning: '2023-12-10',
          lastExam: '2023-12-10',
          treatments: [
            {
              id: 't3',
              date: '2023-12-10',
              procedure: 'Cleaning',
              tooth: 'Full mouth',
              status: 'completed',
              cost: 150
            }
          ],
          notes: 'New patient, excellent oral health'
        },
        appointments: {
          upcoming: 2,
          completed: 3,
          missed: 0
        },
        status: 'active',
        createdAt: '2023-11-01T00:00:00Z',
        updatedAt: '2023-12-10T00:00:00Z'
      }
    ];

    const mockTreatmentPlans: TreatmentPlan[] = [
      {
        id: 'tp1',
        patientId: '1',
        title: 'Comprehensive Dental Care Plan',
        description: 'Complete dental restoration and maintenance plan',
        treatments: [
          {
            procedure: 'Crown',
            tooth: '#3',
            estimatedCost: 1200,
            priority: 'high',
            status: 'approved'
          },
          {
            procedure: 'Root Canal',
            tooth: '#14',
            estimatedCost: 800,
            priority: 'high',
            status: 'planned'
          },
          {
            procedure: 'Cleaning',
            tooth: 'Full mouth',
            estimatedCost: 150,
            priority: 'medium',
            status: 'approved'
          }
        ],
        totalCost: 2150,
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      }
    ];

    setPatients(mockPatients);
    setTreatmentPlans(mockTreatmentPlans);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === '' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSaveTreatmentPlan = (patientId: string, planData: any) => {
    const newPlan: TreatmentPlan = {
      id: `tp_${Date.now()}`,
      patientId,
      title: planData.title,
      description: planData.description,
      treatments: planData.treatments,
      totalCost: planData.treatments.reduce((sum: number, treatment: any) => sum + treatment.estimatedCost, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTreatmentPlans(prev => [...prev, newPlan]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600">Manage dental patient records and treatment plans</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowRecallSystem(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Recalls
          </Button>
          <Button variant="outline" onClick={() => setShowTreatmentPlanModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Treatment Plans
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((sum, p) => sum + p.appointments.upcoming, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Treatment Plans</p>
                <p className="text-2xl font-bold text-gray-900">{treatmentPlans.length}</p>
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
                  placeholder="Search patients by name, email, or phone..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records ({filteredPatients.length})</CardTitle>
          <CardDescription>
            Comprehensive patient information and treatment history
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Age/Gender</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Insurance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Appointments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Alerts</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {patient.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{patient.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div>{getAge(patient.dateOfBirth)} years</div>
                      <div className="capitalize">{patient.gender}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="font-medium">{patient.insurance.provider}</div>
                      <div className="text-xs">{patient.insurance.policyNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div>{formatDate(patient.dentalHistory.lastExam)}</div>
                      <div className="text-xs text-gray-500">
                        Cleaning: {formatDate(patient.dentalHistory.lastCleaning)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {patient.appointments.upcoming} upcoming
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {patient.appointments.completed} done
                        </span>
                        {patient.appointments.missed > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            {patient.appointments.missed} missed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {patient.medicalHistory.allergies.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">
                              {patient.medicalHistory.allergies.length} allergies
                            </span>
                          </div>
                        )}
                        {patient.medicalHistory.conditions.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600">
                              {patient.medicalHistory.conditions.length} conditions
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Plans Summary */}
      {treatmentPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Treatment Plans</CardTitle>
            <CardDescription>
              Current treatment plans requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentPlans.map((plan) => {
                const patient = patients.find(p => p.id === plan.patientId);
                return (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{plan.title}</h4>
                        <p className="text-sm text-gray-600">
                          Patient: {patient?.firstName} {patient?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{formatCurrency(plan.totalCost)}</div>
                        <div className="text-sm text-gray-500">Total Cost</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {plan.treatments.map((treatment, index) => (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm">{treatment.procedure}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(treatment.priority)}`}>
                              {treatment.priority}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>Tooth: {treatment.tooth}</div>
                            <div>Cost: {formatCurrency(treatment.estimatedCost)}</div>
                            <div className="capitalize">Status: {treatment.status.replace('_', ' ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modals */}
      <TreatmentPlanModal
        isOpen={showTreatmentPlanModal}
        onClose={() => setShowTreatmentPlanModal(false)}
        patients={patients.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName }))}
        onSave={handleSaveTreatmentPlan}
      />
      
      <RecallSystem
        isOpen={showRecallSystem}
        onClose={() => setShowRecallSystem(false)}
      />
    </div>
  );
};

export default Patients;