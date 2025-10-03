import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  PenTool, 
  Save, 
  X, 
  RotateCcw, 
  Check, 
  Mail, 
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  onSignatureChange: (signature: string) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ 
  width = 400, 
  height = 200, 
  onSignatureChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert canvas to data URL and notify parent
    const signature = canvas.toDataURL();
    onSignatureChange(signature);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange('');
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-200 rounded cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div className="flex justify-between">
        <p className="text-sm text-gray-600">Sign above using your mouse or trackpad</p>
        <Button variant="outline" size="sm" onClick={clearSignature} disabled={isEmpty}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
};

interface SignatureRequest {
  id: string;
  documentId: string;
  documentName: string;
  signerEmail: string;
  signerName: string;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  requestedAt: string;
  signedAt?: string;
  signature?: string;
  ipAddress?: string;
  auditTrail: SignatureAuditEntry[];
}

interface SignatureAuditEntry {
  timestamp: string;
  action: string;
  details: string;
  ipAddress?: string;
}

interface ESignatureRequestFormData {
  signerEmail: string;
  signerName: string;
  message: string;
  expiresInDays: number;
}

const ESignature: React.FC<{ documentId?: string; onComplete?: () => void }> = ({ 
  documentId, 
  onComplete 
}) => {
  const [mode, setMode] = useState<'request' | 'sign' | 'view'>('request');
  const [signature, setSignature] = useState<string>('');
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<SignatureRequest | null>(null);
  
  const [requestForm, setRequestForm] = useState<ESignatureRequestFormData>({
    signerEmail: '',
    signerName: '',
    message: 'Please review and sign the attached document.',
    expiresInDays: 7,
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests: SignatureRequest[] = [
      {
        id: '1',
        documentId: 'doc-123',
        documentName: 'Real Estate Purchase Agreement.pdf',
        signerEmail: 'john.smith@email.com',
        signerName: 'John Smith',
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        auditTrail: [
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'Signature Requested',
            details: 'Document sent for signature',
            ipAddress: '192.168.1.100',
          },
        ],
      },
      {
        id: '2',
        documentId: 'doc-124',
        documentName: 'Service Agreement.pdf',
        signerEmail: 'emma.davis@email.com',
        signerName: 'Emma Davis',
        status: 'signed',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        auditTrail: [
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'Signature Requested',
            details: 'Document sent for signature',
            ipAddress: '192.168.1.100',
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'Document Signed',
            details: 'Document successfully signed',
            ipAddress: '192.168.1.101',
          },
        ],
      },
    ];
    setSignatureRequests(mockRequests);
  }, []);

  const handleRequestSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create new signature request
      const newRequest: SignatureRequest = {
        id: Date.now().toString(),
        documentId: documentId || 'unknown',
        documentName: `Document-${Date.now()}.pdf`,
        signerEmail: requestForm.signerEmail,
        signerName: requestForm.signerName,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            action: 'Signature Requested',
            details: `Document sent to ${requestForm.signerEmail} for signature`,
            ipAddress: '192.168.1.100',
          },
        ],
      };

      setSignatureRequests(prev => [newRequest, ...prev]);
      setShowRequestForm(false);
      setRequestForm({
        signerEmail: '',
        signerName: '',
        message: 'Please review and sign the attached document.',
        expiresInDays: 7,
      });

      // In a real app, this would send an email notification
      alert(`Signature request sent to ${requestForm.signerEmail}`);
    } catch (error) {
      console.error('Error requesting signature:', error);
    }
  };

  const handleSign = async (requestId: string) => {
    if (!signature) {
      alert('Please provide your signature before continuing.');
      return;
    }

    try {
      // Update the signature request
      setSignatureRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                status: 'signed' as const,
                signedAt: new Date().toISOString(),
                signature,
                auditTrail: [
                  ...req.auditTrail,
                  {
                    timestamp: new Date().toISOString(),
                    action: 'Document Signed',
                    details: 'Document successfully signed',
                    ipAddress: '192.168.1.101',
                  },
                ],
              }
            : req
        )
      );

      setCurrentRequest(null);
      setSignature('');
      setMode('view');
      
      if (onComplete) {
        onComplete();
      }

      alert('Document signed successfully!');
    } catch (error) {
      console.error('Error signing document:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  if (mode === 'sign' && currentRequest) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Sign Document
          </CardTitle>
          <CardDescription>
            Please review and sign: {currentRequest.documentName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Document Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Document:</span>
                <p className="font-medium">{currentRequest.documentName}</p>
              </div>
              <div>
                <span className="text-gray-600">Requested:</span>
                <p>{formatDateTime(currentRequest.requestedAt)}</p>
              </div>
              <div>
                <span className="text-gray-600">Signer:</span>
                <p>{currentRequest.signerName}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p>{currentRequest.signerEmail}</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-4 block">
              Your Signature
            </Label>
            <SignatureCanvas onSignatureChange={setSignature} />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Legal Notice</h4>
            <p className="text-sm text-blue-800">
              By signing this document electronically, you agree that your electronic signature 
              is the legal equivalent of your manual signature and has the same legal effect.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => handleSign(currentRequest.id)}
              disabled={!signature}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Sign Document
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentRequest(null);
                setMode('view');
                setSignature('');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">E-Signature Management</h2>
          <p className="text-gray-600">Manage signature requests and signed documents</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Request Signature
        </Button>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Signature</CardTitle>
            <CardDescription>
              Send a document for electronic signature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestSignature} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signerName">Signer Name *</Label>
                  <Input
                    id="signerName"
                    value={requestForm.signerName}
                    onChange={(e) => setRequestForm({ ...requestForm, signerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signerEmail">Signer Email *</Label>
                  <Input
                    id="signerEmail"
                    type="email"
                    value={requestForm.signerEmail}
                    onChange={(e) => setRequestForm({ ...requestForm, signerEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="expiresInDays">Expires in (days)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  max="30"
                  value={requestForm.expiresInDays}
                  onChange={(e) => setRequestForm({ ...requestForm, expiresInDays: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Send Request
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Signature Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Requests ({signatureRequests.length})</CardTitle>
          <CardDescription>
            Track the status of your signature requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signatureRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No signature requests yet. Create your first request to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {signatureRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <h3 className="font-medium">{request.documentName}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{request.signerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{request.signerEmail}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Requested: {formatDateTime(request.requestedAt)}</span>
                          </div>
                          {request.signedAt && (
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Signed: {formatDateTime(request.signedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {request.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCurrentRequest(request);
                              setMode('sign');
                            }}
                          >
                            <PenTool className="h-3 w-3 mr-1" />
                            Sign
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
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
    </div>
  );
};

export default ESignature;