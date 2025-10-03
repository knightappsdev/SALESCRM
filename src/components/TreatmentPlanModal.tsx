import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Plus, 
  X, 
  Save, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';

interface TreatmentItem {
  procedure: string;
  tooth: string;
  estimatedCost: number;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
}

interface TreatmentPlanFormData {
  title: string;
  description: string;
  treatments: TreatmentItem[];
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  selectedPatientId?: string;
  onSave: (patientId: string, planData: TreatmentPlanFormData) => void;
}

const commonProcedures = [
  'Cleaning',
  'Exam',
  'X-rays',
  'Filling',
  'Crown',
  'Root Canal',
  'Extraction',
  'Bridge',
  'Implant',
  'Whitening',
  'Deep Cleaning',
  'Sealants',
  'Dentures',
  'Orthodontics',
  'Periodontal Treatment'
];

const TreatmentPlanModal: React.FC<TreatmentPlanModalProps> = ({
  isOpen,
  onClose,
  patients,
  selectedPatientId,
  onSave
}) => {
  const [selectedPatient, setSelectedPatient] = useState(selectedPatientId || '');
  const [formData, setFormData] = useState<TreatmentPlanFormData>({
    title: '',
    description: '',
    treatments: [
      {
        procedure: '',
        tooth: '',
        estimatedCost: 0,
        priority: 'medium',
        status: 'planned',
        notes: ''
      }
    ]
  });

  const handleAddTreatment = () => {
    setFormData(prev => ({
      ...prev,
      treatments: [
        ...prev.treatments,
        {
          procedure: '',
          tooth: '',
          estimatedCost: 0,
          priority: 'medium',
          status: 'planned',
          notes: ''
        }
      ]
    }));
  };

  const handleRemoveTreatment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.filter((_, i) => i !== index)
    }));
  };

  const handleTreatmentChange = (index: number, field: keyof TreatmentItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      treatments: prev.treatments.map((treatment, i) => 
        i === index ? { ...treatment, [field]: value } : treatment
      )
    }));
  };

  const getTotalCost = () => {
    return formData.treatments.reduce((sum, treatment) => sum + treatment.estimatedCost, 0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    if (!selectedPatient || !formData.title.trim()) return;
    
    onSave(selectedPatient, formData);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      treatments: [
        {
          procedure: '',
          tooth: '',
          estimatedCost: 0,
          priority: 'medium',
          status: 'planned',
          notes: ''
        }
      ]
    });
    setSelectedPatient('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Treatment Plan</h2>
            <p className="text-sm text-gray-600">Plan comprehensive dental treatments for your patient</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient">Select Patient</Label>
              <select
                id="patient"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="title">Plan Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Comprehensive Restoration Plan"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the overall treatment plan and goals..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Treatment Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Treatment Items</h3>
              <Button onClick={handleAddTreatment} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </div>

            <div className="space-y-4">
              {formData.treatments.map((treatment, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    {formData.treatments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTreatment(index)}
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`procedure-${index}`}>Procedure</Label>
                        <select
                          id={`procedure-${index}`}
                          value={treatment.procedure}
                          onChange={(e) => handleTreatmentChange(index, 'procedure', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select procedure...</option>
                          {commonProcedures.map((proc) => (
                            <option key={proc} value={proc}>{proc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`tooth-${index}`}>Tooth/Area</Label>
                        <Input
                          id={`tooth-${index}`}
                          type="text"
                          value={treatment.tooth}
                          onChange={(e) => handleTreatmentChange(index, 'tooth', e.target.value)}
                          placeholder="e.g., #14, Full mouth"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`cost-${index}`}>Estimated Cost</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id={`cost-${index}`}
                            type="number"
                            value={treatment.estimatedCost}
                            onChange={(e) => handleTreatmentChange(index, 'estimatedCost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="pl-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`priority-${index}`}>Priority</Label>
                        <select
                          id={`priority-${index}`}
                          value={treatment.priority}
                          onChange={(e) => handleTreatmentChange(index, 'priority', e.target.value as 'high' | 'medium' | 'low')}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`status-${index}`}>Status</Label>
                        <select
                          id={`status-${index}`}
                          value={treatment.status}
                          onChange={(e) => handleTreatmentChange(index, 'status', e.target.value as TreatmentItem['status'])}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="planned">Planned</option>
                          <option value="approved">Approved</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                        <Input
                          id={`notes-${index}`}
                          type="text"
                          value={treatment.notes || ''}
                          onChange={(e) => handleTreatmentChange(index, 'notes', e.target.value)}
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>

                    {/* Treatment Preview */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(treatment.priority)}`}>
                            {treatment.priority} priority
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(treatment.status)}`}>
                            {treatment.status}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(treatment.estimatedCost)}
                        </div>
                      </div>
                      {treatment.procedure && treatment.tooth && (
                        <div className="text-sm text-gray-600 mt-1">
                          {treatment.procedure} - {treatment.tooth}
                          {treatment.notes && ` • ${treatment.notes}`}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Treatment Plan Summary</h4>
                  <p className="text-sm text-gray-600">
                    {formData.treatments.length} treatment{formData.treatments.length !== 1 ? 's' : ''} planned
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(getTotalCost())}
                  </div>
                  <div className="text-sm text-gray-600">Total Estimated Cost</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                    <span className="font-medium text-red-700">
                      {formData.treatments.filter(t => t.priority === 'high').length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="font-medium text-green-700">
                      {formData.treatments.filter(t => t.status === 'approved').length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="font-medium text-blue-700">
                      {formData.treatments.filter(t => t.status === 'planned').length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">Planned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!selectedPatient || !formData.title.trim() || formData.treatments.some(t => !t.procedure)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Treatment Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanModal;