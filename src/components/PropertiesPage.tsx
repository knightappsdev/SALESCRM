import React from 'react';
import Layout from './Layout';
import { Building, Plus, MapPin, DollarSign } from 'lucide-react';

const PropertiesPage: React.FC = () => {
  const properties = [
    {
      id: '1',
      title: 'Luxury Brooklyn Condo',
      address: '789 Elm St, Brooklyn, NY 11201',
      price: 850000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      status: 'active'
    },
    {
      id: '2',
      title: 'Commercial Office Space',
      address: '321 Pine St, Queens, NY 11375',
      price: 1200000,
      bedrooms: 0,
      bathrooms: 4,
      sqft: 3000,
      status: 'pending'
    }
  ];

  return (
    <Layout currentPage="properties">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-sm text-gray-600">Manage your real estate listings</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {properties.map((property) => (
            <div key={property.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                <Building className="h-5 w-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.address}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    ${property.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.sqft} sqft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                    property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PropertiesPage;