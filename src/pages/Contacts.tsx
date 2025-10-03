import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Search, Filter, Edit, Trash2, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'lead' | 'prospect' | 'client' | 'inactive';
  source?: string;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
  gdprConsent: boolean;
  gdprConsentDate?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'lead' | 'prospect' | 'client' | 'inactive';
  source: string;
  tags: string[];
  notes: string;
  gdprConsent: boolean;
}

const Contacts: React.FC = () => {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    status: 'lead',
    source: '',
    tags: [],
    notes: '',
    gdprConsent: false,
  });

  const fetchContacts = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`http://localhost:3001/api/contacts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, statusFilter, token]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchContacts();
      } else {
        console.error('Failed to create contact');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedContact) return;

    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${selectedContact.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedContact(null);
        resetForm();
        fetchContacts();
      } else {
        console.error('Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchContacts();
      } else {
        console.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      status: 'lead',
      source: '',
      tags: [],
      notes: '',
      gdprConsent: false,
    });
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      status: contact.status,
      source: contact.source || '',
      tags: contact.tags || [],
      notes: contact.notes || '',
      gdprConsent: contact.gdprConsent,
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const ContactForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => void; submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="gdprConsent"
          checked={formData.gdprConsent}
          onChange={(e) => setFormData({ ...formData, gdprConsent: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="gdprConsent">GDPR Consent for data processing</Label>
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
    return <div>Please log in to access contacts.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-2">Manage your leads, prospects, and clients</p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="lead">Leads</option>
              <option value="prospect">Prospects</option>
              <option value="client">Clients</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contacts ({contacts.length})</CardTitle>
          <CardDescription>
            View and manage your contact database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contacts found. {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Add your first contact to get started.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Assigned To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{contact.email || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{contact.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{contact.source || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{contact.assignedTo?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditModal(contact)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      <Modal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Contact"
      >
        <ContactForm onSubmit={handleCreateContact} submitText="Create Contact" />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContact(null);
          resetForm();
        }}
        title="Edit Contact"
      >
        <ContactForm onSubmit={handleUpdateContact} submitText="Update Contact" />
      </Modal>
    </div>
  );
};

export default Contacts;