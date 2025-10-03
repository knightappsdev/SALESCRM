import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  X,
  File,
  FileImage,
  FileSpreadsheet,
  PenTool,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  path: string;
  isTemplate: boolean;
  templateData?: Record<string, any>;
  signatureStatus?: 'pending' | 'signed' | 'declined';
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

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'contract' | 'proposal' | 'invoice' | 'agreement' | 'other';
  fields: TemplateField[];
  content: string;
}

interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone';
  required: boolean;
  defaultValue?: string;
}

const Documents: React.FC = () => {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents');

  // Mock templates data - in real app, this would come from API
  const mockTemplates: DocumentTemplate[] = [
    {
      id: '1',
      name: 'Real Estate Purchase Agreement',
      description: 'Standard purchase agreement for real estate transactions',
      category: 'contract',
      fields: [
        { key: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
        { key: 'sellerName', label: 'Seller Name', type: 'text', required: true },
        { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
        { key: 'purchasePrice', label: 'Purchase Price', type: 'number', required: true },
        { key: 'closingDate', label: 'Closing Date', type: 'date', required: true },
      ],
      content: `REAL ESTATE PURCHASE AGREEMENT

This agreement is made between {{buyerName}} (Buyer) and {{sellerName}} (Seller) for the purchase of the property located at {{propertyAddress}}.

Purchase Price: $\{\{purchasePrice\}\}
Closing Date: {{closingDate}}

[Additional terms and conditions would follow...]`
    },
    {
      id: '2',
      name: 'Dental Treatment Plan',
      description: 'Comprehensive treatment plan for dental patients',
      category: 'agreement',
      fields: [
        { key: 'patientName', label: 'Patient Name', type: 'text', required: true },
        { key: 'treatmentDate', label: 'Treatment Date', type: 'date', required: true },
        { key: 'treatmentDescription', label: 'Treatment Description', type: 'text', required: true },
        { key: 'estimatedCost', label: 'Estimated Cost', type: 'number', required: true },
        { key: 'doctorName', label: 'Doctor Name', type: 'text', required: true },
      ],
      content: `DENTAL TREATMENT PLAN

Patient: {{patientName}}
Date: {{treatmentDate}}
Doctor: {{doctorName}}

Treatment Description:
{{treatmentDescription}}

Estimated Cost: $\{\{estimatedCost\}\}

[Treatment details and instructions would follow...]`
    },
    {
      id: '3',
      name: 'Service Proposal',
      description: 'General service proposal template',
      category: 'proposal',
      fields: [
        { key: 'clientName', label: 'Client Name', type: 'text', required: true },
        { key: 'serviceDescription', label: 'Service Description', type: 'text', required: true },
        { key: 'proposalDate', label: 'Proposal Date', type: 'date', required: true },
        { key: 'totalAmount', label: 'Total Amount', type: 'number', required: true },
        { key: 'validUntil', label: 'Valid Until', type: 'date', required: true },
      ],
      content: `SERVICE PROPOSAL

To: {{clientName}}
Date: {{proposalDate}}

Service Description:
{{serviceDescription}}

Total Amount: $\{\{totalAmount\}\}
Valid Until: {{validUntil}}

[Detailed service breakdown would follow...]`
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
    fetchDocuments();
  }, [token]);

  const fetchDocuments = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents');
        setDocuments([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', selectedFile.name);
    formData.append('type', 'document');

    try {
      setUploadProgress(0);
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // In a real app, you would upload to your API endpoint
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Mock successful upload
        const newDoc: Document = {
          id: Date.now().toString(),
          name: selectedFile.name,
          type: 'document',
          size: selectedFile.size,
          mimeType: selectedFile.type,
          path: `/uploads/${selectedFile.name}`,
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setDocuments(prev => [newDoc, ...prev]);
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
    }
  };

  const handleGenerateFromTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      // Replace template placeholders with actual data
      let content = selectedTemplate.content;
      Object.entries(templateData).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // Create a new document from template
      const newDoc: Document = {
        id: Date.now().toString(),
        name: `${selectedTemplate.name} - ${templateData[selectedTemplate.fields[0]?.key] || 'Generated'}`,
        type: 'generated',
        size: content.length,
        mimeType: 'text/plain',
        path: `/generated/${Date.now()}.txt`,
        isTemplate: false,
        templateData: { ...templateData, templateId: selectedTemplate.id },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDocuments(prev => [newDoc, ...prev]);
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      setTemplateData({});
    } catch (error) {
      console.error('Error generating document from template:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-8 w-8 text-green-600" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-8 w-8 text-red-600" />;
    return <File className="h-8 w-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === '' || doc.type === filterType)
  );

  const Modal = ({ show, onClose, title, children }: { 
    show: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode; 
  }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

  if (!user) {
    return <div>Please log in to access documents.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-2">Manage documents, templates, and e-signatures</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowTemplateModal(true)}
            >
              <FileText className="h-4 w-4" />
              Generate from Template
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({filteredDocuments.length})
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              Templates ({templates.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'documents' ? (
        <>
          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="document">Documents</option>
                  <option value="generated">Generated</option>
                  <option value="template">Templates</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>All Documents ({filteredDocuments.length})</CardTitle>
              <CardDescription>
                Manage your document library
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || filterType 
                    ? 'No documents found matching your criteria.' 
                    : 'No documents uploaded yet. Upload your first document to get started.'
                  }
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getFileIcon(document.mimeType)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{document.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(document.size)} • {new Date(document.createdAt).toLocaleDateString()}
                            </p>
                            {document.templateData && (
                              <p className="text-xs text-blue-600 mt-1">Generated from template</p>
                            )}
                            {document.signatureStatus && (
                              <div className="mt-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  document.signatureStatus === 'signed' 
                                    ? 'bg-green-100 text-green-800'
                                    : document.signatureStatus === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {document.signatureStatus === 'signed' ? 'Signed' : 
                                   document.signatureStatus === 'pending' ? 'Pending Signature' : 'Declined'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <PenTool className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Templates Tab */
        <Card>
          <CardHeader>
            <CardTitle>Document Templates ({templates.length})</CardTitle>
            <CardDescription>
              Pre-built templates for common documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mt-2 capitalize">
                          {template.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      {template.fields.length} fields required
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTemplateData({});
                        setShowTemplateModal(true);
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          setUploadProgress(0);
        }}
        title="Upload Document"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
              required
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          {uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={!selectedFile || uploadProgress > 0}>
              Upload Document
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setUploadProgress(0);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Template Generation Modal */}
      <Modal
        show={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setSelectedTemplate(null);
          setTemplateData({});
        }}
        title={selectedTemplate ? `Generate: ${selectedTemplate.name}` : 'Generate Document'}
      >
        {selectedTemplate && (
          <form onSubmit={handleGenerateFromTemplate} className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            </div>
            
            {selectedTemplate.fields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={templateData[field.key] || field.defaultValue || ''}
                  onChange={(e) => setTemplateData({ 
                    ...templateData, 
                    [field.key]: e.target.value 
                  })}
                  required={field.required}
                />
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Generate Document
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                  setTemplateData({});
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Documents;