import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  contactName: string;
  type: string;
}

const CalendarPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    setAppointments([
      {
        id: '1',
        title: 'Property Viewing',
        date: '2025-01-15',
        time: '10:00',
        duration: 60,
        location: '789 Elm St, Brooklyn, NY',
        contactName: 'John Smith',
        type: 'property_viewing'
      },
      {
        id: '2',
        title: 'Investment Consultation',
        date: '2025-01-16',
        time: '14:30',
        duration: 90,
        location: 'Office',
        contactName: 'Emily Rodriguez',
        type: 'consultation'
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Layout currentPage="calendar">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-600">Manage your appointments and schedule</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{appointment.title}</h3>
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {appointment.date} at {appointment.time} ({appointment.duration} min)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {appointment.location}
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Contact: </span>
                  <span className="font-medium text-gray-900">{appointment.contactName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;