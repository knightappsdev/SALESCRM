export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'agent' | 'assistant';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  industry: 'real_estate' | 'dental';
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  settings: Record<string, any>;
  gdprEnabled: boolean;
  hipaaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  organizationId: string;
  assignedTo?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'lead' | 'prospect' | 'client' | 'inactive';
  source?: string;
  tags: string[];
  notes?: string;
  customFields: Record<string, any>;
  gdprConsent: boolean;
  gdprConsentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  organizationId: string;
  pipelineId?: string;
  contactId?: string;
  assignedTo?: string;
  title: string;
  description?: string;
  value?: number;
  currency: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  isWon?: boolean;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  organizationId: string;
  contactId?: string;
  assignedTo?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reminderSent: boolean;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  organizationId: string;
  contactId?: string;
  dealId?: string;
  uploadedBy?: string;
  name: string;
  originalName?: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  documentType?: 'contract' | 'invoice' | 'treatment_plan' | 'property_listing' | 'template';
  isTemplate: boolean;
  templateVariables: Record<string, any>;
  isSigned: boolean;
  signatureData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  organizationId: string;
  contactId?: string;
  assignedTo?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  listingPrice?: number;
  salePrice?: number;
  mlsNumber?: string;
  status: string;
  description?: string;
  features: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  organizationId: string;
  contactId: string;
  patientId?: string;
  dateOfBirth?: Date;
  gender?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory: Record<string, any>;
  allergies: string[];
  medications: string[];
  hipaaConsent: boolean;
  hipaaConsentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  createdBy?: string;
  name: string;
  description?: string;
  totalCost?: number;
  insuranceCoverage: number;
  patientPortion?: number;
  status: string;
  approvedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}