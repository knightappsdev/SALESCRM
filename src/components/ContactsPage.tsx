import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  User,
  Filter,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'lead' | 'prospect' | 'client';
  source: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

const ContactCard: React.FC<{ contact: Contact; onEdit: (contact: Contact) => void; onDelete: (id: string) => void }> = ({ 
  contact, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(contact.status)}`}>
              {contact.status}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(contact)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {contact.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <a href={`mailto:${contact.email}`} className="hover:text-primary-600">
              {contact.email}
            </a>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <a href={`tel:${contact.phone}`} className="hover:text-primary-600">
              {contact.phone}
            </a>
          </div>
        )}
        
        {contact.address && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{contact.address}</span>
          </div>
        )}
      </div>
      
      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {contact.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {contact.notes && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
        </div>
      )}
    </div>
  );
};

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.contacts.getAll();
      setContacts(response.data.contacts || []);
    } catch (error: any) {
      console.error('Failed to load contacts:', error);
      setError('Failed to load contacts');
      
      // Mock data for demo
      setContacts([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          address: '789 Elm St, Brooklyn, NY 11201',
          status: 'lead',
          source: 'Website',
          tags: ['first-time-buyer', 'budget-500k'],
          notes: 'Interested in 2-bedroom condo in Brooklyn',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.rodriguez@email.com',
          phone: '+1 (555) 234-5678',
          address: '321 Pine St, Queens, NY 11375',
          status: 'prospect',
          source: 'Referral',
          tags: ['investor', 'commercial'],
          notes: 'Looking for investment properties',
          createdAt: '2025-01-02T00:00:00Z'
        },
        {
          id: '3',
          firstName: 'Robert',
          lastName: 'Brown',
          email: 'robert.brown@email.com',
          phone: '+1 (555) 345-6789',
          address: '654 Maple Ave, Manhattan, NY 10001',
          status: 'client',
          source: 'Cold Call',
          tags: ['luxury', 'seller'],
          notes: 'Selling luxury apartment',
          createdAt: '2025-01-03T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    // TODO: Implement edit functionality
    console.log('Edit contact:', contact);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete contact:', id);
  };

  const handleAddContact = () => {
    // TODO: Implement add contact functionality
    console.log('Add new contact');
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout currentPage="contacts">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="contacts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-600">
              Manage your leads, prospects, and clients
            </p>
          </div>
          <button
            onClick={handleAddContact}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="input min-w-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="lead">Leads</option>
              <option value="prospect">Prospects</option>
              <option value="client">Clients</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {contacts.filter(c => c.status === 'lead').length}
            </div>
            <div className="text-sm text-gray-600">Leads</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {contacts.filter(c => c.status === 'prospect').length}
            </div>
            <div className="text-sm text-gray-600">Prospects</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {contacts.filter(c => c.status === 'client').length}
            </div>
            <div className="text-sm text-gray-600">Clients</div>
          </div>
        </div>

        {/* Contacts Grid */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first contact.'}
            </p>
            <div className="mt-6">
              <button onClick={handleAddContact} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContactsPage;