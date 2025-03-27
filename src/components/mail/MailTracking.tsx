
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MailOpen, Send, Search, Filter, ExternalLink, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MailEntry } from "@/types";

const MailTracking = () => {
  const [mailEntries, setMailEntries] = useState<MailEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MailEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;
    
    const fetchMailEntries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('mail_entries')
          .select(`
            *,
            sender:sender_id(email:auth.users(email)),
            organization:org_id(name),
            template:template_id(name)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const enhancedData = (data || []).map(entry => ({
          ...entry,
          senderEmail: entry.sender?.email || 'Unknown',
          organizationName: entry.organization?.name || 'Unknown',
          templateName: entry.template?.name || 'Unknown'
        })) as unknown as MailEntry[];
        
        setMailEntries(enhancedData);
        applyFilters(enhancedData, searchQuery, statusFilter, activeTab);
      } catch (error) {
        console.error("Error fetching mail entries:", error);
        toast.error("Failed to fetch mail entries");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMailEntries();
    
    // Subscribe to realtime updates for mail entries
    const mailSubscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'mail_entries' }, 
        () => {
          fetchMailEntries();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(mailSubscription);
    };
  }, [user]);
  
  const applyFilters = (
    entries: MailEntry[], 
    search: string, 
    status: string,
    tab: string
  ) => {
    let filtered = [...entries];
    
    // Apply tab filter (all, sent, received)
    if (tab === 'sent' && user) {
      filtered = filtered.filter(entry => entry.senderId === user.id);
    } else if (tab === 'received' && user) {
      filtered = filtered.filter(entry => entry.senderId !== user.id);
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(entry => entry.status === status);
    }
    
    // Apply search query
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.recipientName?.toLowerCase().includes(query) ||
        entry.recipientAddress?.toLowerCase().includes(query) ||
        entry.trackingNumber?.toLowerCase().includes(query) ||
        entry.senderEmail?.toLowerCase().includes(query) ||
        entry.organizationName?.toLowerCase().includes(query) ||
        entry.templateName?.toLowerCase().includes(query)
      );
    }
    
    setFilteredEntries(filtered);
  };
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    applyFilters(mailEntries, value, statusFilter, activeTab);
  };
  
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(mailEntries, searchQuery, value, activeTab);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    applyFilters(mailEntries, searchQuery, statusFilter, value);
  };
  
  const refreshData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mail_entries')
        .select(`
          *,
          sender:sender_id(email:auth.users(email)),
          organization:org_id(name),
          template:template_id(name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const enhancedData = (data || []).map(entry => ({
        ...entry,
        senderEmail: entry.sender?.email || 'Unknown',
        organizationName: entry.organization?.name || 'Unknown',
        templateName: entry.template?.name || 'Unknown'
      })) as unknown as MailEntry[];
      
      setMailEntries(enhancedData);
      applyFilters(enhancedData, searchQuery, statusFilter, activeTab);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'sent':
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
      case 'received':
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs";
      case 'in-transit':
        return "bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('mail.title')}</h1>
          <p className="text-muted-foreground">Track and manage mail documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate("/mail/send")}>
            <Send className="h-4 w-4 mr-2" />
            {t('mail.send')}
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('mail.search')}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                value={statusFilter} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t('mail.status')} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Mail</TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="h-4 w-4 mr-2" />
                Sent
              </TabsTrigger>
              <TabsTrigger value="received">
                <MailOpen className="h-4 w-4 mr-2" />
                Received
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <MailTable 
                entries={filteredEntries}
                loading={loading}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
            <TabsContent value="sent" className="mt-0">
              <MailTable 
                entries={filteredEntries}
                loading={loading}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
            <TabsContent value="received" className="mt-0">
              <MailTable 
                entries={filteredEntries}
                loading={loading}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};

interface MailTableProps {
  entries: MailEntry[];
  loading: boolean;
  getStatusBadgeClass: (status: string) => string;
}

const MailTable = ({ entries, loading, getStatusBadgeClass }: MailTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No mail entries found
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-medium text-sm">Document</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Sender</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Recipient</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Date</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{entry.templateName}</div>
                  <div className="text-xs text-muted-foreground">{entry.organizationName}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">{entry.senderEmail}</div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{entry.recipientName}</div>
                  <div className="text-xs text-muted-foreground">{entry.recipientAddress}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={getStatusBadgeClass(entry.status)}>
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View details</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MailTracking;
