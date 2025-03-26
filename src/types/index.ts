export type UserRole = 'director' | 'admin' | 'member';
export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'MANAGE_USERS' | 'MANAGE_TEMPLATES';
export type MailStatus = 'sent' | 'received' | 'in-transit';
export type NetworkConnectionStatus = 'pending' | 'active' | 'blocked';
export type PropertyType = 'text' | 'number' | 'date' | 'dropdown';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  organizationId?: string;
  permissions: Permission[];
  language?: string;
};

export type Organization = {
  id: string;
  name: string;
  directorId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationMember = {
  id: string;
  userId: string;
  orgId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
};

export type MailPropertyTemplate = {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  isNetworkShared: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MailPropertyDefinition = {
  id: string;
  templateId: string;
  name: string;
  type: PropertyType;
  isRequired: boolean;
  options?: string[]; // For dropdown type
  createdAt: Date;
  updatedAt: Date;
};

export type NetworkConnection = {
  id: string;
  orgId1: string;
  orgId2: string;
  status: NetworkConnectionStatus;
  sharedTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MailEntry = {
  id: string;
  orgId: string;
  templateId: string;
  senderId: string;
  recipientName?: string;
  recipientAddress?: string;
  trackingNumber?: string;
  status: MailStatus;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MailPropertyValue = {
  id: string;
  mailId: string;
  propertyDefId: string;
  value?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Omit<OrganizationMember, 'id' | 'joinedAt'>;
        Update: Partial<Omit<OrganizationMember, 'id' | 'joinedAt'>>;
      };
      mail_property_templates: {
        Row: MailPropertyTemplate;
        Insert: Omit<MailPropertyTemplate, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<MailPropertyTemplate, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      mail_property_definitions: {
        Row: MailPropertyDefinition;
        Insert: Omit<MailPropertyDefinition, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<MailPropertyDefinition, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      network_connections: {
        Row: NetworkConnection;
        Insert: Omit<NetworkConnection, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<NetworkConnection, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      mail_entries: {
        Row: MailEntry;
        Insert: Omit<MailEntry, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<MailEntry, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      mail_property_values: {
        Row: MailPropertyValue;
        Insert: Omit<MailPropertyValue, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<MailPropertyValue, 'id' | 'createdAt' | 'updatedAt'>>;
      };
    };
  };
};
