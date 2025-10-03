import React from 'react';
import Layout from './Layout';
import { Stethoscope, Plus, Calendar, FileText } from 'lucide-react';

const PatientsPage: React.FC = () => {
  const patients = [
    {
      id: '1',
      name: 'Alice Johnson',
      age: 35,
      phone: '+1 (555) 123-4567',
      lastVisit: '2025-01-10',
      nextAppointment: '2025-02-15',
      treatmentPlan: 'Routine Cleaning'
    },
    {
      id: '2',
      name: 'Bob Wilson',
      age: 42,
      phone: '+1 (555) 234-5678',
      lastVisit: '2025-01-08',
      nextAppointment: '2025-01-25',
      treatmentPlan: 'Root Canal'
    }
  ];

  return (
    <Layout currentPage="patients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-sm text-gray-600">Manage your dental practice patients</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {patients.map((patient) => (
            <div key={patient.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                <Stethoscope className="h-5 w-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium text-gray-900">{patient.age}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{patient.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Visit:</span>
                  <span className="font-medium text-gray-900">{patient.lastVisit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Appointment:</span>
                  <span className="font-medium text-gray-900">{patient.nextAppointment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Treatment:</span>
                  <span className="font-medium text-gray-900">{patient.treatmentPlan}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 btn-secondary text-xs py-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule
                  </button>
                  <button className="flex-1 btn-secondary text-xs py-2">
                    <FileText className="h-3 w-3 mr-1" />
                    Records
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PatientsPage;