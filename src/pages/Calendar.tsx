import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Calendar as CalendarIcon, Clock, User, MapPin, Video, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reminderSent: boolean;
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

interface AppointmentFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string;
  contactId: string;
}

const Calendar: React.FC = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingLink: '',
    contactId: '',
  });

  const fetchAppointments = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contactId: formData.contactId || null,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchAppointments();
      } else {
        console.error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      meetingLink: '',
      contactId: '',
    });
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      startTime: appointment.startTime.substring(0, 16), // Format for datetime-local input
      endTime: appointment.endTime.substring(0, 16),
      location: appointment.location || '',
      meetingLink: appointment.meetingLink || '',
      contactId: appointment.contact?.id || '',
    });
    setShowEditModal(true);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // First day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => 
      new Date(apt.startTime).toISOString().split('T')[0] === dateStr
    );
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

  const AppointmentForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => void; submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Appointment Title *</Label>
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
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Office address or meeting room"
        />
      </div>

      <div>
        <Label htmlFor="meetingLink">Meeting Link</Label>
        <Input
          id="meetingLink"
          type="url"
          value={formData.meetingLink}
          onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
          placeholder="https://zoom.us/j/123456789"
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
    return <div>Please log in to access the calendar.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">Schedule and manage appointments</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'month' ? "default" : "outline"}
              onClick={() => setViewMode('month')}
              size="sm"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? "default" : "outline"}
              onClick={() => setViewMode('week')}
              size="sm"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? "default" : "outline"}
              onClick={() => setViewMode('day')}
              size="sm"
            >
              Day
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const newDate = new Date(currentDate);
              if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() - 1);
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setDate(newDate.getDate() - 1);
              }
              setCurrentDate(newDate);
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const newDate = new Date(currentDate);
              if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() + 1);
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + 7);
              } else {
                newDate.setDate(newDate.getDate() + 1);
              }
              setCurrentDate(newDate);
            }}
          >
            Next
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {viewMode === 'month' 
            ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : viewMode === 'week'
            ? `Week of ${getWeekDates(currentDate)[0].toLocaleDateString()}`
            : currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          }
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading appointments...</div>
      ) : (
        <>
          {viewMode === 'week' && (
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div></div> {/* Empty cell for time column */}
              {getWeekDates(currentDate).map((date, index) => (
                <div key={index} className="text-center p-2 font-semibold border-b">
                  <div className="text-sm text-gray-600">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={`text-lg ${date.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'week' ? (
            /* Week View */
            <div className="grid grid-cols-8 gap-2 min-h-[600px]">
              {/* Time column */}
              <div className="space-y-12 pt-8">
                {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                  <div key={hour} className="text-sm text-gray-500 text-right pr-2">
                    {hour}:00
                  </div>
                ))}
              </div>
              
              {/* Day columns */}
              {getWeekDates(currentDate).map((date, dayIndex) => {
                const dayAppointments = getAppointmentsForDate(date);
                return (
                  <div key={dayIndex} className="border-l border-gray-200 relative min-h-[600px]">
                    {dayAppointments.map((appointment) => {
                      const startHour = new Date(appointment.startTime).getHours();
                      const startMinute = new Date(appointment.startTime).getMinutes();
                      const endHour = new Date(appointment.endTime).getHours();
                      const endMinute = new Date(appointment.endTime).getMinutes();
                      
                      const topOffset = ((startHour - 8) * 60 + startMinute) * (48 / 60); // 48px per hour
                      const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (48 / 60);
                      
                      return (
                        <div
                          key={appointment.id}
                          className="absolute left-1 right-1 p-1 text-xs bg-blue-100 border-l-4 border-blue-500 rounded cursor-pointer hover:bg-blue-200"
                          style={{
                            top: `${topOffset + 32}px`, // 32px offset for header
                            height: `${Math.max(height, 24)}px`,
                          }}
                          onClick={() => openEditModal(appointment)}
                        >
                          <div className="font-semibold truncate">{appointment.title}</div>
                          <div className="text-gray-600 truncate">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                          {appointment.contact && (
                            <div className="text-gray-600 truncate">{appointment.contact.name}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments ({appointments.length})</CardTitle>
                <CardDescription>
                  Manage your scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled. Create your first appointment to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((appointment) => (
                        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{appointment.title}</h3>
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                </div>
                                
                                {appointment.description && (
                                  <p className="text-gray-600 mb-3">{appointment.description}</p>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{formatDateTime(appointment.startTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                                    </span>
                                  </div>
                                  {appointment.contact && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span>{appointment.contact.name}</span>
                                    </div>
                                  )}
                                  {appointment.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{appointment.location}</span>
                                    </div>
                                  )}
                                  {appointment.meetingLink && (
                                    <div className="flex items-center gap-2">
                                      <Video className="h-4 w-4" />
                                      <a 
                                        href={appointment.meetingLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Join Meeting
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditModal(appointment)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add Appointment Modal */}
      <Modal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Schedule New Appointment"
      >
        <AppointmentForm onSubmit={handleCreateAppointment} submitText="Schedule Appointment" />
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
          resetForm();
        }}
        title="Edit Appointment"
      >
        <AppointmentForm onSubmit={handleCreateAppointment} submitText="Update Appointment" />
      </Modal>
    </div>
  );
};

export default Calendar;