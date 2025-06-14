-- Supabase Schema for MediatorPro

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Cases Table
-- Stores information about legal cases or mediations.
-- -----------------------------------------------------------------------------
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the user who owns/created the case
    case_file_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open', -- e.g., 'Open', 'Closed', 'Pending'
    parties TEXT[], -- Array of involved party names or references (consider a join table for complex party management)
    description TEXT,
    case_type TEXT, -- e.g., 'Divorce', 'Civil', 'Family'
    client_name TEXT, -- Consider linking to a primary contact in the Contacts table instead
    email TEXT, -- Consider linking to a primary contact
    phone TEXT, -- Consider linking to a primary contact
    address TEXT, -- Consider linking to a primary contact
    intake_form JSONB, -- Store intake form data
    case_file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_case_file_number ON public.cases(case_file_number);

-- -----------------------------------------------------------------------------
-- Contacts Table
-- Stores information about contacts (Clients, Attorneys, Witnesses, etc.).
-- -----------------------------------------------------------------------------
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the user who owns/created the contact
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT,
    contact_type TEXT NOT NULL, -- e.g., 'Client', 'Attorney', 'Mediator'
    linked_case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL, -- Optional: Link to a primary case
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_type ON public.contacts(contact_type);

-- -----------------------------------------------------------------------------
-- CaseFileMetadata Table (for Documents/Files)
-- Stores metadata for files and folders associated with cases.
-- Actual file blobs should be stored in Supabase Storage.
-- -----------------------------------------------------------------------------
CREATE TABLE public.case_file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.case_file_metadata(id) ON DELETE CASCADE, -- For folder structure
    item_type TEXT NOT NULL, -- 'file' or 'folder' or specific MIME type for files
    name TEXT NOT NULL,
    storage_path TEXT, -- Path to the file in Supabase Storage (for type 'file')
    file_type TEXT, -- e.g., 'application/pdf', 'image/jpeg' (only for files)
    size BIGINT, -- File size in bytes (only for files)
    is_deleted BOOLEAN DEFAULT FALSE,
    last_modified_at TIMESTAMPTZ, -- From File object, or when the storage object was last modified
    description TEXT,
    tags TEXT[],
    access_control TEXT DEFAULT 'private', -- 'private', 'shared'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.case_file_metadata ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_case_file_metadata_user_id ON public.case_file_metadata(user_id);
CREATE INDEX idx_case_file_metadata_case_id ON public.case_file_metadata(case_id);
CREATE INDEX idx_case_file_metadata_parent_id ON public.case_file_metadata(parent_id);
CREATE INDEX idx_case_file_metadata_name ON public.case_file_metadata(name);

-- -----------------------------------------------------------------------------
-- Tasks Table
-- Stores tasks related to cases or general tasks.
-- -----------------------------------------------------------------------------
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who created or is assigned the task
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE, -- Link task to a specific case
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Todo', -- 'Todo', 'In Progress', 'Done', 'Blocked'
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    due_date TIMESTAMPTZ,
    assigned_to_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL, -- Link to a contact
    -- assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Alternative: if tasks assigned to app users
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- -----------------------------------------------------------------------------
-- Documents Table (General Purpose Documents/Templates, distinct from Case Files)
-- Stores structured documents, templates, or rich text notes not directly tied to file storage.
-- -----------------------------------------------------------------------------
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL, -- Optional: Link document to a specific case
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- e.g., 'Agreement Template', 'General Notes', 'Procedure Guide'
    content JSONB, -- Could be structured data (e.g., for a template) or rich text (e.g., Quill delta)
    storage_ref_if_applicable TEXT, -- If this document primarily points to a CaseFileMetadata entry
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);

-- -----------------------------------------------------------------------------
-- Notes Table
-- Stores notes, often linked to a specific case.
-- -----------------------------------------------------------------------------
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL, -- The actual note text
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_case_id ON public.notes(case_id);

-- -----------------------------------------------------------------------------
-- TimelineEvents Table
-- Represents an event in the timeline of a case.
-- -----------------------------------------------------------------------------
CREATE TABLE public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'hearing', 'filing', 'client-meeting', 'deadline'
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX idx_timeline_events_case_id ON public.timeline_events(case_id);
CREATE INDEX idx_timeline_events_event_date ON public.timeline_events(event_date);

-- -----------------------------------------------------------------------------
-- Meetings Table
-- Stores information about meetings or appointments.
-- -----------------------------------------------------------------------------
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ, -- Calculated from start_time + duration or set directly
    duration_minutes INTEGER, -- Duration in minutes
    location TEXT, -- Physical or virtual (e.g., "Zoom Link")
    participants_contacts UUID[] DEFAULT '{}', -- Array of Contact IDs
    -- participants_text TEXT[], -- Alternative: Array of participant names as text if not linking to contacts
    agenda TEXT, -- Markdown or plain text
    meeting_notes TEXT, -- Markdown or plain text, for minutes or action items
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_case_id ON public.meetings(case_id);
CREATE INDEX idx_meetings_start_time ON public.meetings(start_time);

-- -----------------------------------------------------------------------------
-- SavedForms Table
-- Stores instances of saved forms or questionnaires.
-- -----------------------------------------------------------------------------
CREATE TABLE public.saved_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL, -- Optional: if form is case-specific
    form_title TEXT NOT NULL,
    form_description TEXT,
    statement_date DATE,
    sections JSONB NOT NULL, -- Stores the dynamic structure and data of the form
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.saved_forms ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_saved_forms_user_id ON public.saved_forms(user_id);
CREATE INDEX idx_saved_forms_case_id ON public.saved_forms(case_id);

-- -----------------------------------------------------------------------------
-- ChecklistItems Table
-- Represents an item in a case checklist.
-- -----------------------------------------------------------------------------
CREATE TABLE public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    category TEXT, -- Optional category for the item (e.g., "intake", "agreement")
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_checklist_items_user_id ON public.checklist_items(user_id);
CREATE INDEX idx_checklist_items_case_id ON public.checklist_items(case_id);
CREATE INDEX idx_checklist_items_completed ON public.checklist_items(completed);

-- -----------------------------------------------------------------------------
-- AppCounters Table (Example from models.ts, utility table)
-- For managing app-wide counters if needed, e.g., custom sequential IDs.
-- Note: For caseFileNumber, it's generally better to ensure uniqueness via application logic
-- or database constraints rather than a simple counter if it needs to be non-sequential or complex.
-- -----------------------------------------------------------------------------
CREATE TABLE public.app_counters (
    id TEXT PRIMARY KEY, -- e.g., 'caseFileNumberSeed'
    current_value BIGINT NOT NULL
);
ALTER TABLE public.app_counters ENABLE ROW LEVEL SECURITY;
-- RLS for app_counters would typically be restrictive, perhaps only allowing updates via security definer functions.

-- After creating tables, you should:
-- 1. Review and adjust data types, constraints, and relationships as needed.
-- 2. Define Row Level Security (RLS) policies for each table to control data access.
--    Example RLS policy for users to manage their own cases:
--    CREATE POLICY "Users can manage their own cases"
--    ON public.cases
--    FOR ALL
--    USING (auth.uid() = user_id)
--    WITH CHECK (auth.uid() = user_id);
-- 3. Consider creating database functions (e.g., for complex queries or mutations) if needed.
-- 4. Regenerate Supabase types: npx supabase gen types typescript --project-id <your-project-id> --schema public > src/types/supabase.ts

-- -----------------------------------------------------------------------------
-- UserProfile Table
-- Stores user-specific profile information beyond what auth.users provides.
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT, -- URL to avatar image in Supabase Storage
    job_title TEXT,
    phone_number TEXT,
    address JSONB, -- { street: '', city: '', state: '', postal_code: '', country: '' }
    bio TEXT,
    website_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

-- RLS: Users can manage their own profile.
CREATE POLICY "Users can manage their own profile" 
ON public.user_profiles 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- BrandingSettings Table
-- Stores branding settings for a user or a workspace/organization.
-- Assuming one branding setting per user for simplicity.
-- -----------------------------------------------------------------------------
CREATE TABLE public.branding_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    logo_url TEXT, -- URL to logo image in Supabase Storage
    primary_color TEXT, -- e.g., hex code #RRGGBB
    secondary_color TEXT,
    font_family TEXT,
    theme_preference TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    custom_css TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_branding_settings_user_id ON public.branding_settings(user_id);

-- RLS: Users can manage their own branding settings.
CREATE POLICY "Users can manage their own branding settings" 
ON public.branding_settings 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- BillingSettings Table
-- Stores billing-related settings for a user.
-- -----------------------------------------------------------------------------
CREATE TABLE public.billing_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT,
    tax_id TEXT,
    billing_address JSONB, -- { street: '', city: '', state: '', postal_code: '', country: '' }
    payment_method_details JSONB, -- Store non-sensitive details, e.g., card type, last4. Actual payment processing via Stripe/etc.
    default_currency TEXT DEFAULT 'USD',
    invoice_footer_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.billing_settings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_billing_settings_user_id ON public.billing_settings(user_id);

-- RLS: Users can manage their own billing settings.
CREATE POLICY "Users can manage their own billing settings" 
ON public.billing_settings 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- NotificationSettings Table
-- Stores user preferences for various notification types.
-- -----------------------------------------------------------------------------
CREATE TABLE public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications JSONB DEFAULT '{ "new_case_assigned": true, "task_due": true, "meeting_reminder": true, "new_document_shared": true }'::jsonb,
    in_app_notifications JSONB DEFAULT '{ "new_message": true, "task_update": true }'::jsonb,
    sms_notifications JSONB DEFAULT '{ "urgent_alerts": false }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
-- Example JSONB structure: { "notification_type_1": true, "notification_type_2": false }
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);

-- RLS: Users can manage their own notification settings.
CREATE POLICY "Users can manage their own notification settings" 
ON public.notification_settings 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Subscriptions Table
-- Stores user subscription status (e.g., to a plan via Stripe).
-- -----------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE, -- Stripe customer ID
    stripe_subscription_id TEXT UNIQUE, -- Stripe subscription ID
    plan_id TEXT, -- Your internal plan identifier (e.g., 'free', 'pro', 'enterprise')
    status TEXT, -- e.g., 'active', 'canceled', 'past_due', 'trialing'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- RLS: Users can view their own subscription. Management (updates/cancels) often handled by webhooks or admin.
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role to manage subscriptions (e.g., via webhooks from Stripe)
CREATE POLICY "Service role can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- Integrations Table
-- Stores information about third-party integrations enabled by the user.
-- -----------------------------------------------------------------------------
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_name TEXT NOT NULL, -- e.g., 'Calendly', 'Google Calendar', 'Zoom', 'Stripe'
    is_enabled BOOLEAN DEFAULT TRUE,
    auth_details JSONB, -- Store tokens, API keys (encrypted if sensitive and not handled by Supabase Vault)
    settings JSONB, -- Integration-specific settings
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, integration_name) -- Ensure one entry per integration per user
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_user_integration_name ON public.integrations(user_id, integration_name);

-- RLS: Users can manage their own integrations.
CREATE POLICY "Users can manage their own integrations" 
ON public.integrations 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
