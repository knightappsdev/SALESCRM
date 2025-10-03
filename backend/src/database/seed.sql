-- Seed data for CRM system
-- This creates sample organizations, users, and data for testing

-- Insert organizations
INSERT INTO organizations (id, name, industry, address, phone, email, website, gdpr_enabled, hipaa_enabled) VALUES
(uuid_generate_v4(), 'Premium Real Estate Group', 'real_estate', '123 Main St, New York, NY 10001', '+1 (555) 123-4567', 'info@premiumrealestate.com', 'https://premiumrealestate.com', true, false),
(uuid_generate_v4(), 'Smile Dental Clinic', 'dental', '456 Oak Ave, Los Angeles, CA 90001', '+1 (555) 987-6543', 'hello@smiledentalclinic.com', 'https://smiledentalclinic.com', true, true);

-- Get organization IDs for reference
DO $$
DECLARE
    real_estate_org_id UUID;
    dental_org_id UUID;
    admin_user_id UUID;
    agent_user_id UUID;
    dental_admin_id UUID;
    contact1_id UUID;
    contact2_id UUID;
    contact3_id UUID;
    patient_contact_id UUID;
BEGIN
    -- Get organization IDs
    SELECT id INTO real_estate_org_id FROM organizations WHERE industry = 'real_estate' LIMIT 1;
    SELECT id INTO dental_org_id FROM organizations WHERE industry = 'dental' LIMIT 1;

    -- Insert users for real estate organization
    INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, phone) VALUES
    (uuid_generate_v4(), real_estate_org_id, 'admin@realestate.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfVcsL2uyMB.PN6', 'Sarah', 'Johnson', 'admin', '+1 (555) 111-2222'), -- password: password123
    (uuid_generate_v4(), real_estate_org_id, 'agent@realestate.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfVcsL2uyMB.PN6', 'Mike', 'Wilson', 'agent', '+1 (555) 333-4444'),
    (uuid_generate_v4(), real_estate_org_id, 'assistant@realestate.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfVcsL2uyMB.PN6', 'Emma', 'Davis', 'assistant', '+1 (555) 555-6666');

    -- Insert users for dental organization
    INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, phone) VALUES
    (uuid_generate_v4(), dental_org_id, 'admin@dental.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfVcsL2uyMB.PN6', 'Dr. Lisa', 'Martinez', 'admin', '+1 (555) 777-8888'), -- password: password123
    (uuid_generate_v4(), dental_org_id, 'hygienist@dental.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfVcsL2uyMB.PN6', 'Jennifer', 'Brown', 'agent', '+1 (555) 999-0000'),
    (uuid_generate_v4(), dental_org_id, 'receptionist@dental.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfVcsL2uyMB.PN6', 'Amanda', 'Taylor', 'assistant', '+1 (555) 111-3333');

    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@realestate.com' LIMIT 1;
    SELECT id INTO agent_user_id FROM users WHERE email = 'agent@realestate.com' LIMIT 1;
    SELECT id INTO dental_admin_id FROM users WHERE email = 'admin@dental.com' LIMIT 1;

    -- Insert default sales pipeline for real estate
    INSERT INTO sales_pipelines (organization_id, name, stages, is_default) VALUES
    (real_estate_org_id, 'Real Estate Sales Pipeline', ARRAY['new', 'contacted', 'qualified', 'viewing_scheduled', 'offer_made', 'negotiation', 'closed_won', 'closed_lost'], true);

    -- Insert default sales pipeline for dental
    INSERT INTO sales_pipelines (organization_id, name, stages, is_default) VALUES
    (dental_org_id, 'Dental Treatment Pipeline', ARRAY['new', 'consultation', 'treatment_plan', 'approved', 'in_progress', 'completed', 'follow_up'], true);

    -- Insert sample contacts for real estate
    INSERT INTO contacts (id, organization_id, assigned_to, first_name, last_name, email, phone, address, status, source, tags, notes, gdpr_consent) VALUES
    (uuid_generate_v4(), real_estate_org_id, admin_user_id, 'John', 'Smith', 'john.smith@email.com', '+1 (555) 123-4567', '789 Elm St, Brooklyn, NY 11201', 'lead', 'Website', ARRAY['first-time-buyer', 'budget-500k'], 'Interested in 2-bedroom condo in Brooklyn', true),
    (uuid_generate_v4(), real_estate_org_id, agent_user_id, 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '+1 (555) 234-5678', '321 Pine St, Queens, NY 11375', 'prospect', 'Referral', ARRAY['investor', 'commercial'], 'Looking for investment properties', true),
    (uuid_generate_v4(), real_estate_org_id, admin_user_id, 'Robert', 'Brown', 'robert.brown@email.com', '+1 (555) 345-6789', '654 Maple Ave, Manhattan, NY 10001', 'client', 'Cold Call', ARRAY['luxury', 'seller'], 'Selling luxury apartment', true);

    -- Insert sample contacts for dental
    INSERT INTO contacts (id, organization_id, assigned_to, first_name, last_name, email, phone, address, status, source, tags, notes, gdpr_consent) VALUES
    (uuid_generate_v4(), dental_org_id, dental_admin_id, 'Maria', 'Garcia', 'maria.garcia@email.com', '+1 (555) 456-7890', '987 Cedar St, Los Angeles, CA 90210', 'client', 'Website', ARRAY['regular-checkup', 'insurance'], 'Regular patient, due for cleaning', true);

    -- Get contact IDs
    SELECT id INTO contact1_id FROM contacts WHERE email = 'john.smith@email.com' LIMIT 1;
    SELECT id INTO contact2_id FROM contacts WHERE email = 'emily.rodriguez@email.com' LIMIT 1;
    SELECT id INTO contact3_id FROM contacts WHERE email = 'robert.brown@email.com' LIMIT 1;
    SELECT id INTO patient_contact_id FROM contacts WHERE email = 'maria.garcia@email.com' LIMIT 1;

    -- Insert sample deals for real estate
    INSERT INTO deals (organization_id, contact_id, assigned_to, title, description, value, currency, stage, probability, expected_close_date) VALUES
    (real_estate_org_id, contact1_id, admin_user_id, 'Brooklyn Condo Sale', '2BR condo in trendy Brooklyn neighborhood', 475000.00, 'USD', 'qualified', 60, '2024-03-15'),
    (real_estate_org_id, contact2_id, agent_user_id, 'Investment Property Portfolio', 'Multi-unit investment opportunity', 1250000.00, 'USD', 'proposal', 40, '2024-04-30'),
    (real_estate_org_id, contact3_id, admin_user_id, 'Luxury Manhattan Listing', 'High-end apartment sale', 2100000.00, 'USD', 'negotiation', 80, '2024-02-28');

    -- Insert sample appointments
    INSERT INTO appointments (organization_id, contact_id, assigned_to, title, description, start_time, end_time, location, status) VALUES
    (real_estate_org_id, contact1_id, admin_user_id, 'Property Viewing - Brooklyn Condo', 'Show 2BR condo to potential buyer', '2024-01-25 14:00:00', '2024-01-25 15:00:00', '789 Elm St, Brooklyn, NY 11201', 'scheduled'),
    (real_estate_org_id, contact2_id, agent_user_id, 'Investment Property Discussion', 'Discuss investment strategy and financing options', '2024-01-26 10:00:00', '2024-01-26 11:30:00', 'Office - Conference Room A', 'confirmed'),
    (dental_org_id, patient_contact_id, dental_admin_id, 'Regular Cleaning Appointment', 'Routine dental cleaning and checkup', '2024-01-27 09:00:00', '2024-01-27 10:00:00', 'Smile Dental Clinic', 'scheduled');

    -- Insert sample properties for real estate
    INSERT INTO properties (organization_id, contact_id, assigned_to, address, city, state, zip_code, property_type, bedrooms, bathrooms, square_feet, listing_price, status, description, features) VALUES
    (real_estate_org_id, contact1_id, admin_user_id, '789 Elm St, Unit 4B', 'Brooklyn', 'NY', '11201', 'Condo', 2, 1.5, 1200, 475000.00, 'active', 'Beautiful 2-bedroom condo with city views', ARRAY['hardwood-floors', 'dishwasher', 'elevator', 'gym']),
    (real_estate_org_id, contact2_id, agent_user_id, '123 Investment Blvd', 'Queens', 'NY', '11375', 'Multi-Family', 8, 4.0, 6500, 1250000.00, 'active', '4-unit investment property with stable rental income', ARRAY['separate-utilities', 'parking', 'laundry', 'renovated']),
    (real_estate_org_id, contact3_id, admin_user_id, '456 Luxury Ave, Penthouse', 'Manhattan', 'NY', '10001', 'Penthouse', 3, 3.0, 2800, 2100000.00, 'pending', 'Stunning penthouse with panoramic city views', ARRAY['terrace', 'doorman', 'concierge', 'wine-cellar', 'smart-home']);

    -- Insert patient record for dental
    INSERT INTO patients (organization_id, contact_id, patient_id, date_of_birth, gender, insurance_provider, insurance_id, medical_history, allergies, hipaa_consent) VALUES
    (dental_org_id, patient_contact_id, 'PAT-001', '1985-03-15', 'Female', 'Delta Dental', 'DD123456789', '{"previous_procedures": ["cleaning", "filling"], "last_visit": "2023-07-15"}', ARRAY['penicillin'], true);

    -- Insert sample treatment plan
    INSERT INTO treatment_plans (patient_id, created_by, name, description, total_cost, insurance_coverage, patient_portion, status) VALUES
    ((SELECT id FROM patients WHERE patient_id = 'PAT-001' LIMIT 1), dental_admin_id, 'Routine Cleaning & Checkup', 'Regular dental maintenance', 200.00, 160.00, 40.00, 'approved');

    RAISE NOTICE 'Seed data inserted successfully';
END $$;