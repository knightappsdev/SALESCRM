import React from 'react';
import Layout from './Layout';
import { FileText, Plus, Download, Eye } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const documents = [
    {
      id: '1',
      name: 'Property Agreement - Brooklyn Condo',
      type: 'contract',
      size: '2.4 MB',
      createdAt: '2025-01-10',
      status: 'signed'
    },
    {
      id: '2',
      name: 'Investment Proposal - Commercial Space',
      type: 'proposal',
      size: '1.8 MB',
      createdAt: '2025-01-08',
      status: 'pending'
    }
  ];

  return (
    <Layout currentPage="documents">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-600">Manage contracts, proposals, and files</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>

        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                    <p className="text-sm text-gray-600">
                      {document.type} • {document.size} • {document.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    document.status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {document.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Download className="h-4 w-4" />
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

export default DocumentsPage;