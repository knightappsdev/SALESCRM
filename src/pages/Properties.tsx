import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  FileText,
  Camera,
  X,
  Grid,
  List,
  TrendingUp,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'commercial' | 'land';
  status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  description?: string;
  features: string[];
  images: string[];
  listingAgent?: {
    id: string;
    name: string;
  };
  commission: {
    listingRate: number;
    buyerRate: number;
    totalCommission: number;
  };
  showings: number;
  leads: number;
  daysOnMarket: number;
  createdAt: string;
  updatedAt: string;
}

interface PropertyFormData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: string;
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'commercial' | 'land';
  status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  lotSize: string;
  yearBuilt: string;
  description: string;
  features: string[];
  listingRate: string;
  buyerRate: string;
}

const Properties: React.FC = () => {
  const { user, token } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [formData, setFormData] = useState<PropertyFormData>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    propertyType: 'single_family',
    status: 'active',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    lotSize: '',
    yearBuilt: '',
    description: '',
    features: [],
    listingRate: '3.0',
    buyerRate: '3.0',
  });

  const propertyFeatures = [
    'Swimming Pool', 'Garage', 'Fireplace', 'Hardwood Floors', 'Updated Kitchen',
    'Master Suite', 'Walk-in Closet', 'Patio/Deck', 'Garden', 'Security System',
    'Central Air', 'Basement', 'Attic', 'Laundry Room', 'Storage Space'
  ];

  // Mock data for demonstration
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        address: '123 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        price: 350000,
        propertyType: 'single_family',
        status: 'active',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 2100,
        lotSize: 0.25,
        yearBuilt: 2005,
        description: 'Beautiful single-family home with modern updates and great location.',
        features: ['Garage', 'Fireplace', 'Updated Kitchen', 'Central Air'],
        images: ['/images/property1-1.jpg', '/images/property1-2.jpg'],
        listingAgent: { id: 'agent1', name: 'Sarah Johnson' },
        commission: { listingRate: 3.0, buyerRate: 3.0, totalCommission: 21000 },
        showings: 12,
        leads: 8,
        daysOnMarket: 15,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        address: '456 Maple Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        price: 275000,
        propertyType: 'condo',
        status: 'pending',
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1200,
        yearBuilt: 2010,
        description: 'Modern condo in prime location with city views.',
        features: ['Swimming Pool', 'Security System', 'Laundry Room'],
        images: ['/images/property2-1.jpg'],
        listingAgent: { id: 'agent2', name: 'Mike Wilson' },
        commission: { listingRate: 2.5, buyerRate: 2.5, totalCommission: 13750 },
        showings: 8,
        leads: 5,
        daysOnMarket: 8,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>Please log in to access properties.</div>;
  }

  if (user.organization.industry !== 'real_estate') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Properties Module</h2>
            <p className="text-gray-600">
              This module is only available for real estate organizations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-2">Manage your property listings and track performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              List
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
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
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Prices</option>
              <option value="0-200000">Under $200K</option>
              <option value="200000-400000">$200K - $400K</option>
              <option value="400000-600000">$400K - $600K</option>
              <option value="600000-999999999">$600K+</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties List/Grid - Continued in next chunk */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No properties found. Add your first property to get started.
          </div>
        ) : (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Listings</p>
                      <p className="text-2xl font-bold">{properties.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(properties.reduce((sum, p) => sum + p.price, 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Listings</p>
                      <p className="text-2xl font-bold">
                        {properties.filter(p => p.status === 'active').length}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Showings</p>
                      <p className="text-2xl font-bold">
                        {properties.reduce((sum, p) => sum + p.showings, 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Grid/List View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(property.status)}`}>
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg">{formatCurrency(property.price)}</h3>
                        <p className="text-gray-600 text-sm">{property.address}</p>
                        <p className="text-gray-500 text-sm">{property.city}, {property.state} {property.zipCode}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                        )}
                        {property.squareFootage && (
                          <div className="flex items-center gap-1">
                            <Square className="h-4 w-4" />
                            <span>{property.squareFootage.toLocaleString()} sq ft</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>{property.showings} showings</span>
                        <span>{property.daysOnMarket} days on market</span>
                        <span>{formatCurrency(property.commission.totalCommission)} commission</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Property</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Details</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Commission</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map((property) => (
                          <tr key={property.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{property.address}</div>
                                <div className="text-sm text-gray-500">{property.city}, {property.state} {property.zipCode}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-green-600">
                              {formatCurrency(property.price)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {property.bedrooms && `${property.bedrooms} bed`}
                              {property.bedrooms && property.bathrooms && ' • '}
                              {property.bathrooms && `${property.bathrooms} bath`}
                              {property.squareFootage && (
                                <div>{property.squareFootage.toLocaleString()} sq ft</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(property.status)}`}>
                                {property.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              <div>{property.showings} showings</div>
                              <div>{property.leads} leads</div>
                              <div>{property.daysOnMarket} days</div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="font-medium">{formatCurrency(property.commission.totalCommission)}</div>
                              <div className="text-gray-500">{property.commission.listingRate}% / {property.commission.buyerRate}%</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-3 w-3" />
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;