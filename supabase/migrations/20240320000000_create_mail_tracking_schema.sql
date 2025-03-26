-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    director_id UUID NOT NULL REFERENCES auth.users(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Organization Membership
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    org_id UUID NOT NULL REFERENCES organizations(id),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, org_id)
);

-- Mail Property Templates
CREATE TABLE mail_property_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_network_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mail Property Definition
CREATE TABLE mail_property_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES mail_property_templates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'date', 'dropdown')),
    is_required BOOLEAN DEFAULT FALSE,
    options JSONB, -- For dropdown options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Network Connections
CREATE TABLE network_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id_1 UUID NOT NULL REFERENCES organizations(id),
    org_id_2 UUID NOT NULL REFERENCES organizations(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'blocked')),
    shared_template_id UUID REFERENCES mail_property_templates(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (org_id_1, org_id_2)
);

-- Mail Tracking
CREATE TABLE mail_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    template_id UUID NOT NULL REFERENCES mail_property_templates(id),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_name VARCHAR(255),
    recipient_address TEXT,
    tracking_number VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'received', 'in-transit')),
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mail Property Values
CREATE TABLE mail_property_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mail_id UUID NOT NULL REFERENCES mail_entries(id) ON DELETE CASCADE,
    property_def_id UUID NOT NULL REFERENCES mail_property_definitions(id),
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_property_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_property_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_property_values ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
CREATE POLICY "Users can view organizations they are members of"
    ON organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Directors can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (director_id = auth.uid());

CREATE POLICY "Directors can update their organizations"
    ON organizations FOR UPDATE
    USING (director_id = auth.uid());

-- Organization Members Policies
CREATE POLICY "Users can view organization members"
    ON organization_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members AS om
            WHERE om.org_id = organization_members.org_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Organization directors can manage members"
    ON organization_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE organizations.id = organization_members.org_id
            AND organizations.director_id = auth.uid()
        )
    );

-- Mail Property Templates Policies
CREATE POLICY "Users can view templates in their organizations"
    ON mail_property_templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = mail_property_templates.org_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can create templates"
    ON mail_property_templates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = mail_property_templates.org_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Mail Property Definitions Policies
CREATE POLICY "Users can view property definitions"
    ON mail_property_definitions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM mail_property_templates
            JOIN organization_members ON organization_members.org_id = mail_property_templates.org_id
            WHERE mail_property_templates.id = mail_property_definitions.template_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Network Connections Policies
CREATE POLICY "Users can view network connections"
    ON network_connections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE (organization_members.org_id = network_connections.org_id_1
                OR organization_members.org_id = network_connections.org_id_2)
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Organization directors can manage network connections"
    ON network_connections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE (organizations.id = network_connections.org_id_1
                OR organizations.id = network_connections.org_id_2)
            AND organizations.director_id = auth.uid()
        )
    );

-- Mail Entries Policies
CREATE POLICY "Users can view mail entries in their organizations"
    ON mail_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = mail_entries.org_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can create mail entries"
    ON mail_entries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = mail_entries.org_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Mail Property Values Policies
CREATE POLICY "Users can view property values"
    ON mail_property_values FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM mail_entries
            JOIN organization_members ON organization_members.org_id = mail_entries.org_id
            WHERE mail_entries.id = mail_property_values.mail_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mail_property_templates_updated_at
    BEFORE UPDATE ON mail_property_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mail_property_definitions_updated_at
    BEFORE UPDATE ON mail_property_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_connections_updated_at
    BEFORE UPDATE ON network_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mail_entries_updated_at
    BEFORE UPDATE ON mail_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mail_property_values_updated_at
    BEFORE UPDATE ON mail_property_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 