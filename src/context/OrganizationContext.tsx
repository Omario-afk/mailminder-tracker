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
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      
      const mappedOrg: Organization = {
        id: org.id,
        name: org.name,
        directorId: org.director_id,
        description: org.description || undefined,
        createdAt: new Date(org.created_at),
        updatedAt: new Date(org.updated_at)
      };
      
      setCurrentOrganization(mappedOrg);

      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('org_id', organizationId);

      if (membersError) throw membersError;
      
      const mappedMembers: OrganizationMember[] = (membersData || []).map(m => ({
        id: m.id,
        userId: m.user_id,
        orgId: m.org_id,
        role: m.role as 'admin' | 'member',
        joinedAt: new Date(m.joined_at)
      }));
      
      setMembers(mappedMembers);

      setTemplates([]);
      setMailItems([]);
      setConnections([]);
      
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
    
    const newOrg: Organization = {
      id: data.id,
      name: data.name,
      directorId: data.director_id,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    setOrganizations([...organizations, newOrg]);
    setCurrentOrganization(newOrg);
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    const { error } = await supabase
      .from('organizations')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    if (user?.organizationId) {
      fetchOrganizationData(id);
    }
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
    
    const mockUserId = `mock-${Date.now()}`;
    
    const { error } = await supabase
      .from('organization_members')
      .insert({
        user_id: mockUserId,
        org_id: currentOrganization.id,
        role,
      });

    if (error) throw error;
    if (currentOrganization) {
      fetchOrganizationData(currentOrganization.id);
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    const { error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId);

    if (error) throw error;
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
    if (currentOrganization) {
      fetchOrganizationData(currentOrganization.id);
    }
  };

  const createTemplate = async (name: string, description?: string, isNetworkShared: boolean = false) => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const newTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      isNetworkShared,
      orgId: currentOrganization.id,
      properties: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = async (id: string, data: any) => {
    const updatedTemplates = templates.map(template => 
      template.id === id ? { ...template, ...data, updatedAt: new Date() } : template
    );
    
    setTemplates(updatedTemplates);
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const createMailItem = async (templateId: string, properties: Record<string, string>) => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const newMailItem = {
      id: `mail-${Date.now()}`,
      templateId,
      properties,
      orgId: currentOrganization.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setMailItems([...mailItems, newMailItem]);
  };

  const deleteMailItem = async (id: string) => {
    setMailItems(mailItems.filter(item => item.id !== id));
  };

  const createConnection = async (organizationId: string) => {
    if (!currentOrganization) throw new Error('No organization selected');
    
    const newConnection = {
      id: `connection-${Date.now()}`,
      orgId: currentOrganization.id,
      connectedOrgId: organizationId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConnections([...connections, newConnection]);
  };

  const deleteConnection = async (id: string) => {
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
