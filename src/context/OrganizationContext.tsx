import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, OrganizationMember } from '@/types';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  templates: any[];
  mailItems: any[];
  connections: any[];
  loading: boolean;
  error: string | null;
  createOrganization: (name: string, description?: string) => Promise<void>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  inviteMember: (email: string, role: 'admin' | 'member') => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  createTemplate: (name: string, description?: string, isNetworkShared?: boolean) => Promise<void>;
  updateTemplate: (id: string, data: any) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  createMailItem: (templateId: string, properties: Record<string, string>) => Promise<void>;
  deleteMailItem: (id: string) => Promise<void>;
  createConnection: (organizationId: string) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [mailItems, setMailItems] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.organizationId) {
      fetchOrganizationData(user.organizationId);
    }
  }, [user?.organizationId]);

  const fetchOrganizationData = async (organizationId: string) => {
    try {
      setLoading(true);
      // Fetch organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      setCurrentOrganization(org);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('org_id', organizationId);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .eq('organization_id', organizationId);

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Fetch mail items
      const { data: mailData, error: mailError } = await supabase
        .from('mail_items')
        .select('*')
        .eq('organization_id', organizationId);

      if (mailError) throw mailError;
      setMailItems(mailData || []);

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('organization_connections')
        .select('*')
        .eq('organization_id', organizationId);

      if (connectionsError) throw connectionsError;
      setConnections(connectionsData || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        description,
        director_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setOrganizations([...organizations, data]);
    setCurrentOrganization(data);
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    const { error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    // Refresh organization data
    fetchOrganizationData(id);
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setOrganizations(organizations.filter(org => org.id !== id));
    setCurrentOrganization(null);
  };

  const inviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const { error } = await supabase
      .from('organization_members')
      .insert({
        email,
        role,
        org_id: currentOrganization.id,
      });

    if (error) throw error;
    // Refresh members
    fetchOrganizationData(currentOrganization.id);
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId);

    if (error) throw error;
    // Refresh members
    if (currentOrganization) {
      fetchOrganizationData(currentOrganization.id);
    }
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    // Refresh members
    if (currentOrganization) {
      fetchOrganizationData(currentOrganization.id);
    }
  };

  const createTemplate = async (name: string, description?: string, isNetworkShared: boolean = false) => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        is_network_shared: isNetworkShared,
        organization_id: currentOrganization.id,
      })
      .select()
      .single();

    if (error) throw error;
    setTemplates([...templates, data]);
  };

  const updateTemplate = async (id: string, data: any) => {
    const { error } = await supabase
      .from('templates')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    // Refresh templates
    if (currentOrganization) {
      fetchOrganizationData(currentOrganization.id);
    }
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setTemplates(templates.filter(template => template.id !== id));
  };

  const createMailItem = async (templateId: string, properties: Record<string, string>) => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const { data, error } = await supabase
      .from('mail_items')
      .insert({
        template_id: templateId,
        properties,
        organization_id: currentOrganization.id,
      })
      .select()
      .single();

    if (error) throw error;
    setMailItems([...mailItems, data]);
  };

  const deleteMailItem = async (id: string) => {
    const { error } = await supabase
      .from('mail_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setMailItems(mailItems.filter(item => item.id !== id));
  };

  const createConnection = async (organizationId: string) => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const { data, error } = await supabase
      .from('organization_connections')
      .insert({
        organization_id: currentOrganization.id,
        connected_organization_id: organizationId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    setConnections([...connections, data]);
  };

  const deleteConnection = async (id: string) => {
    const { error } = await supabase
      .from('organization_connections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setConnections(connections.filter(conn => conn.id !== id));
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        members,
        templates,
        mailItems,
        connections,
        loading,
        error,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        inviteMember,
        updateMemberRole,
        removeMember,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        createMailItem,
        deleteMailItem,
        createConnection,
        deleteConnection,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}; 