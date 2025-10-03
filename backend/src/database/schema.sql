-- CRM Database Schema
-- Clean and modern CRM system for Real Estate and Dental practices

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'assistant');
CREATE TYPE industry_type AS ENUM ('real_estate', 'dental');
CREATE TYPE contact_status AS ENUM ('lead', 'prospect', 'client', 'inactive');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE pipeline_stage AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'treatment_plan', 'property_listing', 'template');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE email_status AS ENUM ('draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced');

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry industry_type NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    settings JSONB DEFAULT '{}',
    gdpr_enabled BOOLEAN DEFAULT true,
    hipaa_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    status contact_status DEFAULT 'lead',
    source VARCHAR(100),
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    gdpr_consent BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales pipelines table
CREATE TABLE sales_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stages TEXT[] NOT NULL DEFAULT ARRAY['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES sales_pipelines(id),
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    stage pipeline_stage DEFAULT 'new',
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    is_won BOOLEAN,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location TEXT,
    meeting_link TEXT,
    status appointment_status DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT false,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    deal_id UUID REFERENCES deals(id),
    uploaded_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    document_type document_type,
    is_template BOOLEAN DEFAULT false,
    template_variables JSONB DEFAULT '{}',
    is_signed BOOLEAN DEFAULT false,
    signature_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email campaigns table
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status campaign_status DEFAULT 'draft',
    send_at TIMESTAMP,
    sent_at TIMESTAMP,
    recipient_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email logs table
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id),
    contact_id UUID REFERENCES contacts(id),
    email VARCHAR(255) NOT NULL,
    status email_status DEFAULT 'draft',
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounce_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table (Real Estate specific)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES users(id),
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    property_type VARCHAR(50),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    lot_size DECIMAL(10,2),
    year_built INTEGER,
    listing_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    mls_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available',
    description TEXT,
    features TEXT[],
    images TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property visits table (Real Estate specific)
CREATE TABLE property_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    contact_id UUID REFERENCES contacts(id),
    scheduled_by UUID REFERENCES users(id),
    visit_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commissions table (Real Estate specific)
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id),
    agent_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    commission_rate DECIMAL(5,4) NOT NULL,
    gross_commission DECIMAL(12,2) NOT NULL,
    net_commission DECIMAL(12,2) NOT NULL,
    splits JSONB DEFAULT '{}',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table (Dental specific)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) UNIQUE,
    patient_id VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_id VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    medical_history JSONB DEFAULT '{}',
    allergies TEXT[],
    medications TEXT[],
    hipaa_consent BOOLEAN DEFAULT false,
    hipaa_consent_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment plans table (Dental specific)
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_cost DECIMAL(10,2),
    insurance_coverage DECIMAL(10,2) DEFAULT 0,
    patient_portion DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'proposed',
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment procedures table (Dental specific)
CREATE TABLE treatment_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_plan_id UUID REFERENCES treatment_plans(id),
    procedure_code VARCHAR(20),
    procedure_name VARCHAR(255) NOT NULL,
    tooth_number VARCHAR(10),
    surface VARCHAR(20),
    cost DECIMAL(8,2) NOT NULL,
    insurance_coverage DECIMAL(8,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'planned',
    scheduled_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recall reminders table (Dental specific)
CREATE TABLE recall_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    reminder_type VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    sent_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics tables
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX idx_appointments_assigned_to ON appointments(assigned_to);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_contact_id ON documents(contact_id);
CREATE INDEX idx_properties_organization_id ON properties(organization_id);
CREATE INDEX idx_properties_assigned_to ON properties(assigned_to);
CREATE INDEX idx_patients_organization_id ON patients(organization_id);
CREATE INDEX idx_patients_contact_id ON patients(contact_id);